import { useState, useCallback } from 'react'
import { generateWorkflow } from '@/services/api'
import type { WorkflowStep, WorkflowStepStatus } from '@/types'

interface UseWorkflowReturn {
  steps: WorkflowStep[]
  role: string
  loading: boolean
  error: string | null
  generate: (role: string, department?: string) => Promise<void>
  updateStatus: (index: number, status: WorkflowStepStatus) => void
}

export function useWorkflow(): UseWorkflowReturn {
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (roleParam: string, department?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateWorkflow({
        role: roleParam.toLowerCase(),
        department: department || undefined,
      })
      const stepsWithStatus: WorkflowStep[] = res.steps.map((s) => ({
        ...s,
        status: 'pending' as WorkflowStepStatus,
      }))
      setSteps(stepsWithStatus)
      setRole(res.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflow.')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStatus = useCallback((index: number, status: WorkflowStepStatus) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s)),
    )
  }, [])

  return { steps, role, loading, error, generate, updateStatus }
}
