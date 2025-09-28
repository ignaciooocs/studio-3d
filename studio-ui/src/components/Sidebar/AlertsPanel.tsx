import { Alert, Stack, Typography } from '@mui/material'

// Muestra alertas de validación (Fase 3)
export default function AlertsPanel() {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">Validaciones en tiempo real</Typography>
      <Alert severity="info">No hay alertas por ahora</Alert>
    </Stack>
  )
}
