/**
 * useHealthCheck
 *
 * Polls GET /health every 5 seconds and returns a live status object.
 *
 * Returned shape:
 *   status   – "checking" | "online" | "offline"
 *   version  – backend app version string, e.g. "0.1.0"
 *   aiMode   – "watsonx" | "mock" | "unknown"
 *   qdrant   – "connected" | "unavailable" | "unknown"
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export type BackendStatus = 'checking' | 'online' | 'offline'
export type AiMode       = 'watsonx'  | 'mock'   | 'unknown'
export type QdrantStatus = 'connected' | 'unavailable' | 'unknown'

export interface HealthState {
  status:  BackendStatus
  version: string
  aiMode:  AiMode
  qdrant:  QdrantStatus
}

const POLL_INTERVAL_MS = 5_000

// The /health endpoint returns at minimum: { status, version }
// Future backend additions may include ai_mode and qdrant_status —
// the hook reads them defensively so it works with both old and new backends.
interface RawHealthResponse {
  status?:       string
  version?:      string
  // optional future fields
  ai_mode?:      string
  qdrant_status?: string
}

function parseAiMode(raw: string | undefined): AiMode {
  if (!raw) return 'unknown'
  const lower = raw.toLowerCase()
  if (lower.includes('watsonx') || lower.includes('live')) return 'watsonx'
  if (lower.includes('mock')    || lower.includes('demo')) return 'mock'
  return 'unknown'
}

function parseQdrant(raw: string | undefined): QdrantStatus {
  if (!raw) return 'unknown'
  const lower = raw.toLowerCase()
  if (lower.includes('connect') || lower === 'ok')  return 'connected'
  if (lower.includes('unavail') || lower.includes('error')) return 'unavailable'
  return 'unknown'
}

export function useHealthCheck(): HealthState {
  const [state, setState] = useState<HealthState>({
    status:  'checking',
    version: '',
    aiMode:  'unknown',
    qdrant:  'unknown',
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })

      if (!res.ok) {
        setState((prev) => ({ ...prev, status: 'offline' }))
        return
      }

      const data: RawHealthResponse = await res.json()

      setState({
        status:  'online',
        version: data.version ?? '',
        aiMode:  parseAiMode(data.ai_mode),
        qdrant:  parseQdrant(data.qdrant_status),
      })
    } catch {
      setState((prev) => ({ ...prev, status: 'offline' }))
    }
  }, [])

  useEffect(() => {
    // Kick off immediately, then on interval
    poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
      }
    }
  }, [poll])

  return state
}
