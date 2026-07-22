import { Component, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import UploadPage from '@/pages/UploadPage'
import ChatPage from '@/pages/ChatPage'
import WorkflowPage from '@/pages/WorkflowPage'

// ── Error boundary — prevents blank white screen on any page crash ────────────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-slate-700">Something went wrong on this page.</p>
          <pre className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 max-w-xl text-left overflow-auto">
            {(this.state.error as Error).message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="rounded-md bg-ibm-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ibm-600"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}
