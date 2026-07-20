# AI HR Onboarding Workflow Orchestrator

> **IBM Hackathon MVP** — An AI-powered HR onboarding assistant that ingests policy documents, answers questions in natural language, and generates structured onboarding workflows.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Document Ingestion** | Upload PDF / DOCX HR documents through a drag-and-drop UI |
| 🔍 **RAG Pipeline** | Parse → Chunk → Embed → Store in Qdrant (vector search) |
| 💬 **AI Chat** | Ask natural-language questions answered with document context |
| 🗂️ **Workflow Generator** | LLM generates a structured JSON onboarding plan |
| ✅ **Approval Simulation** | Approve / Reject / Complete each workflow step |
| 🔌 **Mock Integrations** | Placeholder stubs for Workday, Outlook, AD, Slack, Jira |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  Dashboard │ Upload │ AI Chat │ Workflow Timeline            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / JSON
┌────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                           │
│                                                             │
│  POST /upload    POST /chat    POST /workflow   GET /health  │
│       │               │              │                      │
│  ┌────▼────┐    ┌─────▼─────┐  ┌────▼────┐                 │
│  │ Parser  │    │ Retriever │  │Workflow │                 │
│  │PDF/DOCX │    │   RAG     │  │Generator│                 │
│  └────┬────┘    └─────┬─────┘  └────┬────┘                 │
│       │               │              │                      │
│  ┌────▼────────────────▼─────────────▼────┐                │
│  │           RAG Pipeline                  │                │
│  │  loader → chunker → embedder → Qdrant  │                │
│  └─────────────────────────────────────────┘                │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │              AI Provider (services/ai/provider.py)  │    │
│  │         IBM watsonx.ai  │  Mock (demo mode)         │    │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Qdrant  (vector DB)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers
│   │   │   ├── upload.py
│   │   │   ├── chat.py
│   │   │   ├── workflow.py
│   │   │   └── health.py
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   └── provider.py      # AIProvider abstraction
│   │   │   ├── rag/
│   │   │   │   ├── loader.py        # Save & load documents
│   │   │   │   ├── chunker.py       # Text splitting
│   │   │   │   ├── embedder.py      # sentence-transformers
│   │   │   │   ├── retriever.py     # Query → top-k chunks
│   │   │   │   └── vector_store.py  # Qdrant CRUD
│   │   │   ├── workflow/
│   │   │   │   └── generator.py     # Orchestrate RAG + LLM
│   │   │   ├── parser/
│   │   │   │   └── document_parser.py  # PDF + DOCX parsing
│   │   │   └── integrations.py      # Mock Workday/Outlook/AD/Slack/Jira
│   │   ├── models/
│   │   │   └── document.py          # DocumentChunk dataclass
│   │   ├── schemas/
│   │   │   └── documents.py         # Pydantic request/response schemas
│   │   ├── config/
│   │   │   └── settings.py          # pydantic-settings config
│   │   └── main.py                  # FastAPI app factory
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── UploadPage.tsx
│       │   ├── ChatPage.tsx
│       │   └── WorkflowPage.tsx
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── Sidebar.tsx
│       │   ├── FileUploadArea.tsx
│       │   ├── ChatWindow.tsx
│       │   └── WorkflowTimeline.tsx
│       ├── services/
│       │   └── api.ts               # All HTTP calls
│       ├── types/
│       │   └── index.ts             # TypeScript interfaces
│       ├── lib/
│       │   └── utils.ts             # cn() helper
│       └── App.tsx
│
└── docker-compose.yml
```

---

## 🚀 How to Run

### Option A — Docker Compose (recommended)

```bash
# 1. Copy environment file
cp backend/.env.example backend/.env

# 2. (Optional) Add watsonx credentials to backend/.env
#    WATSONX_API_KEY=...
#    WATSONX_PROJECT_ID=...

# 3. Start everything
docker compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API docs → http://localhost:8000/docs
# Qdrant   → http://localhost:6333/dashboard
```

### Option B — Local development

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Start Qdrant separately:  docker run -p 6333:6333 qdrant/qdrant
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## 🔑 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `WATSONX_API_KEY` | _(empty)_ | IBM Cloud API key. Leave blank for mock mode. |
| `WATSONX_PROJECT_ID` | _(empty)_ | watsonx.ai project ID |
| `WATSONX_MODEL_ID` | `ibm/granite-13b-instruct-v2` | LLM model |
| `QDRANT_HOST` | `qdrant` | Qdrant hostname |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | sentence-transformers model |
| `CHUNK_SIZE` | `512` | Token chunk size |
| `CHUNK_OVERLAP` | `64` | Overlap between chunks |
| `MAX_UPLOAD_SIZE_MB` | `20` | Upload size limit |

---

## 🔌 Mock Integrations

`backend/app/services/integrations.py` contains stub functions:

| Function | Target System | TODO |
|---|---|---|
| `create_hr_ticket()` | Workday | Workday REST API |
| `send_welcome_email()` | Outlook | Microsoft Graph API |
| `provision_account()` | Active Directory / Entra ID | MS Graph / LDAP |
| `send_slack_welcome()` | Slack | Slack Web API (bot token) |
| `create_onboarding_tasks()` | Jira | Jira REST API v3 |

---

## 🤖 AI Provider Swapping

The entire AI layer is abstracted behind `AIProvider` in `backend/app/services/ai/provider.py`.

To swap providers:
1. Add a new branch inside `_get_client()` or create a new provider class.
2. Implement `generate()`, `chat()`, `summarize()`, `generate_workflow()`.
3. Update `backend/.env` with new credentials.

---

## 🔮 Future Improvements

- [ ] **Authentication** — Add JWT / OAuth2 for multi-tenant access
- [ ] **Conversation memory** — Store chat history per session in Redis
- [ ] **Real watsonx embeddings** — Replace sentence-transformers with watsonx embeddings API
- [ ] **Async ingestion** — Move document processing to a Celery/ARQ task queue
- [ ] **Document versioning** — Track document versions and re-index on update
- [ ] **Real integrations** — Connect Workday, Outlook, Slack, Jira stubs
- [ ] **Workflow persistence** — Store generated workflows in PostgreSQL
- [ ] **Role-based workflows** — Tailor workflows to specific job families
- [ ] **Analytics dashboard** — Track onboarding completion rates
- [ ] **Multi-language support** — i18n for global HR teams

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | FastAPI, Python 3.12, Pydantic v2 |
| AI | IBM watsonx.ai (Granite), LangChain |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector DB | Qdrant |
| Parsing | PyMuPDF, python-docx |
| Deployment | Docker Compose |

---

*Built for the IBM Hackathon — MVP demonstrating end-to-end AI-powered HR onboarding.*
#   P o p s U p  
 