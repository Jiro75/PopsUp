# PopsUp — AI HR Onboarding Workflow Orchestrator

> IBM Hackathon MVP — AI-powered HR onboarding assistant that ingests policy documents, answers questions in natural language, and generates structured onboarding workflows.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![Python](https://img.shields.io/badge/python-3.12-green)](#) [![TypeScript](https://img.shields.io/badge/typescript-4.x-blue)](#)

---

## ✨ Overview

PopsUp is a minimal end-to-end demo that showcases a retrieval-augmented generation (RAG) pipeline for HR onboarding. Upload HR documents (PDF / DOCX), search and chat over the content, and generate a structured JSON onboarding workflow that can be approved, rejected, or completed step-by-step. The project is intentionally modular so providers (LLMs, vector DBs, and integrations) can be swapped out.

> Language composition: TypeScript ~49%, Python ~45% (frontend/backend split).

---

## ✨ Features

- 📄 Document ingestion: drag-and-drop upload for PDF and DOCX
- 🔍 RAG pipeline: parse → chunk → embed → store (Qdrant)
- 💬 AI Chat: natural language Q&A with document context
- 🗂️ Workflow generator: LLM-created structured JSON onboarding plan
- ✅ Approval simulation: Approve / Reject / Complete workflow steps
- 🔌 Mock integrations: stubs for Workday, Outlook, AD/Entra, Slack, Jira

---

## 🏗️ Architecture (high level)

```
Frontend (React + TS)  <----HTTP/JSON---->  FastAPI backend (Python)
  - Upload, Chat, Workflow UI                   - Upload, Parser, RAG, AIProvider
                                                   - Qdrant vector DB
                                                   - Mock integrations
```

Key endpoints: POST /upload, POST /chat, POST /workflow, GET /health

---

## 📁 Folder structure (short)

```
.
├── backend/       # FastAPI app, RAG, providers, integrations
├── frontend/      # React + TypeScript + Vite UI
└── docker-compose.yml
```

See the repository for a full tree and file comments.

---

## 🚀 Quick start

Recommended: Docker Compose (everything in one command).

1. Copy the backend example env and (optionally) add credentials:

```bash
cp backend/.env.example backend/.env
# Optionally set WATSONX_API_KEY and WATSONX_PROJECT_ID for real watsonx.ai usage
```

2. Start services:

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8000
- API docs → http://localhost:8000/docs
- Qdrant   → http://localhost:6333/dashboard

Local development (if you prefer):

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Start Qdrant separately: docker run -p 6333:6333 qdrant/qdrant
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## 🔑 Environment variables (important)

| Variable | Default | Description |
|---|---:|---|
| WATSONX_API_KEY | _(empty)_ | IBM Cloud API key. Leave blank for mock mode. |
| WATSONX_PROJECT_ID | _(empty)_ | watsonx.ai project ID |
| WATSONX_MODEL_ID | `ibm/granite-13b-instruct-v2` | LLM model id |
| QDRANT_HOST | `qdrant` | Qdrant hostname (container name in compose) |
| EMBEDDING_MODEL | `all-MiniLM-L6-v2` | sentence-transformers model |
| CHUNK_SIZE | `512` | Token chunk size |
| CHUNK_OVERLAP | `64` | Overlap between chunks |
| MAX_UPLOAD_SIZE_MB | `20` | Upload size limit |

---

## 🔌 Mock integrations

The backend provides simple stub functions (backend/app/services/integrations.py) to demonstrate where real integration code would run:

- create_hr_ticket()  — Workday REST API
- send_welcome_email() — Microsoft Graph / Outlook
- provision_account() — Active Directory / Entra ID
- send_slack_welcome() — Slack Web API
- create_onboarding_tasks() — Jira REST API

These are intentionally minimal and safe for a demo environment.

---

## 🤖 AI provider abstraction

The AI layer is abstracted behind AIProvider (backend/app/services/ai/provider.py). To add or swap providers:

1. Add a new provider branch or class inside provider.py (or split into modules).
2. Implement the methods: generate(), chat(), summarize(), generate_workflow().
3. Update backend/.env with credentials for the chosen provider.

---

## 🔮 Roadmap / Future improvements

- Add authentication (JWT / OAuth2) for multi-tenant access
- Conversation memory (session history in Redis)
- Real watsonx embeddings (replace sentence-transformers)
- Async ingestion (Celery/ARQ + task queue)
- Document versioning & re-indexing
- Implement real integrations for Workday, Outlook, Slack, Jira
- Workflow persistence in PostgreSQL
- Role-based, multi-language workflows and analytics dashboard

---

## 🛠️ Tech stack

- Frontend: React 18, TypeScript, Vite, TailwindCSS
- Backend: FastAPI, Python 3.12, Pydantic v2
- AI: IBM watsonx.ai (Granite) / mock provider
- Embeddings: sentence-transformers (all-MiniLM-L6-v2)
- Vector DB: Qdrant
- Parsing: PyMuPDF, python-docx
- Deployment: Docker Compose

---

*Built for the IBM Hackathon — an MVP demonstrating an end-to-end AI-powered HR onboarding flow.*
