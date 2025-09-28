import { Box, TextField, Typography, Stack, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import { useStore } from '../../store/useStore'

const rad2deg = (r: number) => (r * 180) / Math.PI
const deg2rad = (d: number) => (d * Math.PI) / 180

// Inputs numéricos para posición, rotación, escala (Fase 2/3/4)
export default function ObjectProperties() {
  const mode = useStore((s) => s.transformMode)
  const setMode = useStore((s) => s.setTransformMode)
  const selectedId = useStore((s) => s.selectedId)
  const selected = useStore((s) => s.objects.find((o) => o.id === s.selectedId) || null)
  const updateObject = useStore((s) => s.updateObject)

  const onPosChange = (axis: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const value = parseFloat(e.target.value)
    if (Number.isNaN(value)) return
    const next = [...selected.position] as typeof selected.position
    next[axis] = value
    updateObject(selected.id, { position: next })
  }

  const onRotChange = (axis: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const valueDeg = parseFloat(e.target.value)
    if (Number.isNaN(valueDeg)) return
    const next = [...selected.rotation] as typeof selected.rotation
    next[axis] = deg2rad(valueDeg)
    updateObject(selected.id, { rotation: next })
  }

  const onScaleChange = (axis: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected) return
    const value = parseFloat(e.target.value)
    if (Number.isNaN(value)) return
    const next = [...selected.scale] as typeof selected.scale
    next[axis] = value
    updateObject(selected.id, { scale: next })
  }

  return (
    <Stack spacing={2}>
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

      <Typography variant="subtitle2" color="text.secondary">Transformaciones</Typography>
      <Divider />

      {!selected || !selectedId ? (
        <Typography variant="body2" color="text.secondary">Selecciona un objeto para editar sus propiedades.</Typography>
      ) : (
        <>
          <Box>
            <Typography variant="body2" gutterBottom>Posición (mm)</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="X" type="number" inputProps={{ step: 1 }} fullWidth value={selected.position[0]} onChange={onPosChange(0)} />
              <TextField size="small" label="Y" type="number" inputProps={{ step: 1 }} fullWidth value={selected.position[1]} onChange={onPosChange(1)} />
              <TextField size="small" label="Z" type="number" inputProps={{ step: 1 }} fullWidth value={selected.position[2]} onChange={onPosChange(2)} />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom>Rotación (°)</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="X" type="number" inputProps={{ step: 1 }} fullWidth value={rad2deg(selected.rotation[0]).toFixed(2)} onChange={onRotChange(0)} />
              <TextField size="small" label="Y" type="number" inputProps={{ step: 1 }} fullWidth value={rad2deg(selected.rotation[1]).toFixed(2)} onChange={onRotChange(1)} />
              <TextField size="small" label="Z" type="number" inputProps={{ step: 1 }} fullWidth value={rad2deg(selected.rotation[2]).toFixed(2)} onChange={onRotChange(2)} />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" gutterBottom>Escala</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" label="X" type="number" inputProps={{ step: 0.1 }} fullWidth value={selected.scale[0]} onChange={onScaleChange(0)} />
              <TextField size="small" label="Y" type="number" inputProps={{ step: 0.1 }} fullWidth value={selected.scale[1]} onChange={onScaleChange(1)} />
              <TextField size="small" label="Z" type="number" inputProps={{ step: 0.1 }} fullWidth value={selected.scale[2]} onChange={onScaleChange(2)} />
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  )
}
