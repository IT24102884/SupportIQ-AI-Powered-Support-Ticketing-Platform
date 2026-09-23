from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import User, Ticket, TicketMessage, KBArticle  # ensure all models registered
from app.api import auth, tickets, kb
from app.services.rag_service import seed_chroma_kb


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ensure SQL tables exist
    Base.metadata.create_all(bind=engine)
    # 2. Seed ChromaDB collection if not already seeded
    try:
        seed_chroma_kb()
    except Exception as e:
        print(f"Warning initializing ChromaDB: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(tickets.router, prefix=settings.API_V1_STR)
app.include_router(kb.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for OpenAPI documentation."
    }

