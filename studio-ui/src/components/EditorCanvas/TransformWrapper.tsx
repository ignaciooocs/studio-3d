import { useEffect, useState, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useStore } from '../../store/useStore'
import { useEditorContextCommands } from '../../context/EditorContext'
import { useTransformModeHotkeys } from '../../hooks/useTransformModeHotkeys'
import type { Vec3 } from '../../store/useStore'

// Envolverá el objeto seleccionado con TransformControls (Fase 2)
export default function TransformWrapper() {
  const selectedId = useStore((s) => s.selectedId) // ID del objeto seleccionado
  const objects = useStore((s) => s.objects) // Lista de objetos para obtener el estado inicial
  const mode = useStore((s) => s.transformMode) // Modo actual (translate/rotate/scale)
  const { transformObjectFromThreeJS } = useEditorContextCommands() // Comandos del editor

  const scene = useThree((state) => state.scene) // Escena de Three.js
  const orbit = useThree((state) => state.controls as any) // OrbitControls

  const [, setRefresh] = useState(0) // Estado dummy para forzar re-render si el target no está aún
  
  // Referencias para guardar el estado inicial cuando empieza la transformación
  const startTransformRef = useRef<{
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;
  } | null>(null)

  // Busca el Object3D por nombre/id
  const target = selectedId ? (scene.getObjectByName(selectedId) ?? null) : null

  // If selection exists but target not yet in scene (same commit), schedule a re-render next frame
  useEffect(() => {
    if (selectedId && !target) {
      // Si hay selección pero el mesh aún no montó
      const raf = requestAnimationFrame(() => setRefresh((v) => v + 1)) // re-render en el próximo frame
      return () => cancelAnimationFrame(raf)
    }
  }, [selectedId, target])

  // Hotkeys W/E/R activas cuando hay target
  useTransformModeHotkeys(Boolean(target))

  if (!target) return null // Sin target, no mostramos TransformControls

  const id = target.name as string // Reutilizamos el name como ID

  return (
    <TransformControls
      object={target} // Object3D a manipular
      mode={mode} // Modo actual desde el store
      showX // Mostrar eje X
      showY // Mostrar eje Y
      showZ // Mostrar eje Z
      onMouseDown={() => {
        if (orbit) orbit.enabled = false // Desactiva Orbit mientras arrastras
        
        // Guardar el estado inicial del objeto DESDE EL STORE antes de empezar la transformación
        const sceneObject = objects.find(obj => obj.id === selectedId)
        if (sceneObject) {
          startTransformRef.current = {
            position: [...sceneObject.position],
            rotation: [...sceneObject.rotation],
            scale: [...sceneObject.scale]
          }
        }
      }}
      onMouseUp={() => {
        if (orbit) orbit.enabled = true // Reactiva Orbit al soltar
        
        // Al finalizar la transformación, crear el comando
        if (startTransformRef.current) {
          // Determinar el tipo de transformación
          let transformType = 'transform'
          if (mode === 'translate') transformType = 'move'
          else if (mode === 'rotate') transformType = 'rotate'
          else if (mode === 'scale') transformType = 'scale'
          
          // Crear el comando de transformación usando el estado del store como referencia
          transformObjectFromThreeJS(
            id,
            target,
            startTransformRef.current,
            transformType
          )
          
          // Limpiar la referencia
          startTransformRef.current = null
        }
      }}
      onObjectChange={() => {
        // Durante la transformación, solo actualizamos visualmente
        // No creamos comandos aquí para evitar spam
        // La sincronización con el store se hace en onMouseUp cuando se confirma el cambio
      }}
    />
  )
}
