import { AppBar, Toolbar, Typography, Button, Box, FormControlLabel, Switch, Stack, Popover } from '@mui/material'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { useStore } from '../store/useStore'
import { useState } from 'react'

// Top bar with global actions. Preferences are shown in a popover anchored to the button.
export default function TopBar() {
  const reset = useStore((s) => s.reset)

  // Preferences state from store
  const showBuildVolume = useStore((s) => s.showBuildVolume)
  const setShowBuildVolume = useStore((s) => s.setShowBuildVolume)
  const canvasBgColor = useStore((s) => s.canvasBgColor)
  const bedColor = useStore((s) => s.bedColor)
  const setCanvasBgColor = useStore((s) => s.setCanvasBgColor)
  const setBedColor = useStore((s) => s.setBedColor)
  const showGridMinor = useStore((s) => s.showGridMinor)
  const showGridMajor = useStore((s) => s.showGridMajor)
  const setShowGridMinor = useStore((s) => s.setShowGridMinor)
  const setShowGridMajor = useStore((s) => s.setShowGridMajor)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h6" component="div">Studio 3D</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button startIcon={<SettingsOutlinedIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>Preferencias</Button>
        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
          <Button variant="outlined" startIcon={<SaveRoundedIcon />}>Guardar</Button>
          <Button variant="contained" startIcon={<IosShareRoundedIcon />}>Exportar STL</Button>
          <Button color="inherit" startIcon={<RestartAltRoundedIcon />} onClick={() => reset()}>Reset</Button>
        </Box>
      </Toolbar>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, width: 360 } }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle1">Preferencias</Typography>

          <Typography variant="subtitle2">Visibilidad</Typography>
          <FormControlLabel
            control={<Switch checked={showBuildVolume} onChange={(e) => setShowBuildVolume(e.target.checked)} />}
            label="Mostrar límites de impresión"
          />
          <FormControlLabel
            control={<Switch checked={showGridMajor} onChange={(e) => setShowGridMajor(e.target.checked)} />}
            label="Mostrar secciones (10 mm)"
          />
          <FormControlLabel
            control={<Switch checked={showGridMinor} onChange={(e) => setShowGridMinor(e.target.checked)} />}
            label="Mostrar celdas finas (5 mm)"
          />

          <Typography variant="subtitle2">Colores</Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Fondo</Typography>
              <input type="color" aria-label="Color de fondo" value={canvasBgColor} onChange={(e) => setCanvasBgColor(e.target.value)} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Cama</Typography>
              <input type="color" aria-label="Color de la cama" value={bedColor} onChange={(e) => setBedColor(e.target.value)} />
            </Stack>
          </Stack>
        </Stack>
      </Popover>
    </AppBar>
  )
}
