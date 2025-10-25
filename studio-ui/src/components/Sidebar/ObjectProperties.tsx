import { Box, TextField, Typography, Stack, Divider, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import StraightenIcon from '@mui/icons-material/Straighten'
import { useStore } from '../../store/useStore'
import { useObjectDimensions } from '../../hooks/useObjectDimensions'
import { useEditorContextCommands } from '../../context/EditorContext'

const rad2deg = (r: number) => (r * 180) / Math.PI
const deg2rad = (d: number) => (d * Math.PI) / 180


// Inputs numéricos para posición, rotación, escala (Fase 2/3/4)
export default function ObjectProperties() {
  const mode = useStore((s) => s.transformMode)
  const setMode = useStore((s) => s.setTransformMode)
  const selectedId = useStore((s) => s.selectedId)
  const selected = useStore((s) => s.objects.find((o) => o.id === s.selectedId) || null)
  const commands = useEditorContextCommands()
  
  // Usar el hook para calcular dimensiones
  const dimensions = useObjectDimensions(selectedId)

  const onPosChange = (axis: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const value = parseFloat(e.target.value)
    if (Number.isNaN(value)) return
    const next = [...selected.position] as typeof selected.position
    next[axis] = value
    // Usar comando para que se registre en el historial de undo/redo
    commands.moveObject(selected.id, next)
  }

  const onRotChange = (axis: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const valueDeg = parseFloat(e.target.value)
    if (Number.isNaN(valueDeg)) return
    const next = [...selected.rotation] as typeof selected.rotation
    next[axis] = deg2rad(valueDeg)
    // Usar comando para que se registre en el historial de undo/redo
    commands.rotateObject(selected.id, next)
  }

  const onScaleChange = (axis: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const value = parseFloat(e.target.value)
    if (Number.isNaN(value)) return
    const next = [...selected.scale] as typeof selected.scale
    next[axis] = value
    // Usar comando para que se registre en el historial de undo/redo
    commands.scaleObject(selected.id, next)
  }

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    // Usar comando para que se registre en el historial de undo/redo
    commands.updateObjectProperties(selected.id, { text: e.target.value }, `Change text content`)
  }

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    // Usar comando para que se registre en el historial de undo/redo
    commands.updateObjectProperties(selected.id, { name: e.target.value }, `Change object name`)
  }

  const onFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const v = parseFloat(e.target.value)
    if (Number.isNaN(v)) return
    // Usar comando para que se registre en el historial de undo/redo
    commands.updateObjectProperties(selected.id, { fontSize: v }, `Change font size`)
  }

  const onThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const v = parseFloat(e.target.value)
    if (Number.isNaN(v)) return
    // Usar comando para que se registre en el historial de undo/redo
    commands.updateObjectProperties(selected.id, { thickness: v }, `Change text thickness`)
  }

  return (
    <Stack spacing={2}>
       {/* Campo para nombre personalizado */}
      {selected && selectedId && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Identificación</Typography>
          <TextField 
            size="small" 
            label="Nombre personalizado" 
            fullWidth 
            value={selected.name ?? ''} 
            onChange={onNameChange}
            placeholder={`${selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}${selected.type === 'text' && selected.text ? ` "${selected.text}"` : ''}`}
            helperText="Deja vacío para usar el nombre automático"
          />
        </Box>
      )}
      <Typography variant="subtitle2" color="text.secondary">Herramientas</Typography>
      <ToggleButtonGroup
        color="primary"
        exclusive
        size="small"
        value={mode}
        onChange={(_, v) => v && setMode(v)}
      >
        <ToggleButton value="translate" aria-label="Mover"><OpenWithIcon fontSize="small" />&nbsp;Mover</ToggleButton>
        <ToggleButton value="rotate" aria-label="Rotar"><Rotate90DegreesCcwIcon fontSize="small" />&nbsp;Rotar</ToggleButton>
        <ToggleButton value="scale" aria-label="Escalar"><ZoomOutMapIcon fontSize="small" />&nbsp;Escalar</ToggleButton>
      </ToggleButtonGroup>

      {dimensions && (
        <>
          <Typography variant="subtitle2" color="text.secondary">Dimensiones</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StraightenIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">Ancho:</Typography>
              <Chip 
                label={`${dimensions.width} mm`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StraightenIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">Alto:</Typography>
              <Chip 
                label={`${dimensions.height} mm`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StraightenIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">Profundidad:</Typography>
              <Chip 
                label={`${dimensions.depth} mm`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Dimensiones aproximadas para impresión 3D
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Typography variant="subtitle2" color="text.secondary">Transformaciones</Typography>
      <Divider />

      {!selected || !selectedId ? (
        <Typography variant="body2" color="text.secondary">Selecciona un objeto para editar sus propiedades.</Typography>
      ) : (
        <>
          {selected.type === 'text' && (
            <Box>
              <Typography variant="body2" gutterBottom>Texto 3D</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField size="small" label="Contenido" fullWidth value={selected.text ?? ''} onChange={onTextChange} />
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField size="small" label="Tamaño (mm)" type="number" inputProps={{ step: 1, min: 1 }} fullWidth value={selected.fontSize ?? 16} onChange={onFontSizeChange} />
                <TextField size="small" label="Grosor (mm)" type="number" inputProps={{ step: 1, min: 1 }} fullWidth value={selected.thickness ?? 4} onChange={onThicknessChange} />
              </Stack>
            </Box>
          )}

          <Box>
            <Typography variant="body2" gutterBottom>Posición (mm)</Typography>
            <Stack direction="row" spacing={1}>
              <TextField color='error' size="small" label="X" type="number" inputProps={{ step: 1 }} fullWidth value={selected.position[0]} onChange={onPosChange(0)} />
              <TextField color='success' size="small" label="Y" type="number" inputProps={{ step: 1 }} fullWidth value={selected.position[1]} onChange={onPosChange(1)} />
              <TextField color='info' size="small" label="Z" type="number" inputProps={{ step: 1 }} fullWidth value={selected.position[2]} onChange={onPosChange(2)} />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom>Rotación (°)</Typography>
            <Stack direction="row" spacing={1}>
              <TextField color='error' size="small" label="X" type="number" inputProps={{ step: 1 }} fullWidth value={rad2deg(selected.rotation[0]).toFixed(2)} onChange={onRotChange(0)} />
              <TextField color='success' size="small" label="Y" type="number" inputProps={{ step: 1 }} fullWidth value={rad2deg(selected.rotation[1]).toFixed(2)} onChange={onRotChange(1)} />
              <TextField color='info' size="small" label="Z" type="number" inputProps={{ step: 1 }} fullWidth value={rad2deg(selected.rotation[2]).toFixed(2)} onChange={onRotChange(2)} />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom>Escala</Typography>
            <Stack direction="row" spacing={1}>
              <TextField color='error' size="small" label="X" type="number" inputProps={{ step: 0.1 }} fullWidth value={selected.scale[0]} onChange={onScaleChange(0)} />
              <TextField color='success' size="small" label="Y" type="number" inputProps={{ step: 0.1 }} fullWidth value={selected.scale[1]} onChange={onScaleChange(1)} />
              <TextField color='info' size="small" label="Z" type="number" inputProps={{ step: 0.1 }} fullWidth value={selected.scale[2]} onChange={onScaleChange(2)} />
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  )
}
