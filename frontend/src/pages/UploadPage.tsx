import { useEffect, useState } from 'react'
import { FileText, RefreshCw, FolderOpen } from 'lucide-react'
import FileUploadArea from '@/components/FileUploadArea'
import { listDocuments, seedDocuments } from '@/services/api'

export default function UploadPage() {
  const [documents, setDocuments] = useState<string[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  const fetchDocs = async () => {
    setLoadingDocs(true)
    try {
      const res = await listDocuments()
      setDocuments(res.documents)
    } catch {
      // backend may not be running — silently ignore
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await seedDocuments()
      setSeedMsg(`Loaded ${res.length} sample document(s).`)
      fetchDocs()
    } catch {
      setSeedMsg('Could not load sample — is the backend running?')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-ibm-500" />
          <h1 className="text-xl font-bold text-slate-800">Upload HR Documents</h1>
        </div>
        <p className="text-sm text-slate-500">
          Upload PDF or DOCX files. Each document is automatically parsed, chunked,
          embedded, and stored in Qdrant so the AI assistant can reference it.
        </p>
      </div>

      {/* Upload area card */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
        <FileUploadArea />
      </div>

      {/* Ingested documents list */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-ibm-500" />
            <p className="text-sm font-semibold text-slate-800">Ingested Documents</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-1.5 rounded-lg border border-ibm-200 bg-ibm-50 px-3 py-1.5 text-xs text-ibm-700 hover:bg-ibm-100 transition-colors disabled:opacity-50"
            >
              {seeding ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Load Sample Doc
            </button>
            <button
              onClick={fetchDocs}
              disabled={loadingDocs}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loadingDocs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {seedMsg && (
          <p className="text-xs text-ibm-600 bg-ibm-50 border border-ibm-100 rounded px-3 py-1.5">
            {seedMsg}
          </p>
        )}

        {loadingDocs ? (
          <p className="text-xs text-slate-400">Loading…</p>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No documents ingested yet. Upload a file above or click "Load Sample Doc".
          </p>
        ) : (
          <ul className="space-y-1">
            {documents.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700"
              >
                <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pipeline info */}
      <div className="rounded-xl bg-ibm-50 border border-ibm-100 p-5 text-sm text-ibm-800">
        <p className="font-semibold mb-2">Processing pipeline</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-ibm-700">
          <li>File is saved to the server upload directory</li>
          <li>Text is extracted (PyMuPDF for PDF, python-docx for DOCX)</li>
          <li>Text is split into overlapping chunks (512 tokens, 64 overlap)</li>
          <li>Chunks are embedded with sentence-transformers (all-MiniLM-L6-v2)</li>
          <li>Embeddings + metadata are upserted into Qdrant</li>
        </ol>
      </div>
    </div>
  )
}
