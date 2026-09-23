from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.kb_article import KBArticle
from app.models.user import User
from app.schemas.ai import KBArticleCreate, KBArticleOut
from app.api.deps import require_agent
from app.services.rag_service import upsert_article_vector, delete_article_vector

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])


@router.get("/articles", response_model=List[KBArticleOut])
def list_articles(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(KBArticle)
    if category:
        query = query.filter(KBArticle.category == category)
    return query.order_by(KBArticle.category, KBArticle.title).all()


@router.post("/articles", response_model=KBArticleOut, status_code=status.HTTP_201_CREATED)
def create_article(
    article_in: KBArticleCreate,
    current_agent: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """
    Agent adds a new knowledge base article.
    Automatically indexes & embeds the article into ChromaDB vector store.
    """
    article = KBArticle(
        title=article_in.title,
        content=article_in.content,
        category=article_in.category
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    # Immediately embed and index into ChromaDB
    upsert_article_vector(
        article_id=str(article.id),
        title=article.title,
        content=article.content,
        category=article.category
    )

    return article


@router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: str,
    current_agent: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """
    Agent deletes a knowledge base article from PostgreSQL and ChromaDB vector store.
    """
    article = db.query(KBArticle).filter(KBArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    delete_article_vector(str(article.id))
    db.delete(article)
    db.commit()
    return None


@router.post("/sync")
def sync_kb_vectors(
    current_agent: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """
    Synchronizes all knowledge base articles from the SQL database into ChromaDB.
    """
    articles = db.query(KBArticle).all()
    synced = 0
    for art in articles:
        if upsert_article_vector(str(art.id), art.title, art.content, art.category):
            synced += 1

    return {
        "status": "success",
        "synced": synced,
        "total": len(articles),
        "message": f"Successfully synced {synced} of {len(articles)} articles into ChromaDB."
    }
