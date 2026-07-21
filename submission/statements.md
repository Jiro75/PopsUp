# IBM Hackathon Submission Statements

---

## Solution Statement

*(Paste this in the "Solution" field on the IBM submission form — ~150 words)*

---

PopsUp is an AI-powered HR onboarding orchestrator that transforms static policy documents into intelligent, role-specific onboarding experiences. HR teams upload their existing PDF or DOCX policy files once; the system automatically parses, chunks, embeds, and indexes them using a Retrieval-Augmented Generation (RAG) pipeline backed by IBM watsonx.ai and the Granite 13B Instruct model.

Employees and HR managers can then ask natural-language questions and receive contextually accurate answers sourced directly from company documents. A single click generates a structured, step-by-step onboarding workflow tailored to any role or department — validated, exportable as JSON, and interactive. Each workflow step can be individually approved, rejected, or marked complete through a visual timeline.

PopsUp removes the inconsistency and manual effort from onboarding, replacing scattered documents and repeated HR questions with a single intelligent interface — reducing time-to-productivity for new hires and freeing HR teams to focus on people, not paperwork.

---

## Technical Statement

*(Paste this in the "Technical Approach" or "Architecture" field — ~200 words)*

---

PopsUp is built as a clean-architecture monorepo with a strict separation between the API transport layer, domain services, and infrastructure adapters. The backend is a FastAPI application (Python 3.12) with five independently testable RAG modules: a document loader, a LangChain-based text chunker (512-token chunks, 64-token overlap), a sentence-transformers embedder (all-MiniLM-L6-v2, 384 dimensions), a Qdrant vector store wrapper, and a semantic retriever. All Qdrant and ML dependencies degrade gracefully when unavailable, allowing full demonstration without cloud infrastructure.

The AI layer is abstracted behind a single AIProvider class exposing generate(), chat(), summarize(), and generate_workflow() methods. This makes the underlying LLM — currently IBM Granite 13B Instruct v2 via the watsonx.ai SDK — fully swappable without touching any other file. Structured workflow output is validated through Pydantic schemas before reaching the UI, preventing malformed LLM responses from propagating.

The frontend is a React 18 + TypeScript single-page application built with Vite and TailwindCSS. A centralised API service layer and shared TypeScript interfaces ensure type safety across all backend interactions. A mock integration layer provides stub implementations of Workday, Microsoft Outlook, Active Directory, Slack, and Jira — ready for real API implementation by downstream developers. The entire stack is containerised with Docker Compose (three services: frontend via nginx, FastAPI backend, Qdrant).
