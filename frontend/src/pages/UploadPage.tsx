import { FileText } from 'lucide-react'
import FileUploadArea from '@/components/FileUploadArea'

export default function UploadPage() {
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
