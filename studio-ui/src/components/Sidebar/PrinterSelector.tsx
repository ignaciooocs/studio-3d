import { FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import { PRINTERS } from '../../core/printers/presets'
import { useStore } from '../../store/useStore'

export default function PrinterSelector() {
  const selectedPrinterId = useStore((s) => s.selectedPrinterId)
  const setSelectedPrinterId = useStore((s) => s.setSelectedPrinterId)
  const current = useStore((s) => s.getSelectedPrinter())

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Impresora</Typography>
      <FormControl fullWidth size="small">
        <InputLabel id="printer-select-label">Modelo</InputLabel>
        <Select
          labelId="printer-select-label"
          id="printer-select"
          value={selectedPrinterId}
          label="Modelo"
          onChange={(e) => setSelectedPrinterId(e.target.value as string)}
        >
          {PRINTERS.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary">
        Cama: {current.bed.width} × {current.bed.depth} mm · Altura: {current.volume.height} mm
      </Typography>
    </Stack>
  )
}
