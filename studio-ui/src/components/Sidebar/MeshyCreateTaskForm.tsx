import { useState, useRef } from 'react'
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material'
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'
import { useMeshyTasks } from '../../hooks/useMeshyTasks'

export default function MeshyCreateTaskForm() {
  const { createTask } = useMeshyTasks()
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [modelType, setModelType] = useState<'standard' | 'premium'>('standard')
  const [targetPolycount, setTargetPolycount] = useState<number>(10000)
  const [shouldTexture, setShouldTexture] = useState(false)
  const [shouldRemesh, setShouldRemesh] = useState(false)
  const [symmetry, setSymmetry] = useState<'none' | 'x' | 'y' | 'z'>('none')
  const [moderation, setModeration] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen')
      return
    }

    // Convertir a base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImageBase64(result)
      setImageUrl('') // Limpiar URL si se selecciona archivo
      setError(null)
    }
    reader.onerror = () => {
      setError('Error al leer el archivo')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!imageUrl && !imageBase64) {
      setError('Debes proporcionar una URL de imagen o seleccionar un archivo')
      return
    }

    setLoading(true)
    try {
      await createTask({
        name: name || undefined,
        imageUrl: imageUrl || undefined,
        imageBase64: imageBase64 || undefined,
        modelType,
        targetPolycount,
        shouldTexture,
        shouldRemesh,
        symmetry,
        moderation,
      })
      setSuccess(true)
      // Limpiar formulario
      setName('')
      setImageUrl('')
      setImageBase64(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la tarea'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success">¡Tarea creada exitosamente! Revisa la pestaña "En Cola" para ver el progreso.</Alert>
        )}

        <TextField
          label="Nombre del Modelo (Opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Mi Modelo 3D"
          fullWidth
          disabled={loading}
          helperText="Un nombre para identificar este modelo fácilmente"
        />

        <TextField
          label="URL de Imagen"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value)
            if (e.target.value) setImageBase64(null) // Limpiar base64 si se ingresa URL
          }}
          placeholder="https://ejemplo.com/imagen.jpg"
          fullWidth
          disabled={!!imageBase64 || loading}
          helperText="O selecciona un archivo de imagen abajo"
        />

        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={!!imageUrl || loading}
          />
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            disabled={!!imageUrl || loading}
          >
            {imageBase64 ? 'Imagen seleccionada' : 'Seleccionar Imagen'}
          </Button>
          {imageBase64 && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <img
                src={imageBase64}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 4 }}
              />
              <Button
                size="small"
                onClick={() => {
                  setImageBase64(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                sx={{ mt: 1 }}
              >
                Eliminar
              </Button>
            </Box>
          )}
        </Box>

        <FormControl fullWidth>
          <InputLabel>Tipo de Modelo</InputLabel>
          <Select
            value={modelType}
            label="Tipo de Modelo"
            onChange={(e) => setModelType(e.target.value as 'standard' | 'premium')}
            disabled={loading}
          >
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Polígonos Objetivo"
          type="number"
          value={targetPolycount}
          onChange={(e) => setTargetPolycount(parseInt(e.target.value) || 10000)}
          inputProps={{ min: 1000, max: 50000 }}
          fullWidth
          disabled={loading}
          helperText="Entre 1000 y 50000"
        />

        <FormControl fullWidth>
          <InputLabel>Simetría</InputLabel>
          <Select
            value={symmetry}
            label="Simetría"
            onChange={(e) => setSymmetry(e.target.value as 'none' | 'x' | 'y' | 'z')}
            disabled={loading}
          >
            <MenuItem value="none">Ninguna</MenuItem>
            <MenuItem value="x">Eje X</MenuItem>
            <MenuItem value="y">Eje Y</MenuItem>
            <MenuItem value="z">Eje Z</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={shouldTexture}
              onChange={(e) => setShouldTexture(e.target.checked)}
              disabled={loading}
            />
          }
          label="Aplicar Texturas"
        />

        <FormControlLabel
          control={
            <Switch
              checked={shouldRemesh}
              onChange={(e) => setShouldRemesh(e.target.checked)}
              disabled={loading}
            />
          }
          label="Aplicar Remallado"
        />

        <FormControlLabel
          control={
            <Switch
              checked={moderation}
              onChange={(e) => setModeration(e.target.checked)}
              disabled={loading}
            />
          }
          label="Moderación de Contenido"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || (!imageUrl && !imageBase64)}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Creando Tarea...' : 'Crear Modelo 3D'}
        </Button>
      </Stack>
    </Box>
  )
}
