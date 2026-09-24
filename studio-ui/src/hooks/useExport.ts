import { useState, useCallback } from 'react'
import * as THREE from 'three'
import type { ExportOptions } from '../utils/exportSTL'
import { exportAndDownload } from '../utils/exportSTL'
import { useStore } from '../store/useStore'
import type { SceneObject } from '../store/useStore'
import { useEditorContext } from '../context/EditorContext'

interface UseExportReturn {
  isExporting: boolean
  exportScene: (options: ExportOptions) => Promise<void>
  exportObjects: (objects: SceneObject[], options: ExportOptions) => Promise<void>
  error: string | null
  clearError: () => void
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const objects = useStore((s) => s.objects)
  const selectedId = useStore((s) => s.selectedId)
  const { scene } = useEditorContext()

  // Crear geometría básica según el tipo de objeto
  const createObjectGeometry = useCallback((obj: SceneObject): THREE.Object3D => {
    const group = new THREE.Group()
    group.name = obj.name || `${obj.type}_${obj.id}`
    
    let geometry: THREE.BufferGeometry
    let material = new THREE.MeshStandardMaterial({ 
      color: obj.color || '#ffffff' 
    })

    switch (obj.type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(10, 10, 10) // 10mm por defecto
        break
      case 'sphere':
        geometry = new THREE.SphereGeometry(5, 32, 16) // Radio 5mm
        break
      case 'text':
        // Para texto 3D, necesitaríamos TextGeometry con una fuente cargada
        // Por ahora, usamos un placeholder
        geometry = new THREE.BoxGeometry(
          (obj.text?.length || 1) * (obj.fontSize || 10),
          obj.fontSize || 10,
          obj.thickness || 2
        )
        break
      case 'custom':
        // Para objetos custom (GLTF), necesitaríamos cargar el modelo
        // Por ahora, usamos un placeholder
        geometry = new THREE.BoxGeometry(
          obj.dimensions?.width || 10,
          obj.dimensions?.height || 10,
          obj.dimensions?.depth || 10
        )
        break
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1)
    }

    const mesh = new THREE.Mesh(geometry, material)
    
    // Aplicar transformaciones del objeto
    mesh.position.set(...obj.position)
    mesh.rotation.set(...obj.rotation)
    mesh.scale.set(...obj.scale)
    
    group.add(mesh)
    return group
  }, [])

  // Preparar la escena para exportación usando objetos reales si están disponibles
  const prepareSceneForExport = useCallback((objectsToExport: SceneObject[]): THREE.Group => {
    const exportGroup = new THREE.Group()
    exportGroup.name = 'ExportedScene'

    objectsToExport.forEach(obj => {
      try {
        // Intentar encontrar el objeto real en la escena de Three.js
        let object3D: THREE.Object3D | null = null
        
        if (scene) {
          // Buscar el objeto por nombre o userData
          scene.traverse((child) => {
            if (child.userData?.id === obj.id || child.name === obj.id) {
              object3D = child.clone()
            }
          })
        }
        
        // Si no se encuentra en la escena, crear geometría básica
        if (!object3D) {
          object3D = createObjectGeometry(obj)
        }
        
        exportGroup.add(object3D)
      } catch (err) {
        console.warn(`Error preparando objeto ${obj.id} para exportación:`, err)
        // Fallback a geometría básica
        try {
          const fallbackObject = createObjectGeometry(obj)
          exportGroup.add(fallbackObject)
        } catch (fallbackErr) {
          console.error(`Error creando geometría de respaldo para objeto ${obj.id}:`, fallbackErr)
        }
      }
    })

    return exportGroup
  }, [scene, createObjectGeometry])

  // Filtrar objetos según las opciones
  const getObjectsToExport = useCallback((options: ExportOptions): SceneObject[] => {
    if (options.includeSelected && selectedId) {
      const selectedObject = objects.find(obj => obj.id === selectedId)
      return selectedObject ? [selectedObject] : []
    }
    
    if (options.selectedIds && options.selectedIds.length > 0) {
      return objects.filter(obj => options.selectedIds!.includes(obj.id))
    }
    
    return objects
  }, [objects, selectedId])

  // Exportar escena completa
  const exportScene = useCallback(async (options: ExportOptions): Promise<void> => {
    setIsExporting(true)
    setError(null)

    try {
      const objectsToExport = getObjectsToExport(options)
      
      if (objectsToExport.length === 0) {
        throw new Error('No hay objetos para exportar')
      }

      const exportGroup = prepareSceneForExport(objectsToExport)
      
      // Generar nombre de archivo automático si no se especifica
      const filename = options.filename || generateFilename(objectsToExport)
      
      const finalOptions = {
        ...options,
        filename
      }

      await exportAndDownload(exportGroup, finalOptions)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido durante la exportación'
      setError(errorMessage)
      throw err
    } finally {
      setIsExporting(false)
    }
  }, [getObjectsToExport, prepareSceneForExport])

  // Exportar objetos específicos
  const exportObjects = useCallback(async (objectsToExport: SceneObject[], options: ExportOptions): Promise<void> => {
    setIsExporting(true)
    setError(null)

    try {
      if (objectsToExport.length === 0) {
        throw new Error('No hay objetos para exportar')
      }

      const exportGroup = prepareSceneForExport(objectsToExport)
      
      const filename = options.filename || generateFilename(objectsToExport)
      
      const finalOptions = {
        ...options,
        filename
      }

      await exportAndDownload(exportGroup, finalOptions)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido durante la exportación'
      setError(errorMessage)
      throw err
    } finally {
      setIsExporting(false)
    }
  }, [prepareSceneForExport])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isExporting,
    exportScene,
    exportObjects,
    error,
    clearError
  }
}

// Helper para generar nombres de archivo automáticos
function generateFilename(objects: SceneObject[]): string {
  if (objects.length === 1) {
    const obj = objects[0]
    return obj.name || `${obj.type}_${obj.id.slice(0, 8)}`
  }
  
  const timestamp = new Date().toISOString().slice(0, 10)
  return `studio3d_export_${timestamp}`
}