import { Link } from 'react-router-dom'
import { Upload, MessageSquare, GitBranch, ArrowRight, FileText, Zap, Shield } from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Document Ingestion',
    description:
      'Upload PDF or DOCX HR policy documents. The pipeline automatically extracts text, chunks it, generates embeddings, and stores everything in Qdrant.',
    href: '/upload',
    color: 'text-ibm-500',
    bg: 'bg-ibm-50',
  },
  {
    icon: MessageSquare,
    title: 'AI-Powered Chat',
    description:
      'Ask natural-language questions about onboarding policies. The assistant retrieves relevant document chunks via RAG and answers using IBM watsonx.ai.',
    href: '/chat',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: GitBranch,
    title: 'Workflow Generator',
    description:
      'Generate a structured, step-by-step onboarding workflow from uploaded HR documents. Review, approve, reject, or mark steps complete.',
    href: '/workflow',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
]

const stats = [
  { label: 'Pipeline Stages', value: '5', sub: 'Upload → Parse → Chunk → Embed → Store' },
  { label: 'AI Provider', value: 'watsonx', sub: 'IBM Granite (swappable)' },
  { label: 'Vector DB', value: 'Qdrant', sub: 'Cosine similarity search' },
  { label: 'Integrations', value: '5 mock', sub: 'Workday, Outlook, AD, Slack, Jira' },
]

export default function HomePage() {
  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="rounded-2xl bg-ibm-900 px-8 py-10 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-ibm-300 text-xs font-semibold uppercase tracking-widest mb-2">
              IBM Hackathon MVP
            </p>
            <h1 className="text-3xl font-bold leading-tight">
              AI HR Onboarding<br />Workflow Orchestrator
            </h1>
            <p className="mt-3 text-ibm-200 text-sm max-w-lg leading-relaxed">
              Upload your HR policy documents, ask questions in natural language, and
              generate AI-powered onboarding workflows — all in one dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-md bg-ibm-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ibm-400 transition-colors"
              >
                <Upload className="h-4 w-4" /> Get Started
              </Link>
              <Link
                to="/workflow"
                className="inline-flex items-center gap-2 rounded-md bg-ibm-800 border border-ibm-600 px-4 py-2 text-sm font-semibold text-ibm-100 hover:bg-ibm-700 transition-colors"
              >
                <GitBranch className="h-4 w-4" /> Generate Workflow
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-2">
            {['RAG Pipeline', 'watsonx.ai', 'Qdrant', 'LangChain'].map((t) => (
              <span
                key={t}
                className="rounded-full bg-ibm-700 px-3 py-1 text-xs font-medium text-ibm-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-2xl font-bold text-ibm-600">{s.value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-slate-400 mt-1 leading-snug">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description, href, color, bg }) => (
            <Link
              key={href}
              to={href}
              className="group rounded-xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-ibm-300 transition-all"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg} mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-ibm-500 group-hover:gap-2 transition-all">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Architecture note */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-ibm-500" /> Architecture
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {['React + Vite', '→', 'FastAPI', '→', 'RAG Pipeline', '→', 'Qdrant', '→', 'watsonx.ai'].map(
            (seg, i) => (
              <span
                key={i}
                className={
                  seg === '→'
                    ? 'text-slate-300'
                    : 'rounded bg-white border border-slate-200 px-2 py-1 font-medium text-slate-700'
                }
              >
                {seg}
              </span>
            ),
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400 flex items-start gap-1.5">
          <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
          Running in demo mode when watsonx credentials are not configured. Set{' '}
          <code className="font-mono bg-slate-100 px-1 rounded">WATSONX_API_KEY</code> in the
          backend <code className="font-mono bg-slate-100 px-1 rounded">.env</code> file to
          enable real AI responses.
        </p>
      </div>
    </div>
  )
}
