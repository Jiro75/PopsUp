import { useCallback, useState } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadDocuments } from '@/services/api'
import type { UploadResponse } from '@/types'

const ACCEPTED = ['.pdf', '.docx', '.doc']

interface FileUploadAreaProps {
  onUploadComplete?: () => void
}

export default function FileUploadArea({ onUploadComplete }: FileUploadAreaProps = {}) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<UploadResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter((f) =>
      ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext)),
    )
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...valid.filter((f) => !names.has(f.name))]
    })
    setError(null)
  }

  const removeFile = (name: string) =>
    setFiles((prev) => prev.filter((f) => f.name !== name))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const handleUpload = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const data = await uploadDocuments(files)
      setResults(data)
      setFiles([])
      onUploadComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer',
          dragging
            ? 'border-ibm-500 bg-ibm-50'
            : 'border-slate-300 bg-white hover:border-ibm-400 hover:bg-ibm-50',
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className="mb-3 h-10 w-10 text-ibm-500" />
        <p className="text-sm font-medium text-slate-700">
          Drag & drop PDF or DOCX files here
        </p>
        <p className="text-xs text-slate-400 mt-1">or click to browse</p>
        <input
          id="file-input"
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between rounded-md bg-white px-4 py-2.5 border border-slate-200 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-ibm-500" />
                <span className="truncate text-slate-700">{f.name}</span>
                <span className="text-xs text-slate-400 shrink-0">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                className="ml-2 shrink-0 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload button */}
      <button
        disabled={files.length === 0 || loading}
        onClick={handleUpload}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-colors',
          files.length === 0 || loading
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-ibm-500 hover:bg-ibm-600',
        )}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
        ) : (
          <><Upload className="h-4 w-4" /> Upload & Ingest</>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.filename}
              className="flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800"
            >
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>{r.filename}</strong> — {r.chunks_stored} chunks stored.
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
