from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.user import UserOut
from app.schemas.message import MessageOut


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)


class TicketUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(Open|In Progress|Resolved)$")
    agent_id: Optional[str] = None
    category: Optional[str] = Field(None, pattern="^(Billing|Technical|General)$")
    priority: Optional[str] = Field(None, pattern="^(Low|Medium|High)$")


class TicketOut(BaseModel):
    id: str
    customer_id: str
    agent_id: Optional[str] = None
    title: str
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    customer: Optional[UserOut] = None
    agent: Optional[UserOut] = None
    model_config = ConfigDict(from_attributes=True)


class TicketDetailOut(TicketOut):
    messages: List[MessageOut] = []
    model_config = ConfigDict(from_attributes=True)
