import { useGLTF } from '@react-three/drei'
import { useMemo, useEffect, useRef } from 'react'
import { Box3, Vector3 } from 'three'
import { useStore } from '../../store/useStore'

export default function CustomGLTF(props: { src: string; objectId?: string }) {
  const gltf = useGLTF(props.src) as any
  const updateObject = useStore((s) => s.updateObject)
  const clonedSceneRef = useRef<any>(null)
  
  // Clonar la escena para cada instancia para evitar problemas cuando se elimina y se vuelve a agregar
  const clonedScene = useMemo(() => {
    if (!gltf.scene) return null
    
    // Si ya tenemos una escena clonada, limpiarla primero
    if (clonedSceneRef.current) {
      clonedSceneRef.current.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => {
              if (mat.map) mat.map.dispose()
              mat.dispose()
            })
          } else {
            if (child.material.map) child.material.map.dispose()
            child.material.dispose()
          }
        }
      })
    }
    
    // Clonar la escena
    const cloned = gltf.scene.clone(true)
    clonedSceneRef.current = cloned
    return cloned
  }, [gltf.scene, props.objectId]) // Incluir objectId para forzar reclonación cuando cambia
  
  // Detección inteligente basada en rangos de tamaño realistas
  const scale = useMemo(() => {
    if (!clonedScene) return [100, 100, 100]
    
    // Calcular el tamaño del modelo usando la escena clonada
    const box = new Box3().setFromObject(clonedScene)
    const size = box.getSize(new Vector3())
    const maxDimension = Math.max(size.x, size.y, size.z)
    
    // Detectar unidades basado en rangos realistas de objetos
    if (maxDimension < 0.1) {
      // Rango 0.001-0.1 → probablemente metros (casa, edificio)
      // Ejemplo: casa 0.05m → 50mm
      return [1000, 1000, 1000] // metros → milímetros
    }
    else if (maxDimension >= 0.1 && maxDimension < 1) {
      // Rango 0.1-1 → probablemente metros (objetos grandes)
      // Ejemplo: mueble 0.5m → 500mm
      return [1000, 1000, 1000] // metros → milímetros
    }
    else if (maxDimension >= 1 && maxDimension < 10) {
      // Rango 1-10 → probablemente metros (objetos medianos)
      // Ejemplo: silla 1.5m → 1500mm (muy grande, necesita reducción)
      return [100, 100, 100] // tu escala que funciona
    }
    else if (maxDimension >= 10 && maxDimension < 100) {
      // Rango 10-100 → probablemente centímetros
      // Ejemplo: iPhone 15cm → 150mm
      return [10, 10, 10] // centímetros → milímetros
    }
    else if (maxDimension >= 100 && maxDimension < 1000) {
      // Rango 100-1000 → probablemente milímetros
      // Ejemplo: pieza 250mm → 250mm (ya está bien)
      return [1, 1, 1] // ya en milímetros
    }
    else {
      // Rango > 1000 → probablemente milímetros pero muy grande
      // Ejemplo: modelo 5000mm → 5000mm (necesita reducción)
      return [0.1, 0.1, 0.1] // reducir 10x
    }
  }, [clonedScene])
  
  // Calcular dimensiones reales del modelo
  const dimensions = useMemo(() => {
    if (!clonedScene || !props.objectId) return null
    
    // Calcular bounding box del modelo clonado (sin escala)
    const box = new Box3().setFromObject(clonedScene)
    const size = box.getSize(new Vector3())
    
    // Aplicar la escala calculada para obtener dimensiones finales
    return {
      width: (size.x * scale[0]).toFixed(1),
      height: (size.y * scale[1]).toFixed(1),
      depth: (size.z * scale[2]).toFixed(1)
    }
  }, [clonedScene, scale, props.objectId])
  
  // Actualizar las dimensiones en el store cuando cambien
  useEffect(() => {
    if (dimensions && props.objectId) {
      updateObject(props.objectId, {
        dimensions: {
          width: parseFloat(dimensions.width),
          height: parseFloat(dimensions.height),
          depth: parseFloat(dimensions.depth)
        }
      })
    }
  }, [dimensions, props.objectId, updateObject])
  
  // Limpiar recursos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (clonedSceneRef.current) {
        clonedSceneRef.current.traverse((child: any) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: any) => {
                if (mat.map) mat.map.dispose()
                mat.dispose()
              })
            } else {
              if (child.material.map) child.material.map.dispose()
              child.material.dispose()
            }
          }
        })
        clonedSceneRef.current = null
      }
    }
  }, [])
  
  if (!clonedScene) return null
  
  return (
    <primitive 
      object={clonedScene} 
      scale={scale}
    />
  )
}

// Note: supports only .glb single-file uploads (no external resources).
// Escalado híbrido: mantiene tu escala que funciona + ajustes para casos extremos.
