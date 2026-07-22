import { useEffect, useState } from 'react'
import { checkHealth } from '@/services/api'

type Status = 'online' | 'offline' | 'checking'

export default function StatusBadge() {
  const [status, setStatus] = useState<Status>('checking')
  const [aiMode, setAiMode] = useState('')
  const [qdrant, setQdrant] = useState('')

  useEffect(() => {
    const check = async () => {
      try {
        const data = await checkHealth() as any
        setStatus('online')
        setAiMode(data.ai_mode ?? 'mock')
        setQdrant(data.qdrant ?? 'unknown')
      } catch {
        setStatus('offline')
      }
    }
    check()
    const id = setInterval(check, 5000)
    return () => clearInterval(id)
  }, [])

  const colors: Record<Status, string> = {
    online:   'bg-green-100 text-green-700 border-green-200',
    offline:  'bg-red-100 text-red-700 border-red-200',
    checking: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }
  const labels: Record<Status, string> = {
    online: '● Backend Online',
    offline: '● Backend Offline',
    checking: '◌ Checking…',
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${colors[status]}`}>
        {labels[status]}
      </span>
      {status === 'online' && (
        <>
          <span className="text-xs text-slate-500">
            AI: <span className="font-medium text-slate-700">{aiMode}</span>
          </span>
          <span className="text-xs text-slate-500">
            Vector DB: <span className="font-medium text-slate-700">{qdrant}</span>
          </span>
        </>
      )}
    </div>
  )
}
