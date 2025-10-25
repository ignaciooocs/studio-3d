import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Switch,
  Box,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Chip,
  Stack
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { ExportFormat, ExportOptions } from '../utils/exportSTL'
import { DEFAULT_EXPORT_OPTIONS } from '../utils/exportSTL'
import { useStore } from '../store/useStore'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => Promise<void>
  loading?: boolean
}

const FORMAT_INFO = {
  stl: {
    name: 'STL',
    description: 'Formato estándar para impresión 3D',
    extension: '.stl',
    supports: ['Geometría', 'Binario/Texto']
  },
  obj: {
    name: 'OBJ',
    description: 'Formato universal de geometría 3D',
    extension: '.obj',
    supports: ['Geometría', 'Materiales básicos']
  },
  gltf: {
    name: 'GLTF',
    description: 'Formato moderno para aplicaciones web',
    extension: '.gltf',
    supports: ['Geometría', 'Materiales', 'Texturas', 'Animaciones']
  },
  glb: {
    name: 'GLB',
    description: 'GLTF binario (un solo archivo)',
    extension: '.glb',
    supports: ['Geometría', 'Materiales', 'Texturas', 'Animaciones']
  }
}

export function ExportDialog({ open, onClose, onExport, loading = false }: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const objects = useStore((s) => s.objects)
  const selectedId = useStore((s) => s.selectedId)
  
  const selectedObject = objects.find(obj => obj.id === selectedId)
  const hasSelection = selectedObject !== undefined
  const hasMultipleObjects = objects.length > 1

  const handleFormatChange = (format: ExportFormat) => {
    setOptions(prev => ({
      ...prev,
      format,
      // Ajustar opciones por defecto según el formato
      binary: format === 'stl' || format === 'glb'
    }))
  }

  const handleExport = async () => {
    try {
      await onExport(options)
      onClose()
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  const formatInfo = FORMAT_INFO[options.format]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exportar Modelo 3D</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Selección de formato */}
          <FormControl>
            <FormLabel>Formato de archivo</FormLabel>
            <RadioGroup
              value={options.format}
              onChange={(e) => handleFormatChange(e.target.value as ExportFormat)}
            >
              {Object.entries(FORMAT_INFO).map(([format, info]) => (
                <FormControlLabel
                  key={format}
                  value={format}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">
                        {info.name} ({info.extension})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {info.description}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {info.supports.map((feature) => (
                          <Chip
                            key={feature}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Información del formato seleccionado */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>{formatInfo.name}</strong>: {formatInfo.description}
            </Typography>
          </Alert>

          {/* Nombre del archivo */}
          <TextField
            label="Nombre del archivo"
            value={options.filename || ''}
            onChange={(e) => setOptions(prev => ({ ...prev, filename: e.target.value }))}
            placeholder="mi-modelo"
            helperText={`Se guardará como: ${options.filename || 'mi-modelo'}${formatInfo.extension}`}
          />

          {/* Opciones básicas */}
          <Box>
            {/* Opciones específicas por formato */}
            {(options.format === 'stl' || options.format === 'gltf') && (
              <FormControlLabel
                control={
                  <Switch
                    checked={options.binary || false}
                    onChange={(e) => setOptions(prev => ({ ...prev, binary: e.target.checked }))}
                  />
                }
                label={`Formato ${options.binary ? 'binario' : 'texto'}`}
              />
            )}

            {/* Selección de objetos */}
            {hasMultipleObjects && (
              <FormControlLabel
                control={
                  <Switch
                    checked={options.includeSelected || false}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeSelected: e.target.checked }))}
                  />
                }
                label={
                  hasSelection 
                    ? `Solo exportar "${selectedObject?.name || 'objeto seleccionado'}"` 
                    : 'Solo exportar objetos seleccionados'
                }
                disabled={!hasSelection}
              />
            )}
          </Box>

          {/* Opciones avanzadas */}
          <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Opciones avanzadas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {/* Factor de escala */}
                <Box>
                  <Typography gutterBottom>
                    Factor de escala: {options.scale}x
                  </Typography>
                  <Slider
                    value={options.scale || 1}
                    onChange={(_, value) => setOptions(prev => ({ ...prev, scale: value as number }))}
                    min={0.1}
                    max={10}
                    step={0.1}
                    marks={[
                      { value: 0.1, label: '0.1x' },
                      { value: 1, label: '1x' },
                      { value: 10, label: '10x' }
                    ]}
                  />
                </Box>

                {/* Unidades */}
                <FormControl>
                  <FormLabel>Unidades de exportación</FormLabel>
                  <RadioGroup
                    row
                    value={options.units}
                    onChange={(e) => setOptions(prev => ({ ...prev, units: e.target.value as any }))}
                  >
                    <FormControlLabel value="mm" control={<Radio />} label="Milímetros" />
                    <FormControlLabel value="cm" control={<Radio />} label="Centímetros" />
                    <FormControlLabel value="m" control={<Radio />} label="Metros" />
                  </RadioGroup>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Información de la escena */}
          <Box sx={{ p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Información de la escena
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {objects.length} objeto{objects.length !== 1 ? 's' : ''} en total
              {hasSelection && (
                <>
                  <br />• Seleccionado: {selectedObject?.name || selectedObject?.type || 'Sin nombre'}
                </>
              )}
              {options.includeSelected && hasSelection && (
                <>
                  <br />• Solo se exportará el objeto seleccionado
                </>
              )}
              {!options.includeSelected && (
                <>
                  <br />• Se exportarán todos los objetos de la escena
                </>
              )}
            </Typography>
          </Box>

          {/* Mostrar errores si los hay */}
          {/* TODO: Implementar manejo de errores desde el hook */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleExport} 
          variant="contained" 
          disabled={loading || objects.length === 0}
        >
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}