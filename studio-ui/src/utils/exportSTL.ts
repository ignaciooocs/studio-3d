import { STLExporter } from 'three-stdlib'

// Exporta un Object3D (p.ej. escena o grupo) a un Blob STL.
export function exportObjectToSTL(root: any, options?: { binary?: boolean }) {
  const exporter = new STLExporter()
  if (options?.binary) {
    const dataView = exporter.parse(root, { binary: true })
    const ab = new ArrayBuffer(dataView.byteLength)
    new Uint8Array(ab).set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength))
    const blob = new Blob([ab], { type: 'model/stl' })
    return blob
  }
  const text = exporter.parse(root)
  const blob = new Blob([text], { type: 'model/stl' })
  return blob
}

// Helper para disparar descarga en el browser.
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
