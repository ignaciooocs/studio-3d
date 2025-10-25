import { STLExporter, OBJExporter, GLTFExporter } from 'three-stdlib'
import * as THREE from 'three'

// Tipos de formatos soportados
export type ExportFormat = 'stl' | 'obj' | 'gltf' | 'glb'

// Opciones de exportación
export interface ExportOptions {
  format: ExportFormat
  binary?: boolean // Para STL y GLTF/GLB
  includeSelected?: boolean // Solo objetos seleccionados
  selectedIds?: string[] // IDs específicos a exportar
  filename?: string
  scale?: number // Factor de escala (1 = sin cambios)
  units?: 'mm' | 'cm' | 'm' // Unidades de exportación
}

// Configuración por defecto
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'stl',
  binary: true,
  includeSelected: false,
  filename: 'model',
  scale: 1,
  units: 'mm'
}

// Obtiene el tipo MIME según el formato
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'stl': return 'model/stl'
    case 'obj': return 'model/obj'
    case 'gltf': return 'model/gltf+json'
    case 'glb': return 'model/gltf-binary'
    default: return 'application/octet-stream'
  }
}

// Obtiene la extensión de archivo según el formato
function getFileExtension(format: ExportFormat): string {
  return format === 'glb' ? 'glb' : format
}

// Exporta un Object3D a STL
function exportToSTL(root: THREE.Object3D, options: ExportOptions): Blob {
  const exporter = new STLExporter()
  
  if (options.binary) {
    const dataView = exporter.parse(root, { binary: true })
    const ab = new ArrayBuffer(dataView.byteLength)
    new Uint8Array(ab).set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength))
    return new Blob([ab], { type: getMimeType('stl') })
  } else {
    const text = exporter.parse(root)
    return new Blob([text], { type: getMimeType('stl') })
  }
}

// Exporta un Object3D a OBJ
function exportToOBJ(root: THREE.Object3D): Blob {
  const exporter = new OBJExporter()
  const text = exporter.parse(root)
  return new Blob([text], { type: getMimeType('obj') })
}

// Exporta un Object3D a GLTF/GLB
async function exportToGLTF(root: THREE.Object3D, options: ExportOptions): Promise<Blob> {
  const exporter = new GLTFExporter()
  
  return new Promise((resolve, reject) => {
    exporter.parse(
      root,
      (result) => {
        if (options.format === 'glb' || options.binary) {
          // GLB (binario)
          const blob = new Blob([result as ArrayBuffer], { type: getMimeType('glb') })
          resolve(blob)
        } else {
          // GLTF (JSON)
          const text = JSON.stringify(result, null, 2)
          const blob = new Blob([text], { type: getMimeType('gltf') })
          resolve(blob)
        }
      },
      (error) => reject(error),
      {
        binary: options.format === 'glb' || options.binary
      }
    )
  })
}

// Función principal de exportación
export async function exportObject(root: THREE.Object3D, options: Partial<ExportOptions> = {}): Promise<Blob> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options }
  
  // Aplicar escala si es necesaria
  let objectToExport = root
  if (opts.scale && opts.scale !== 1) {
    objectToExport = root.clone()
    objectToExport.scale.multiplyScalar(opts.scale)
  }
  
  switch (opts.format) {
    case 'stl':
      return exportToSTL(objectToExport, opts)
    case 'obj':
      return exportToOBJ(objectToExport)
    case 'gltf':
    case 'glb':
      return await exportToGLTF(objectToExport, opts)
    default:
      throw new Error(`Formato no soportado: ${opts.format}`)
  }
}

// Función legacy (mantener compatibilidad)
export function exportObjectToSTL(root: any, options?: { binary?: boolean }) {
  return exportToSTL(root, { 
    format: 'stl', 
    binary: options?.binary ?? true 
  } as ExportOptions)
}

// Helper para disparar descarga en el browser
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Función completa de exportación y descarga
export async function exportAndDownload(
  root: THREE.Object3D, 
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options }
  const blob = await exportObject(root, opts)
  const extension = getFileExtension(opts.format)
  const filename = `${opts.filename}.${extension}`
  downloadBlob(blob, filename)
}
