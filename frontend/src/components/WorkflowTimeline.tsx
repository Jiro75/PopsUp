import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Flag,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowStep, WorkflowStepStatus, WorkflowCategory } from '@/types'

const CATEGORY_COLORS: Record<WorkflowCategory, string> = {
  orientation: 'bg-blue-100 text-blue-700',
  compliance:  'bg-red-100 text-red-700',
  'it-setup':  'bg-purple-100 text-purple-700',
  training:    'bg-yellow-100 text-yellow-700',
  social:      'bg-green-100 text-green-700',
}

const STATUS_STYLES: Record<WorkflowStepStatus, { dot: string; label: string }> = {
  pending:   { dot: 'bg-slate-300',  label: 'Pending' },
  approved:  { dot: 'bg-green-500',  label: 'Approved' },
  rejected:  { dot: 'bg-red-500',    label: 'Rejected' },
  completed: { dot: 'bg-ibm-500',    label: 'Completed' },
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  onStatusChange: (stepIndex: number, status: WorkflowStepStatus) => void
}

export default function WorkflowTimeline({ steps, onStatusChange }: WorkflowTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-slate-200" />

      <ol className="space-y-4">
        {steps.map((step, i) => (
          <WorkflowStepCard
            key={step.step}
            step={step}
            isLast={i === steps.length - 1}
            onStatusChange={(status) => onStatusChange(i, status)}
          />
        ))}
      </ol>
    </div>
  )
}

function WorkflowStepCard({
  step,
  isLast,
  onStatusChange,
}: {
  step: WorkflowStep
  isLast: boolean
  onStatusChange: (status: WorkflowStepStatus) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const { dot, label } = STATUS_STYLES[step.status]

  return (
    <li className="relative flex gap-5 animate-fade-in">
      {/* Step dot */}
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow bg-white">
        <StatusIcon status={step.status} />
      </div>

      {/* Card */}
      <div
        className={cn(
          'flex-1 rounded-xl border bg-white shadow-sm transition-all',
          step.status === 'approved' && 'border-green-300',
          step.status === 'rejected' && 'border-red-300 opacity-60',
          step.status === 'completed' && 'border-ibm-300',
          step.status === 'pending' && 'border-slate-200',
        )}
      >
        {/* Card header */}
        <div
          className="flex items-start justify-between gap-3 px-4 py-3 cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-0.5 shrink-0 text-xs font-bold text-slate-400 tabular-nums">
              {String(step.step).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm leading-snug">
                {step.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {/* Status badge */}
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dot)} />
                  {label}
                </span>
                {/* Category badge */}
                {step.category && (
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      CATEGORY_COLORS[step.category] ?? 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {step.category}
                  </span>
                )}
                {/* Duration */}
                {step.estimated_duration && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {step.estimated_duration}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-slate-400 transition-transform mt-1',
              expanded && 'rotate-180',
            )}
          />
        </div>

        {/* Expandable body */}
        {expanded && (
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>

            {/* Action buttons */}
            {step.status !== 'rejected' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={step.status === 'approved' || step.status === 'completed'}
                  onClick={() => onStatusChange('approved')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    step.status === 'approved' || step.status === 'completed'
                      ? 'bg-green-100 text-green-600 cursor-default'
                      : 'bg-green-500 text-white hover:bg-green-600',
                  )}
                >
                  <Check className="h-3 w-3" /> Approve
                </button>
                <button
                  onClick={() => onStatusChange('rejected')}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <X className="h-3 w-3" /> Reject
                </button>
                <button
                  disabled={step.status === 'completed'}
                  onClick={() => onStatusChange('completed')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    step.status === 'completed'
                      ? 'bg-ibm-100 text-ibm-600 cursor-default'
                      : 'bg-ibm-500 text-white hover:bg-ibm-600',
                  )}
                >
                  <Flag className="h-3 w-3" /> Complete
                </button>
              </div>
            )}

            {step.status === 'rejected' && (
              <div className="mt-3">
                <button
                  onClick={() => onStatusChange('pending')}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  ↩ Restore to Pending
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

function StatusIcon({ status }: { status: WorkflowStepStatus }) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-5 w-5 text-ibm-500" />
    case 'approved':  return <Check className="h-5 w-5 text-green-500" />
    case 'rejected':  return <XCircle className="h-5 w-5 text-red-400" />
    default:          return <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
  }
}
