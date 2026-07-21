/**
 * Central API service layer.
 * All fetch calls go through this file — swap the BASE_URL for production.
 */

import type {
  UploadResponse,
  ChatRequest,
  ChatResponse,
  WorkflowRequest,
  WorkflowResponse,
  DocumentListResponse,
} from '@/types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadDocuments(files: File[]): Promise<UploadResponse[]> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: form });
  return handleResponse<UploadResponse[]>(res);
}

export async function listDocuments(): Promise<DocumentListResponse> {
  const res = await fetch(`${BASE_URL}/documents`);
  return handleResponse<DocumentListResponse>(res);
}

export async function seedDocuments(): Promise<UploadResponse[]> {
  const res = await fetch(`${BASE_URL}/seed`, { method: 'POST' });
  return handleResponse<UploadResponse[]>(res);
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<ChatResponse>(res);
}

// ── Workflow ──────────────────────────────────────────────────────────────────

export async function generateWorkflow(
  payload: WorkflowRequest,
): Promise<WorkflowResponse> {
  const res = await fetch(`${BASE_URL}/workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<WorkflowResponse>(res);
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch(`${BASE_URL}/health`);
  return handleResponse(res);
}
