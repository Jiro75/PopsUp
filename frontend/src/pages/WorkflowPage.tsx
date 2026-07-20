import { useState } from 'react'
import { GitBranch, Loader2, RefreshCw, AlertCircle, Users } from 'lucide-react'
import WorkflowTimeline from '@/components/WorkflowTimeline'
import { generateWorkflow } from '@/services/api'
import type { WorkflowStep, WorkflowStepStatus } from '@/types'
import { cn } from '@/lib/utils'

const ROLES = [
  'New Employee',
  'Software Engineer',
  'Product Manager',
  'Sales Representative',
  'HR Specialist',
  'Team Manager',
  'Data Scientist',
]

const DEPARTMENTS = [
  '',
  'Engineering',
  'Product',
  'Sales',
  'Human Resources',
  'Finance',
  'Marketing',
  'Legal',
]

export default function WorkflowPage() {
  const [role, setRole] = useState('New Employee')
  const [department, setDepartment] = useState('')
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [workflowRole, setWorkflowRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateWorkflow({
        role: role.toLowerCase(),
        department: department || undefined,
      })
      // Attach frontend-only status field
      const stepsWithStatus: WorkflowStep[] = res.steps.map((s) => ({
        ...s,
        status: 'pending' as WorkflowStepStatus,
      }))
      setSteps(stepsWithStatus)
      setWorkflowRole(res.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflow.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (index: number, status: WorkflowStepStatus) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s)),
    )
  }

  const approvedCount = steps.filter((s) => s.status === 'approved').length
  const completedCount = steps.filter((s) => s.status === 'completed').length
  const rejectedCount = steps.filter((s) => s.status === 'rejected').length
  const progress =
    steps.length > 0
      ? Math.round(((approvedCount + completedCount) / steps.length) * 100)
      : 0

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className="h-5 w-5 text-ibm-500" />
          <h1 className="text-xl font-bold text-slate-800">Workflow Generator</h1>
        </div>
        <p className="text-sm text-slate-500">
          Generate a step-by-step onboarding workflow from your HR documents using AI.
          Review and approve each step.
        </p>
      </div>

      {/* Generator controls */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              <Users className="inline h-3.5 w-3.5 mr-1" />Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ibm-500"
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Department (optional)
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ibm-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d || '— Any department —'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-colors',
            loading ? 'bg-ibm-300 cursor-not-allowed' : 'bg-ibm-500 hover:bg-ibm-600',
          )}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating workflow…</>
          ) : steps.length > 0 ? (
            <><RefreshCw className="h-4 w-4" /> Regenerate Workflow</>
          ) : (
            <><GitBranch className="h-4 w-4" /> Generate Workflow</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Progress summary */}
      {steps.length > 0 && (
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Onboarding Workflow — {workflowRole}
            </p>
            <p className="text-xs text-slate-500">{progress}% complete</p>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-ibm-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Counters */}
          <div className="flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              {steps.filter((s) => s.status === 'pending').length} pending
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {approvedCount} approved
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-ibm-500" />
              {completedCount} completed
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              {rejectedCount} rejected
            </span>
          </div>
        </div>
      )}

      {/* Timeline */}
      {steps.length > 0 && (
        <WorkflowTimeline steps={steps} onStatusChange={handleStatusChange} />
      )}

      {/* Empty state */}
      {steps.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <GitBranch className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No workflow generated yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Select a role above and click Generate Workflow
          </p>
        </div>
      )}
    </div>
  )
}
