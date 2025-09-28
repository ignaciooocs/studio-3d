import { Box, TextField, Typography, Stack, Divider } from '@mui/material'

// Inputs numéricos para posición, rotación, escala (Fase 2/3/4)
export default function ObjectProperties() {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">Transformaciones</Typography>
      <Divider />
      <Box>
        <Typography variant="body2" gutterBottom>Posición (mm)</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" label="X" type="number" inputProps={{ step: 1 }} fullWidth />
          <TextField size="small" label="Y" type="number" inputProps={{ step: 1 }} fullWidth />
          <TextField size="small" label="Z" type="number" inputProps={{ step: 1 }} fullWidth />
        </Stack>
      </Box>
      <Box>
        <Typography variant="body2" gutterBottom>Rotación (°)</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" label="X" type="number" inputProps={{ step: 1 }} fullWidth />
          <TextField size="small" label="Y" type="number" inputProps={{ step: 1 }} fullWidth />
          <TextField size="small" label="Z" type="number" inputProps={{ step: 1 }} fullWidth />
        </Stack>
      </Box>
      <Box>
        <Typography variant="body2" gutterBottom>Escala</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" label="X" type="number" inputProps={{ step: 0.1 }} fullWidth />
          <TextField size="small" label="Y" type="number" inputProps={{ step: 0.1 }} fullWidth />
          <TextField size="small" label="Z" type="number" inputProps={{ step: 0.1 }} fullWidth />
        </Stack>
      </Box>
    </Stack>
  )
}
