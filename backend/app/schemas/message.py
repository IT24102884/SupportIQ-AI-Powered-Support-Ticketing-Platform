from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.user import UserOut


class MessageCreate(BaseModel):
    message: str = Field(..., min_length=1)
    is_ai_suggested: bool = False


class MessageOut(BaseModel):
    id: str
    ticket_id: str
    sender_id: str
    message: str
    is_ai_suggested: bool
    created_at: datetime
    sender: Optional[UserOut] = None
    model_config = ConfigDict(from_attributes=True)
