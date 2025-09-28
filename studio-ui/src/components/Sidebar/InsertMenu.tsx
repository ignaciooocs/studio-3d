import { Stack, Button } from '@mui/material'
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined'
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined'
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined'

// Botones para agregar cubo, esfera, texto (Fase 2/4)
export default function InsertMenu() {
  return (
    <Stack spacing={1} direction="column">
      <Button variant="contained" startIcon={<ViewInArOutlinedIcon />}>Agregar cubo</Button>
      <Button variant="contained" startIcon={<CircleOutlinedIcon />}>Agregar esfera</Button>
      <Button variant="outlined" startIcon={<TextFieldsOutlinedIcon />}>Texto 3D</Button>
    </Stack>
  )
}
