import { useState, useEffect, useCallback } from 'react'
import { MeshyApi, Configuration, TaskStatusResponseDto } from '../client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Crear instancia de la API
const meshyApi = new MeshyApi(
  new Configuration({
    basePath: API_BASE_URL,
  })
)

export function useMeshyTasks() {
  const [tasks, setTasks] = useState<TaskStatusResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      // El endpoint getAllTasks no está en el cliente generado, usar fetch directamente
      const response = await fetch(`${API_BASE_URL}/meshy/tasks`)
      if (!response.ok) {
        throw new Error(`Error al obtener tareas: ${response.statusText}`)
      }
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar tareas al montar
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Polling para tareas en progreso
  useEffect(() => {
    const hasInProgressTasks = tasks.some(
      (task) => task.status === 'PENDING' || task.status === 'IN_PROGRESS'
    )

    if (!hasInProgressTasks) return

    const interval = setInterval(() => {
      fetchTasks()
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [tasks, fetchTasks])

  const createTask = useCallback(
    async (data: {
      name?: string
      imageUrl?: string
      imageBase64?: string
      modelType?: 'standard' | 'premium'
      targetPolycount?: number
      shouldTexture?: boolean
      shouldRemesh?: boolean
      symmetry?: 'none' | 'x' | 'y' | 'z'
      moderation?: boolean
    }) => {
      try {
        setError(null)
        const response = await meshyApi.meshyControllerCreateImageTo3DTask(data)
        // Recargar tareas después de crear
        await fetchTasks()
        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear tarea'
        setError(errorMessage)
        throw err
      }
    },
    [fetchTasks]
  )

  const cancelTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null)
        await meshyApi.meshyControllerCancelTask(taskId)
        await fetchTasks()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cancelar tarea'
        setError(errorMessage)
        throw err
      }
    },
    [fetchTasks]
  )

  const refreshTask = useCallback(
    async (taskId: string) => {
      try {
        setError(null)
        const response = await meshyApi.meshyControllerGetTaskStatus(taskId)
        // Actualizar la tarea en el estado
        setTasks((prev) =>
          prev.map((task) => (task.taskId === taskId ? response.data : task))
        )
        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarea'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const succeededTasks = tasks.filter((task) => task.status === 'SUCCEEDED')
  const inProgressTasks = tasks.filter(
    (task) => task.status === 'PENDING' || task.status === 'IN_PROGRESS'
  )
  const failedTasks = tasks.filter((task) => task.status === 'FAILED')

  return {
    tasks,
    succeededTasks,
    inProgressTasks,
    failedTasks,
    loading,
    error,
    fetchTasks,
    createTask,
    cancelTask,
    refreshTask,
  }
}
