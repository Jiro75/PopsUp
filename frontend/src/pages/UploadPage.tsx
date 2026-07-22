import { useEffect, useState } from 'react'
import { FileText, Database, Loader2, Sparkles } from 'lucide-react'
import FileUploadArea from '@/components/FileUploadArea'
import { listDocuments, seedDocuments } from '@/services/api'
import type { DocumentListItem } from '@/types'

export default function UploadPage() {
  const [docs, setDocs] = useState<DocumentListItem[]>([])
  const [seeding, setSeeding] = useState(false)

  const fetchDocs = async () => {
    try {
      const data = await listDocuments()
      setDocs(Array.isArray(data) ? data : [])
    } catch {
      setDocs([])
    }
  }

  useEffect(() => { fetchDocs() }, [])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedDocuments()
      await fetchDocs()
    } catch {
      // ignore — seed endpoint may not exist yet
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
        <FileUploadArea onUploadComplete={fetchDocs} />
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

      {/* Ingested documents */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Database className="h-4 w-4 text-ibm-500" />
            Documents in Vector Store ({docs.length})
          </h2>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 text-xs bg-ibm-50 border border-ibm-200 text-ibm-600 px-3 py-1.5 rounded-md hover:bg-ibm-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {seeding
              ? <><Loader2 className="h-3 w-3 animate-spin" /> Loading…</>
              : <><Sparkles className="h-3 w-3" /> Load Sample Doc</>
            }
          </button>
        </div>
        {docs.length === 0 ? (
          <p className="text-xs text-slate-400">
            No documents ingested yet. Upload a file above or click "Load Sample Doc".
          </p>
        ) : (
          <ul className="space-y-1.5">
            {docs.map((doc) => (
              <li
                key={doc.filename}
                className="flex items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 rounded px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-ibm-500 shrink-0" />
                  <span className="truncate">{doc.filename}</span>
                </div>
                <span className="shrink-0 text-slate-400">{doc.chunks} chunks</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
