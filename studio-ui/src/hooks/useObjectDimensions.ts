import { useMemo } from 'react'
import { useStore } from '../store/useStore'

// Hook para calcular dimensiones de objetos
export const useObjectDimensions = (objectId: string | null) => {
  const selected = useStore((s) => s.objects.find((o) => o.id === objectId) || null)
  
  const dimensions = useMemo(() => {
    if (!selected) return null
    
    // Para objetos primitivos (cubo, esfera), calcular dimensiones basadas en geometría
    if (selected.type === 'cube') {
      const size = 20 // tamaño base del cubo en mm
      const scale = selected.scale
      return {
        width: (size * scale[0]).toFixed(1),
        height: (size * scale[1]).toFixed(1),
        depth: (size * scale[2]).toFixed(1)
      }
    }
    
    if (selected.type === 'sphere') {
      const radius = 10 // radio base de la esfera en mm
      const scale = selected.scale
      const diameter = (radius * 2 * Math.max(scale[0], scale[1], scale[2])).toFixed(1)
      return {
        width: diameter,
        height: diameter,
        depth: diameter
      }
    }
    
    if (selected.type === 'text') {
      const fontSize = selected.fontSize || 16
      const scale = selected.scale
      return {
        width: (fontSize * scale[0]).toFixed(1),
        height: (fontSize * scale[1]).toFixed(1),
        depth: ((selected.thickness || 4) * scale[2]).toFixed(1)
      }
    }
    
    // Para modelos GLTF, usar las dimensiones calculadas reales del store
    if (selected.type === 'custom' && selected.dimensions) {
      return {
        width: selected.dimensions.width.toFixed(1),
        height: selected.dimensions.height.toFixed(1),
        depth: selected.dimensions.depth.toFixed(1)
      }
    }
    
    return null
  }, [selected])
  
  return dimensions
}
