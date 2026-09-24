export type BedShape = 'rect' | 'circle'

export interface PrinterSpec {
  id: string
  name: string
  // Tamaño de cama (X=ancho, Y=profundidad) en mm
  bed: { width: number; depth: number; shape?: BedShape }
  // Altura máxima de impresión en mm
  volume: { height: number }
  // Margen opcional de seguridad (mm) para límites de colocación
  safetyMargin?: number
}
