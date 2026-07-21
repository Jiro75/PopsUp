import { Download } from 'lucide-react'
import type { WorkflowStep } from '@/types'

interface WorkflowExportButtonProps {
  role: string
  steps: WorkflowStep[]
}

export default function WorkflowExportButton({ role, steps }: WorkflowExportButtonProps) {
  const handleExport = () => {
    const payload = {
      role,
      exported_at: new Date().toISOString(),
      steps: steps.map(({ step, title, description, estimated_duration, category, status }) => ({
        step,
        title,
        description,
        estimated_duration,
        category,
        status,
      })),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeRole = role.replace(/\s+/g, '_').toLowerCase()
    a.download = `workflow_${safeRole}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <Download className="h-3.5 w-3.5" />
      Export JSON
    </button>
  )
}
