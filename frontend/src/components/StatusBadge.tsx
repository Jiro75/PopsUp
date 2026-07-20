/**
 * StatusBadge
 *
 * Displays a live traffic-light badge for the backend status, plus
 * secondary pills for the AI mode and Qdrant connection state.
 *
 * Props:
 *   compact – when true, renders only the coloured dot + "Online / Offline"
 *             label (used in headers, sidebars). Defaults to false (full card).
 */

import { cn } from '@/lib/utils'
import { useHealthCheck, type BackendStatus, type AiMode, type QdrantStatus } from '@/hooks/useHealthCheck'

// ── Colour maps ───────────────────────────────────────────────────────────────

const STATUS_DOT: Record<BackendStatus, string> = {
  checking: 'bg-yellow-400 animate-pulse',
  online:   'bg-green-500',
  offline:  'bg-red-500',
}

const STATUS_LABEL: Record<BackendStatus, string> = {
  checking: 'Checking…',
  online:   'Online',
  offline:  'Offline',
}

const STATUS_TEXT: Record<BackendStatus, string> = {
  checking: 'text-yellow-700',
  online:   'text-green-700',
  offline:  'text-red-700',
}

const STATUS_BG: Record<BackendStatus, string> = {
  checking: 'bg-yellow-50 border-yellow-200',
  online:   'bg-green-50  border-green-200',
  offline:  'bg-red-50    border-red-200',
}

const AI_MODE_LABEL: Record<AiMode, string> = {
  watsonx: 'watsonx.ai',
  mock:    'Mock / Demo',
  unknown: 'AI: —',
}

const AI_MODE_STYLE: Record<AiMode, string> = {
  watsonx: 'bg-ibm-100 text-ibm-700 border-ibm-200',
  mock:    'bg-slate-100 text-slate-600 border-slate-200',
  unknown: 'bg-slate-100 text-slate-500 border-slate-200',
}

const QDRANT_LABEL: Record<QdrantStatus, string> = {
  connected:   'Qdrant ✓',
  unavailable: 'Qdrant ✗',
  unknown:     'Qdrant —',
}

const QDRANT_STYLE: Record<QdrantStatus, string> = {
  connected:   'bg-green-50  text-green-700  border-green-200',
  unavailable: 'bg-red-50    text-red-700    border-red-200',
  unknown:     'bg-slate-100 text-slate-500  border-slate-200',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  /** When true renders a minimal inline dot + label only. */
  compact?: boolean
  className?: string
}

export default function StatusBadge({ compact = false, className }: StatusBadgeProps) {
  const { status, version, aiMode, qdrant } = useHealthCheck()

  // ── Compact variant (dot + label) ────────────────────────────────────────
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
        <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[status])} />
        <span className={STATUS_TEXT[status]}>{STATUS_LABEL[status]}</span>
      </span>
    )
  }

  // ── Full card variant ─────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 flex flex-wrap items-center gap-3',
        STATUS_BG[status],
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {/* Main status indicator */}
      <span className="flex items-center gap-2 text-sm font-semibold shrink-0">
        <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', STATUS_DOT[status])} />
        <span className={STATUS_TEXT[status]}>
          Backend {STATUS_LABEL[status]}
        </span>
        {version && (
          <span className="text-xs font-normal text-slate-400">v{version}</span>
        )}
      </span>

      {/* Divider */}
      <span className="hidden sm:block h-4 w-px bg-slate-300" aria-hidden />

      {/* AI mode pill */}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          AI_MODE_STYLE[aiMode],
        )}
      >
        {AI_MODE_LABEL[aiMode]}
      </span>

      {/* Qdrant pill */}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          QDRANT_STYLE[qdrant],
        )}
      >
        {QDRANT_LABEL[qdrant]}
      </span>
    </div>
  )
}
