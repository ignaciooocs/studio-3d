import type { PrinterSpec } from './types'

// Presets de impresoras. Añadir nuevas aquí en el futuro.
export const PRINTERS: PrinterSpec[] = [
  {
    id: 'creality-ender-3-v3-ke',
    name: 'Creality Ender 3 V3 KE',
    bed: { width: 220, depth: 220 },
    volume: { height: 250 },
    safetyMargin: 0,
  },
  {
    id: 'bambu-lab-a1',
    name: 'Bambu Lab A1',
    bed: { width: 256, depth: 256 },
    volume: { height: 256 },
    safetyMargin: 0,
  },
  {
    id: 'bambu-lab-a1-mini',
    name: 'Bambu Lab A1 Mini',
    bed: { width: 180, depth: 180 },
    volume: { height: 180 },
    safetyMargin: 0,
  },
]

export function getPrinterById(id: string): PrinterSpec | undefined {
  return PRINTERS.find((p) => p.id === id)
}

export const DEFAULT_PRINTER_ID = PRINTERS[0].id
