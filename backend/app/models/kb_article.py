import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime

from app.core.database import Base


class KBArticle(Base):
    __tablename__ = "kb_articles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="General")  # Billing, Technical, General
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

