import { List, ListItemButton, ListItemText, Typography, Box } from '@mui/material'

// Lista de objetos en la escena con selección/eliminación (Fase 2)
export default function ObjectList() {
  const items: Array<{ id: string; name: string } > = []

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
        <ListItemButton key={o.id}>
          <ListItemText primary={o.name} />
        </ListItemButton>
      ))}
    </List>
  )
}
