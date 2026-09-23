# SupportIQ — AI-Powered Support Ticketing Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com/IT24102884/SupportIQ-AI-Powered-Support-Ticketing-Platform)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org)
[![ChromaDB](https://img.shields.io/badge/Vector_DB-ChromaDB-FF6F61?style=flat-square)](https://www.trychroma.com)
[![Groq](https://img.shields.io/badge/LLM-Groq_%2F_Qwen-F05A28?style=flat-square)](https://groq.com)

**SupportIQ** is an enterprise-grade customer support platform designed to streamline ticket triage, empower agents with semantic AI suggestions, and maintain a self-updating knowledge base.

By combining **FastAPI**, **React 19**, **PostgreSQL**, **ChromaDB**, and **Groq LLMs**, SupportIQ automatically classifies incoming customer issues, routes high-priority incidents, and synthesizes accurate, citation-backed replies using Retrieval-Augmented Generation (RAG).

Repository: [https://github.com/IT24102884/SupportIQ-AI-Powered-Support-Ticketing-Platform](https://github.com/IT24102884/SupportIQ-AI-Powered-Support-Ticketing-Platform)

---

## Table of Contents
- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [Demo Credentials](#-demo-credentials)
- [API Reference](#-api-reference)
- [Automated Testing](#-automated-testing)
- [License](#-license)

---

## 🏛 Overview & Architecture

SupportIQ separates customer-facing workflows from support engineering operations while maintaining strict data boundaries:

```
┌────────────────────────────────────────────────────────┐
│             React 19 + TypeScript Client               │
│     Customer Portal       │     Agent Workspace        │
│   (My Tickets & Chat)     │  (Priority Queue & Copilot)│
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON + Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • Role-Based Access Control (Customer vs Agent)  │  │
│  │ • Real-time AI Triage & Priority Classification  │  │
│  │ • ChromaDB Semantic RAG Retrieval Service        │  │
│  │ • Dynamic Knowledge Ingestion & Vector Sync      │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼─────────────┐   ┌────────▼──────────────┐
│    Relational Database     │   │   ChromaDB Vector DB  │
│    • PostgreSQL / SQLite   │   │   • Dense Embeddings  │
│    • Users, Tickets, Chat  │   │   • Semantic Search   │
└────────────────────────────┘   └────────┬──────────────┘
                                          │
                                 ┌────────▼──────────────┐
                                 │   LLM Inference Engine│
                                 │   • Groq (Qwen 27B)   │
                                 │   • OpenAI Compatible │
                                 │   • Heuristic Fallback│
                                 └───────────────────────┘
```

---

## 🚀 Key Features

### 1. Automated AI Ticket Triage
When a customer submits an inquiry, SupportIQ analyzes the title and description to categorize the issue (`Billing`, `Technical`, `General`) and calculate its urgency (`High`, `Medium`, `Low`). Critical incidents (e.g., unauthorized transactions, production outages) jump straight to the top of the agent queue. A heuristic rule-engine acts as a deterministic fallback if external LLM APIs are unreachable.

### 2. Semantic Knowledge Base & RAG Copilot
Support agents can click **"Get AI Suggestion"** on any ticket. SupportIQ converts the ticket context into vector queries against **ChromaDB**, retrieves the top-3 matching documentation articles, and prompts the Groq model to draft an empathetic, structured answer citing company guidelines.

### 3. Dynamic Knowledge Ingestion & Live Vector Indexing
Support engineers and administrators can add new documentation directly through the UI. Submitted articles are written to PostgreSQL and **instantly embedded into ChromaDB** (`collection.upsert`). The Copilot immediately cites this new knowledge on future customer inquiries. Obsolete articles can be deleted, removing them from both the database and the vector store.

### 4. Strict Customer Privacy & RBAC
- **Customers**: Can only view, update, and comment on tickets they personally created. Direct requests for other ticket IDs return `403 Forbidden`. Public registrations automatically receive the `customer` role.
- **Support Staff / Admins**: Access the global priority board, filter tickets, claim unassigned issues, manage knowledge articles, and use the AI Copilot.

### 5. Auto-Expanding Response Composer
The ticket reply composer automatically resizes to match multi-paragraph AI recommendations, preventing scroll-trap and giving agents a clean canvas to review, edit, and send responses.

---

## 🛠 Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide | Single-page application with responsive dashboards |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API |
| **Database** | SQLAlchemy 2.0, PostgreSQL (or SQLite local) | Relational storage for users, tickets, and messages |
| **Vector Store** | ChromaDB | Persistent vector database for semantic RAG lookups |
| **LLM Inference**| Groq API (`qwen/qwen3.8-27b`) or OpenAI | Fast ticket triage and response synthesis |
| **Security** | PyJWT, Passlib (Bcrypt) | Token-based stateless authentication & password hashing |
| **Testing** | Pytest, HTTPX, SQLAlchemy in-memory | Automated unit and integration test suite |

---

## ⚡ Getting Started

### Prerequisites
- **Python 3.10+** (tested on Python 3.11, 3.12, 3.13)
- **Node.js 18+** & **npm**
- **PostgreSQL** (optional, defaults to local SQLite for zero-config startup)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure your environment variables
# Copy .env.example to .env and adjust your settings (e.g. Groq key, database URL)
cp ../.env.example .env

# Seed the database and ChromaDB vector store with initial articles & demo profiles
python seed.py

# Launch the FastAPI development server
python -m uvicorn app.main:app --reload --port 8000
```

- API Server: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
- Interactive Swagger Documentation: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Web Application: **[http://localhost:5173](http://localhost:5173)**

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory (or use `.env.example` as a template):

```env
# Database (PostgreSQL or SQLite)
DATABASE_URL=sqlite:///./tickets.db
# PostgreSQL Example:
# DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/support_desk

# JWT Security
JWT_SECRET=your-secure-random-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# LLM Providers (Groq or OpenAI)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b

# (Optional OpenAI configuration)
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini

# Vector Database Path
CHROMA_PERSIST_DIR=./chroma_data
```

> [!NOTE]
> If no LLM API key is supplied, SupportIQ automatically activates its intelligent heuristic engine, allowing offline development and testing with zero external dependencies.

---

## 👥 Demo Credentials

The database seeder provisions two ready-to-use demo accounts accessible directly from the one-click login buttons on the login page:

| Role | Email | Password | Name | Permissions |
|---|---|---|---|---|
| **Support Agent** | `agent@example.com` | `password123` | Sarah Chen | View all tickets, claim tickets, use AI Copilot, manage Knowledge Base |
| **Customer** | `customer@example.com` | `password123` | Alex Rivera | Submit tickets, view personal tickets, message support |

---

## 📋 API Reference

### Authentication
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Sign in and obtain JWT access token
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Tickets & Conversations
- `POST /api/tickets` — Submit a ticket (triggers automated AI triage)
- `GET /api/tickets` — List tickets (filtered by customer ID for customers; priority-sorted for agents)
- `GET /api/tickets/{id}` — Get single ticket details and conversation thread
- `PATCH /api/tickets/{id}` — Update ticket status, priority, or assignment
- `POST /api/tickets/{id}/messages` — Post message in ticket thread
- `GET /api/tickets/{id}/suggest-reply` — Agent-only RAG Copilot suggestion endpoint

### Knowledge Base & Vector Index
- `GET /api/kb/articles` — List all knowledge base articles with optional category filter
- `POST /api/kb/articles` — Create article and immediately embed into ChromaDB
- `DELETE /api/kb/articles/{id}` — Delete article from PostgreSQL and ChromaDB
- `POST /api/kb/sync` — Synchronize and re-index all database articles into ChromaDB

---

## 🧪 Automated Testing

SupportIQ includes a comprehensive automated test suite testing auth, ticket triage, customer isolation, and vector search:

```bash
cd backend
python -m pytest -v tests
```

### Coverage Highlights:
- `test_heuristic_triage_classification`: Validates priority & category assignment.
- `test_chroma_kb_retrieval`: Tests vector similarity search and scoring.
- `test_suggest_reply_endpoint`: Tests end-to-end RAG response generation.
- `test_register_customer` & `test_login_success`: Tests JWT authentication lifecycle.
- `test_customer_cannot_see_or_access_other_customer_tickets`: Asserts strict isolation (Customer B cannot view or message Customer A's tickets).
- `test_agent_create_kb_article_and_vector_indexed`: Tests dynamic article creation and immediate vector indexing in ChromaDB.
- `test_customer_cannot_create_kb_article`: Asserts 403 Forbidden for unauthorized role actions.
- `test_agent_delete_kb_article` & `test_agent_sync_kb_vectors`: Tests vector lifecycle management.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute it for personal or commercial projects.
