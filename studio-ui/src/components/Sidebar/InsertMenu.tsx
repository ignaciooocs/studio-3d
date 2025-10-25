import { Stack, Button } from '@mui/material'
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { useStore } from '../../store/useStore'
import { useRef } from 'react'

function newId() {
  // Prefer crypto.randomUUID if available
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

// Botones para agregar cubo, esfera, texto y cargar modelo (GLTF/GLB)
export default function InsertMenu() {
  const addObject = useStore((s) => s.addObject)
  const setSelected = useStore((s) => s.setSelected)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const addText = () => {
    const id = newId()
    addObject({
      id,
      name: 'Texto',
      type: 'text',
      position: [0, 10, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      text: 'Hola',
      fontSize: 16,
      thickness: 4,
      color: '#9ca3af',
    })
    setSelected(id)
  }

  const onPickModel = () => fileInputRef.current?.click()

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.glb')) {
      alert('Solo se soportan archivos .glb (archivo binario empaquetado).')
      return
    }
    const url = URL.createObjectURL(file)
    const id = newId()
    addObject({
      id,
      name: file.name,
      type: 'custom',
      position: [0, 10, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      src: url,
      srcType: 'gltf',
    })
    setSelected(id)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb"
        hidden
        onChange={onFilesSelected}
      />
      <Stack spacing={1} direction="column">
        <Button variant="contained" startIcon={<ViewInArOutlinedIcon />} onClick={addCube}>Agregar cubo</Button>
        <Button variant="contained" startIcon={<CircleOutlinedIcon />} onClick={addSphere}>Agregar esfera</Button>
        <Button variant="contained" startIcon={<TextFieldsOutlinedIcon />} onClick={addText}>Texto 3D</Button>
        <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />} onClick={onPickModel}>Cargar modelo (GLB)</Button>
      </Stack>
    </>
  )
}
