import { useEffect, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useStore } from '../../store/useStore'
import { useTransformModeHotkeys } from '../../hooks/useTransformModeHotkeys'

// Envolverá el objeto seleccionado con TransformControls (Fase 2)
export default function TransformWrapper() {
  const selectedId = useStore((s) => s.selectedId) // ID del objeto seleccionado
  const updateObject = useStore((s) => s.updateObject) // Acción para actualizar el objeto
  const mode = useStore((s) => s.transformMode) // Modo actual (translate/rotate/scale)

  const scene = useThree((state) => state.scene) // Escena de Three.js
  const orbit = useThree((state) => state.controls as any) // OrbitControls

  const [, setRefresh] = useState(0) // Estado dummy para forzar re-render si el target no está aún

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
      }}
      onMouseUp={() => {
        if (orbit) orbit.enabled = true // Reactiva Orbit al soltar
      }}
      onObjectChange={() => {
        // Persistir cambios de TransformControls en el store
        const p = target.position // Posición actual
        const r = target.rotation // Rotación actual (radianes)
        const s = target.scale // Escala actual
        updateObject(id, {
          position: [p.x, p.y, p.z], // Guarda posición
          rotation: [r.x, r.y, r.z], // Guarda rotación
          scale: [s.x, s.y, s.z], // Guarda escala
        })
      }}
    />
  )
}
