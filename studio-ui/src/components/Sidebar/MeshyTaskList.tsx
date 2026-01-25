import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  AddToPhotos as AddToPhotosIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import type { TaskStatusResponseDto } from '../../client'
import { useMeshyTasks } from '../../hooks/useMeshyTasks'
import { useEditorContextCommands } from '../../context/EditorContext'
import { useStore } from '../../store/useStore'

// Cache para almacenar URLs de modelos descargados (taskId -> blob URL)
const modelCache = new Map<string, string>()

interface MeshyTaskListProps {
  tasks: TaskStatusResponseDto[]
  showStatus?: boolean
}

function getStatusColor(status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'SUCCEEDED':
      return 'success'
    case 'IN_PROGRESS':
      return 'primary'
    case 'PENDING':
      return 'warning'
    case 'FAILED':
      return 'error'
    default:
      return 'default'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'SUCCEEDED':
      return 'Completado'
    case 'IN_PROGRESS':
      return 'En Progreso'
    case 'PENDING':
      return 'Pendiente'
    case 'FAILED':
      return 'Fallido'
    default:
      return status
  }
}

export default function MeshyTaskList({ tasks, showStatus = false }: MeshyTaskListProps) {
  const { cancelTask, refreshTask } = useMeshyTasks()
  const { addObject } = useEditorContextCommands()
  const setSelected = useStore((s) => s.setSelected)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set())

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedTaskId(taskId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTaskId(null)
  }

  const handleCancel = async () => {
    if (selectedTaskId) {
      try {
        await cancelTask(selectedTaskId)
      } catch (err) {
        console.error('Error canceling task:', err)
      }
    }
    handleMenuClose()
  }

  const handleRefresh = async () => {
    if (selectedTaskId) {
      try {
        await refreshTask(selectedTaskId)
      } catch (err) {
        console.error('Error refreshing task:', err)
      }
    }
    handleMenuClose()
  }

  // Obtener URL del modelo (desde cache o descargar a través del proxy del backend)
  // Usamos el endpoint de proxy para evitar problemas de CORS
  const getModelUrl = async (task: TaskStatusResponseDto, format: 'glb' | 'fbx' | 'obj' | 'usdz' = 'glb'): Promise<string> => {
    const cacheKey = `${task.taskId}-${format}`
    
    // Verificar cache primero
    if (modelCache.has(cacheKey)) {
      return modelCache.get(cacheKey)!
    }

    // Descargar a través del proxy del backend (evita problemas de CORS)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${API_BASE_URL}/meshy/task/${task.taskId}/proxy?format=${format}`)
    if (!response.ok) {
      throw new Error(`Error al descargar modelo: ${response.statusText}`)
    }
    
    // Convertir la respuesta a blob y crear blob URL
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    // Guardar en cache para reutilizar
    modelCache.set(cacheKey, blobUrl)
    return blobUrl
  }

  // Cargar modelo a la escena
  const handleLoadToScene = async (task: TaskStatusResponseDto, format: 'glb' | 'fbx' | 'obj' | 'usdz' = 'glb') => {
    const cacheKey = `${task.taskId}-${format}`
    
    // Evitar múltiples cargas simultáneas
    if (loadingModels.has(cacheKey)) return
    
    setLoadingModels((prev) => new Set(prev).add(cacheKey))
    
    try {
      const modelUrl = await getModelUrl(task, format)
      
      // Agregar el modelo al editor
      const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2)
      addObject({
        id,
        name: task.name || `Modelo Meshy ${task.taskId.slice(0, 8)}`,
        type: 'custom',
        position: [0, 10, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        src: modelUrl,
        srcType: 'gltf',
      })
      setSelected(id)
    } catch (err) {
      console.error('Error loading model to scene:', err)
      alert('Error al cargar el modelo a la escena')
    } finally {
      setLoadingModels((prev) => {
        const next = new Set(prev)
        next.delete(cacheKey)
        return next
      })
    }
  }

  // Descargar modelo como archivo
  const handleDownload = async (task: TaskStatusResponseDto, format: 'glb' | 'fbx' | 'obj' | 'usdz' = 'glb') => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${API_BASE_URL}/meshy/task/${task.taskId}/download?format=${format}`)
      if (!response.ok) {
        throw new Error('Error al descargar modelo')
      }
      const data = await response.json()
      
      // Descargar el archivo
      const downloadResponse = await fetch(data.downloadUrl)
      const blob = await downloadResponse.blob()
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `modelo-meshy-${task.taskId.slice(0, 8)}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      handleMenuClose()
    } catch (err) {
      console.error('Error downloading model:', err)
      alert('Error al descargar el modelo')
    }
  }

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {showStatus
            ? 'No hay tareas en cola'
            : 'No hay modelos creados. Crea uno desde la pestaña "Crear"'}
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <List dense>
        {tasks.map((task) => (
          <ListItem
            key={task.taskId}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {task.name || `Modelo ${task.taskId.slice(0, 8)}`}
                    </Typography>
                    {showStatus && (
                      <Chip
                        label={getStatusLabel(task.status)}
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Creado: {new Date(task.createdAt).toLocaleString()}
                    </Typography>
                    {task.progress !== undefined && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {task.progress}%
                        </Typography>
                      </Box>
                    )}
                    {task.error && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        {task.error}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {task.status === 'SUCCEEDED' && (
                  <>
                    <Tooltip title="Cargar a Escena">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleLoadToScene(task)}
                        color="primary"
                        disabled={loadingModels.has(`${task.taskId}-glb`)}
                        sx={{ mr: 1 }}
                      >
                        {loadingModels.has(`${task.taskId}-glb`) ? (
                          <CircularProgress size={16} />
                        ) : (
                          <AddToPhotosIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDownload(task)}
                        sx={{ mr: 1 }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => handleMenuOpen(e, task.taskId)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </Box>
            {task.status === 'SUCCEEDED' && task.modelUrls && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Formatos disponibles:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Object.keys(task.modelUrls).map((format) => {
                    const cacheKey = `${task.taskId}-${format}`
                    const isLoading = loadingModels.has(cacheKey)
                    return (
                      <Button
                        key={format}
                        size="small"
                        variant="outlined"
                        onClick={() => handleLoadToScene(task, format as 'glb' | 'fbx' | 'obj' | 'usdz')}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={12} /> : <AddToPhotosIcon />}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        {format.toUpperCase()}
                      </Button>
                    )
                  })}
                </Box>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleRefresh}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Actualizar
        </MenuItem>
        {(selectedTaskId &&
          tasks.find((t) => t.taskId === selectedTaskId)?.status !== 'SUCCEEDED' &&
          tasks.find((t) => t.taskId === selectedTaskId)?.status !== 'FAILED') && (
          <MenuItem onClick={handleCancel}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Cancelar
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
