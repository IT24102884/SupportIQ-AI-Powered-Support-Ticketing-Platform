"""
Database & ChromaDB Seeding Script for AI Support Ticketing System
Run: python seed.py
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.ticket import Ticket
from app.models.message import TicketMessage
from app.models.kb_article import KBArticle
from app.services.seed_data import KB_ARTICLES_DATA, DEMO_USERS, SAMPLE_TICKETS
from app.services.rag_service import seed_chroma_kb, get_chroma_client


def seed():
    print("=" * 60)
    print(">> Starting AI Support Ticketing System Database Seed")
    print("=" * 60)

    # 1. Initialize Tables
    print("\n[1/4] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 2. Seed KB Articles into PostgreSQL/SQLite
    print(f"\n[2/4] Seeding {len(KB_ARTICLES_DATA)} Knowledge Base articles...")
    article_count = 0
    for art in KB_ARTICLES_DATA:
        existing = db.query(KBArticle).filter(KBArticle.title == art["title"]).first()
        if not existing:
            new_art = KBArticle(
                title=art["title"],
                content=art["content"],
                category=art["category"]
            )
            db.add(new_art)
            article_count += 1
    db.commit()
    print(f"  [+] Added {article_count} new KB articles to relational database.")

    # Seed into ChromaDB
    print("  [+] Syncing KB articles to ChromaDB vector store...")
    seed_chroma_kb(KB_ARTICLES_DATA)
    _, collection = get_chroma_client()
    print(f"  [+] ChromaDB collection now contains {collection.count()} embedded chunks.")

    # 3. Seed Demo Users
    print("\n[3/4] Seeding demo users...")
    user_map = {}
    for u in DEMO_USERS:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            user_map[u["email"]] = user
            print(f"  [+] Created user: {u['name']} ({u['email']}) [Role: {u['role']}]")
        else:
            user_map[u["email"]] = existing
            print(f"  [*] User already exists: {u['name']} ({u['email']})")

    # 4. Seed Sample Tickets
    print("\n[4/4] Seeding realistic sample tickets & conversation threads...")
    ticket_count = 0
    agent = user_map.get("agent@example.com")
    for t_data in SAMPLE_TICKETS:
        cust = user_map.get(t_data["customer_email"])
        if not cust:
            continue

        existing_t = db.query(Ticket).filter(
            Ticket.title == t_data["title"],
            Ticket.customer_id == cust.id
        ).first()

        if not existing_t:
            ticket = Ticket(
                customer_id=cust.id,
                agent_id=agent.id if t_data["status"] != "Open" and agent else None,
                title=t_data["title"],
                description=t_data["description"],
                category=t_data["category"],
                priority=t_data["priority"],
                status=t_data["status"]
            )
            db.add(ticket)
            db.flush()

            for msg in t_data.get("messages", []):
                sender = user_map.get(msg["sender_email"])
                if sender:
                    t_msg = TicketMessage(
                        ticket_id=ticket.id,
                        sender_id=sender.id,
                        message=msg["message"],
                        is_ai_suggested=msg.get("is_ai_suggested", False)
                    )
                    db.add(t_msg)
            db.commit()
            ticket_count += 1
            print(f"  [+] Seeded ticket: '{t_data['title']}' [{t_data['category']} | {t_data['priority']}]")

    db.close()
    print("\n" + "=" * 60)
    print("Seed completed successfully!")
    print("=" * 60)
    print("\nDemo Login Credentials:")
    print("  Customer: customer@example.com  / password123 (Alex Rivera)")
    print("  Agent:    agent@example.com     / password123 (Sarah Chen)")
    print("=" * 60)



if __name__ == "__main__":
    seed()
