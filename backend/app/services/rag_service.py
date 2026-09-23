import logging
import os
from datetime import datetime, timezone
from typing import List, Optional, Tuple
import chromadb
from openai import OpenAI

from app.core.config import settings
from app.schemas.ai import KBArticleOut, RAGSuggestionResponse
from app.services.seed_data import KB_ARTICLES_DATA

logger = logging.getLogger(__name__)

_chroma_client: Optional[chromadb.ClientAPI] = None
_collection = None


def get_chroma_client():
    global _chroma_client, _collection
    if _chroma_client is None:
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        _collection = _chroma_client.get_or_create_collection(name="knowledge_base")
    return _chroma_client, _collection


def seed_chroma_kb(articles_data: Optional[List[dict]] = None):
    """Populates ChromaDB with knowledge base articles if empty."""
    _, collection = get_chroma_client()
    if collection.count() == 0:
        data = articles_data or KB_ARTICLES_DATA
        ids = [f"kb_{i}" for i in range(len(data))]
        documents = [f"{a['title']}\n{a['content']}" for a in data]
        metadatas = [{"title": a["title"], "category": a["category"]} for a in data]
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Seeded {len(data)} articles into ChromaDB collection.")


def retrieve_relevant_articles(query: str, top_k: int = 3) -> List[KBArticleOut]:
    """Retrieves top-k most relevant articles from ChromaDB."""
    _, collection = get_chroma_client()
    if collection.count() == 0:
        seed_chroma_kb()

    results = collection.query(
        query_texts=[query],
        n_results=min(top_k, collection.count())
    )

    articles = []
    if results and "documents" in results and results["documents"]:
        docs = results["documents"][0]
        metas = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else []
        distances = results["distances"][0] if "distances" in results and results["distances"] else []
        ids = results["ids"][0] if "ids" in results and results["ids"] else []

        for i, doc in enumerate(docs):
            meta = metas[i] if i < len(metas) else {}
            title = meta.get("title", doc.split("\n")[0])
            category = meta.get("category", "General")
            # Convert cosine distance to rough similarity score
            score = 1.0 - (distances[i] / 2.0) if i < len(distances) else 0.85
            articles.append(
                KBArticleOut(
                    id=ids[i] if i < len(ids) else f"kb_{i}",
                    title=title,
                    content=doc,
                    category=category,
                    similarity_score=round(score, 3)
                )
            )
    return articles


def _build_heuristic_reply(
    customer_name: str,
    ticket_title: str,
    ticket_description: str,
    sources: List[KBArticleOut]
) -> str:
    """Produces a helpful AI response using the retrieved KB chunks when LLM API is unavailable."""
    name = customer_name or "there"
    primary_source = sources[0] if sources else None

    lines = [
        f"Hi {name},",
        "",
        f"Thank you for contacting our support team regarding '{ticket_title}'.",
        "",
    ]

    if primary_source:
        lines.append(f"Based on our knowledge base regarding **{primary_source.title}**:")
        # Take key sentences from the primary source
        content_lines = primary_source.content.replace(primary_source.title, "").strip()
        lines.append(f"> {content_lines}")
        lines.append("")
        lines.append("Here are the recommended next steps:")
        lines.append("1. Follow the procedure outlined in the documentation above.")
        lines.append("2. If this is an urgent or blocking issue, our team has flagged this ticket for priority review.")
    else:
        lines.append(
            "We have received your request and our engineering & support specialists are currently reviewing it. "
            "We will follow up shortly with resolution details."
        )

    lines.extend([
        "",
        "Please let us know if you have any questions or if we can assist you with anything else!",
        "",
        "Best regards,",
        "Customer Support Team"
    ])
    return "\n".join(lines)


def generate_rag_suggestion(
    customer_name: str,
    ticket_title: str,
    ticket_description: str,
    ticket_category: str
) -> RAGSuggestionResponse:
    """
    RAG pipeline:
    1. Embed ticket title + description
    2. Retrieve top-3 relevant KB articles from ChromaDB
    3. Synthesize customer reply using LLM (with heuristic fallback)
    """
    query = f"{ticket_title} {ticket_description}"
    sources = retrieve_relevant_articles(query, top_k=3)

    api_key = settings.OPENAI_API_KEY or settings.GROQ_API_KEY
    base_url = settings.OPENAI_BASE_URL
    model = settings.OPENAI_MODEL

    if settings.GROQ_API_KEY and not settings.OPENAI_API_KEY and not base_url:
        base_url = "https://api.groq.com/openai/v1"
        model = settings.GROQ_MODEL

    now = datetime.now(timezone.utc)

    if not api_key:
        logger.info("No LLM API key; generating template-based RAG suggestion from KB sources.")
        draft = _build_heuristic_reply(customer_name, ticket_title, ticket_description, sources)
        return RAGSuggestionResponse(
            suggested_reply=draft,
            sources=sources,
            model_used="kb-retrieval-heuristic-v1",
            generated_at=now
        )

    try:
        client = OpenAI(api_key=api_key, base_url=base_url)

        context_blocks = []
        for i, s in enumerate(sources, 1):
            context_blocks.append(f"--- Article {i}: {s.title} ({s.category}) ---\n{s.content}")
        context_str = "\n\n".join(context_blocks)

        system_prompt = (
            "You are a professional, empathetic senior customer support agent. "
            "Your task is to write a helpful, polite, and accurate draft response to a customer's support ticket. "
            "Base your answer strictly on the provided Knowledge Base documentation excerpts. "
            "Address the customer by name, clearly explain the solution or policy, and provide clear step-by-step guidance. "
            "Keep the tone friendly and solution-oriented."
        )

        user_prompt = (
            f"Customer Name: {customer_name}\n"
            f"Ticket Title: {ticket_title}\n"
            f"Ticket Description: {ticket_description}\n"
            f"Ticket Category: {ticket_category}\n\n"
            f"Relevant Knowledge Base Articles:\n{context_str}\n\n"
            "Please draft a complete reply to send to the customer."
        )

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=400,
        )

        draft = response.choices[0].message.content or ""
        return RAGSuggestionResponse(
            suggested_reply=draft.strip(),
            sources=sources,
            model_used=model,
            generated_at=now
        )

    except Exception as e:
        logger.warning(f"LLM suggestion generation failed ({e}). Falling back to heuristic generator.")
        draft = _build_heuristic_reply(customer_name, ticket_title, ticket_description, sources)
        return RAGSuggestionResponse(
            suggested_reply=draft,
            sources=sources,
            model_used="fallback-heuristic",
            generated_at=now
        )


def upsert_article_vector(article_id: str, title: str, content: str, category: str) -> bool:
    """Adds or updates a knowledge base article embedding in ChromaDB."""
    try:
        _, collection = get_chroma_client()
        collection.upsert(
            ids=[f"kb_{article_id}"],
            documents=[f"{title}\n{content}"],
            metadatas=[{"title": title, "category": category}]
        )
        logger.info(f"Upserted vector for article {article_id} into ChromaDB.")
        return True
    except Exception as e:
        logger.error(f"Failed to upsert vector for article {article_id}: {e}")
        return False


def delete_article_vector(article_id: str) -> bool:
    """Removes a knowledge base article vector from ChromaDB."""
    try:
        _, collection = get_chroma_client()
        collection.delete(ids=[f"kb_{article_id}"])
        logger.info(f"Deleted vector for article {article_id} from ChromaDB.")
        return True
    except Exception as e:
        logger.warning(f"ChromaDB vector delete for {article_id} failed: {e}")
        return False


