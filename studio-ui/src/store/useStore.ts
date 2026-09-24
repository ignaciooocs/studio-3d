import { create } from 'zustand'
import type { PrinterSpec } from '../core/printers/types'
import { DEFAULT_PRINTER_ID, PRINTERS, getPrinterById } from '../core/printers/presets'

export type Vec3 = [number, number, number]
export type SceneObjectType = 'cube' | 'sphere' | 'text' | 'custom'
export type TransformMode = 'translate' | 'rotate' | 'scale'

export interface SceneObject {
  id: string // Identificador único del objeto en la escena
  name?: string // Nombre opcional para mostrar en la UI (lista de objetos)
  type: SceneObjectType // Tipo de objeto (cubo, esfera, texto, etc.)
  position: Vec3 // Posición en mm [x,y,z] (coordenadas de Three.js)
  rotation: Vec3 // Rotación en radianes [x,y,z]
  scale: Vec3 // Escala por eje [x,y,z] (1 = tamaño original)
  color?: string // Color opcional del material del objeto
  // Texto 3D (solo cuando type === 'text')
  text?: string // Contenido del texto
  fontSize?: number // Tamaño del texto en mm
  thickness?: number // Grosor del texto en mm (height de Text3D)
  // Modelo externo (solo cuando type === 'custom')
  src?: string // URL del recurso (puede ser blob:ObjectURL)
  srcType?: 'gltf' // Tipo de modelo para decidir loader (por ahora: gltf)
  filesMap?: Record<string, string> // Mapeo nombre->ObjectURL para buffers/texturas referenciados
  // Dimensiones calculadas (solo cuando type === 'custom')
  dimensions?: { width: number; height: number; depth: number } // Dimensiones reales en mm
  // espacio para futuras propiedades: material, metadata, etc.
}

interface AppState {
  objects: SceneObject[] // Lista de objetos presentes en la escena
  selectedId: string | null // ID del objeto seleccionado (o null si no hay selección)
  showBuildVolume: boolean // Mostrar/ocultar el volumen máximo de impresión (caja de límites)
  transformMode: TransformMode // Modo actual de TransformControls: mover/rotar/escalar
  bedColor: string // Color del plano de la cama de impresión
  canvasBgColor: string // Color de fondo del Canvas (escena)
  useAutoColors: boolean // Usar colores automáticos del tema (true) o colores personalizados (false)
  showGridMinor: boolean // Mostrar líneas finas del grid (cada 5 mm)
  showGridMajor: boolean // Mostrar líneas gruesas/secciones del grid (cada 10 mm)

  // Impresora seleccionada
  selectedPrinterId: string // ID del preset de impresora seleccionado
  getSelectedPrinter: () => PrinterSpec // Devuelve el preset de impresora actual
  setSelectedPrinterId: (id: string) => void // Cambia la impresora actual y persiste

  addObject: (obj: SceneObject) => void // Agrega un objeto a la escena
  updateObject: (id: string, patch: Partial<SceneObject>) => void // Actualiza propiedades de un objeto por ID (patch)
  removeObject: (id: string) => void // Elimina un objeto por ID
  setSelected: (id: string | null) => void // Define el seleccionado (o null para deseleccionar)
  reset: () => void // Limpia la escena (elimina objetos y selección)
  setShowBuildVolume: (v: boolean) => void // Define si se muestra el volumen de impresión
  toggleBuildVolume: () => void // Alterna la visibilidad del volumen de impresión
  setTransformMode: (m: TransformMode) => void // Cambia el modo de edición (translate/rotate/scale)
  setBedColor: (c: string) => void // Cambia el color de la cama
  setCanvasBgColor: (c: string) => void // Cambia el color de fondo del Canvas
  setUseAutoColors: (v: boolean) => void // Activa/desactiva colores automáticos del tema
  setShowGridMinor: (v: boolean) => void // Muestra/oculta el grid fino (5 mm)
  setShowGridMajor: (v: boolean) => void // Muestra/oculta el grid grueso (10 mm)
}

const loadInitialPrinterId = () => {
  try {
    const saved = localStorage.getItem('studio:selectedPrinterId')
    if (saved && getPrinterById(saved)) return saved
  } catch { /* ignore localStorage unavailability */ }
  return DEFAULT_PRINTER_ID
}

export const useStore = create<AppState>((set, get) => ({
  // Estado inicial
  objects: [], // sin objetos al iniciar
  selectedId: null, // nada seleccionado
  showBuildVolume: true, // mostrar límites de impresión por defecto
  transformMode: 'translate', // modo inicial: mover
  bedColor: '#f8fafc', // color claro por defecto para la cama
  canvasBgColor: '#ffffff', // fondo blanco por defecto
  useAutoColors: true, // usar colores automáticos del tema por defecto
  showGridMinor: true, // mostrar líneas finas (5 mm)
  showGridMajor: true, // mostrar líneas gruesas (10 mm)

  // Impresora
  selectedPrinterId: loadInitialPrinterId(),
  getSelectedPrinter: () => getPrinterById(get().selectedPrinterId) ?? PRINTERS[0],

  // Acciones
  addObject: (obj) => set((s) => ({ objects: [...s.objects, obj] })), // Agrega un objeto a la escena
  updateObject: (id, patch) => // Actualiza propiedades de un objeto por ID (patch)
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  removeObject: (id) => set((s) => ({ objects: s.objects.filter((o) => o.id !== id) })), // Elimina un objeto por ID
  setSelected: (id) => set({ selectedId: id }), // Define el seleccionado (o null para deseleccionar)
  reset: () => set({ objects: [], selectedId: null }), // Limpia la escena (elimina objetos y selección)
  setShowBuildVolume: (v) => set({ showBuildVolume: v }), // Define si se muestra el volumen de impresión
  toggleBuildVolume: () => set((s) => ({ showBuildVolume: !s.showBuildVolume })), // Alterna la visibilidad del volumen de impresión
  setTransformMode: (m) => set({ transformMode: m }), // Cambia el modo de edición
  setBedColor: (c) => set({ bedColor: c }), // Cambia el color de la cama
  setCanvasBgColor: (c) => set({ canvasBgColor: c }), // Cambia el color de fondo del Canvas
  setUseAutoColors: (v) => set({ useAutoColors: v }), // Activa/desactiva colores automáticos
  setShowGridMinor: (v) => set({ showGridMinor: v }), // Muestra/oculta el grid fino (5 mm)
  setShowGridMajor: (v) => set({ showGridMajor: v }), // Muestra/oculta el grid grueso (10 mm)
  setSelectedPrinterId: (id) => {
    // Validar que existe
    const exists = !!getPrinterById(id)
    if (!exists) return
    set({ selectedPrinterId: id })
    try {
      localStorage.setItem('studio:selectedPrinterId', id)
    } catch { /* ignore localStorage unavailability */ }
  },
}))
