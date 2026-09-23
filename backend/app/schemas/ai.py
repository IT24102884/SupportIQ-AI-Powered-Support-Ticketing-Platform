from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class TriageResult(BaseModel):
    category: str
    priority: str
    reasoning: Optional[str] = None


class KBArticleBase(BaseModel):
    title: str
    content: str
    category: str


class KBArticleCreate(KBArticleBase):
    pass


class KBArticleOut(KBArticleBase):
    id: str
    created_at: Optional[datetime] = None
    similarity_score: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)


class RAGSuggestionResponse(BaseModel):
    suggested_reply: str
    sources: List[KBArticleOut] = []
    model_used: str
    generated_at: datetime
