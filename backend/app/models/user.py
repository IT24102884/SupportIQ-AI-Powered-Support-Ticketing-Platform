import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="customer")  # "customer" or "agent"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    customer_tickets = relationship("Ticket", back_populates="customer", foreign_keys="Ticket.customer_id")
    assigned_tickets = relationship("Ticket", back_populates="agent", foreign_keys="Ticket.agent_id")
    messages = relationship("TicketMessage", back_populates="sender")

