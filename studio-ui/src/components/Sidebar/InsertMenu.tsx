import { Stack, Button } from '@mui/material'
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined'
import { useStore } from '../../store/useStore'

function newId() {
  // Prefer crypto.randomUUID if available
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

// Botones para agregar cubo, esfera, texto (Fase 2/4)
export default function InsertMenu() {
  const addObject = useStore((s) => s.addObject)
  const setSelected = useStore((s) => s.setSelected)

  const addCube = () => {
    const id = newId()
    addObject({
      id,
      name: 'Cubo',
      type: 'cube',
      position: [0, 10, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#7dd3fc',
    })
    setSelected(id)
  }

  const addSphere = () => {
    const id = newId()
    addObject({
      id,
      name: 'Esfera',
      type: 'sphere',
      position: [0, 10, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#a7f3d0',
    })
    setSelected(id)
  }

  return (
    <Stack spacing={1} direction="column">
      <Button variant="contained" startIcon={<ViewInArOutlinedIcon />} onClick={addCube}>Agregar cubo</Button>
      <Button variant="contained" startIcon={<CircleOutlinedIcon />} onClick={addSphere}>Agregar esfera</Button>
      <Button variant="outlined" startIcon={<TextFieldsOutlinedIcon />} disabled>Texto 3D</Button>
    </Stack>
  )
}
