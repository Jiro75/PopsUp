// ── Document / Upload ─────────────────────────────────────────────────────────

export interface UploadResponse {
  filename: string;
  chunks_stored: number;
  message: string;
}

/** A single document entry as returned by GET /documents. */
export interface DocumentListItem {
  filename: string;
  chunks: number;
  uploaded_at?: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

// ── Workflow ──────────────────────────────────────────────────────────────────

export type WorkflowStepStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type WorkflowCategory =
  | 'orientation'
  | 'compliance'
  | 'it-setup'
  | 'training'
  | 'social';

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  estimated_duration?: string;
  category?: WorkflowCategory;
  // frontend-only state (not from backend)
  status: WorkflowStepStatus;
}

export interface WorkflowResponse {
  role: string;
  steps: WorkflowStep[];
}

export interface WorkflowRequest {
  role?: string;
  department?: string;
  custom_context?: string;
}
