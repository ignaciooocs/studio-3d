import { List, ListItemButton, ListItemText, Typography, Box, IconButton } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { useStore } from '../store/useStore'
import { useEditorContextCommands } from '../context/EditorContext'
import type { SceneObject } from '../store/useStore'

// Función para generar nombres dinámicos para objetos de texto
function getDisplayName(obj: SceneObject): string {
  // Si tiene nombre personalizado, usarlo siempre
  if (obj.name && obj.name.trim()) {
    return obj.name.trim()
  }
  
  // Si es texto y tiene contenido, usar el contenido como nombre
  if (obj.type === 'text' && obj.text) {
    const textContent = obj.text.trim()
    if (textContent.length > 20) {
      return `"${textContent.substring(0, 17)}..."`
    }
    return `"${textContent}"`
  }
  
  // Para otros tipos, usar el tipo por defecto con primera letra mayúscula
  return obj.type.charAt(0).toUpperCase() + obj.type.slice(1)
}

// Lista de objetos en la escena con selección/eliminación (Fase 2)
export default function ObjectList() {
  const items = useStore((s) => s.objects)
  const selectedId = useStore((s) => s.selectedId)
  const setSelected = useStore((s) => s.setSelected)
  const { deleteObject } = useEditorContextCommands()

  const handleDeleteObject = (objectId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevenir que se seleccione el objeto al hacer click en eliminar
    deleteObject(objectId)
  }

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
          <ListItemText primary={getDisplayName(o)} />
          <IconButton
            size="small"
            onClick={(e) => handleDeleteObject(o.id, e)}
            sx={{ 
              ml: 1,
              '&:hover': { color: 'error.main' }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </ListItemButton>
      ))}
    </List>
  )
}
