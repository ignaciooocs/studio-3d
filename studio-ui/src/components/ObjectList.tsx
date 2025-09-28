import { List, ListItemButton, ListItemText, Typography, Box } from '@mui/material'
import { useStore } from '../store/useStore'

// Lista de objetos en la escena con selección/eliminación (Fase 2)
export default function ObjectList() {
  const items = useStore((s) => s.objects)
  const selectedId = useStore((s) => s.selectedId)
  const setSelected = useStore((s) => s.setSelected)

  if (items.length === 0) {
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" color="text.secondary">Sin objetos. Usa “Insertar” para añadir uno.</Typography>
      </Box>
    )
  }

  return (
    <List dense>
      {items.map((o) => (
        <ListItemButton key={o.id} selected={o.id === selectedId} onClick={() => setSelected(o.id)}>
          <ListItemText primary={o.name ?? o.type} />
        </ListItemButton>
      ))}
    </List>
  )
}
