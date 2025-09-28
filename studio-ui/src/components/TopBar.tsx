import { AppBar, Toolbar, Typography, Button, Box, Switch, FormControlLabel } from '@mui/material'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import { useStore } from '../store/useStore'

// Placeholder top bar for global actions (Guardar, Exportar STL, Reset)
// Wiring to the store/utils will be added in later phases
export default function TopBar() {
  const showBuildVolume = useStore((s) => s.showBuildVolume)
  const toggleBuildVolume = useStore((s) => s.toggleBuildVolume)

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h6" component="div">Studio 3D</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <FormControlLabel
          control={<Switch checked={showBuildVolume} onChange={() => toggleBuildVolume()} />}
          label="Límites"
          sx={{ mr: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<SaveRoundedIcon />}>Guardar</Button>
          <Button variant="contained" startIcon={<IosShareRoundedIcon />}>Exportar STL</Button>
          <Button color="inherit" startIcon={<RestartAltRoundedIcon />}>Reset</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
