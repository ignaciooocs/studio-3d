import { useEffect } from 'react'
import { useStore } from '../store/useStore'

// Global hotkeys for TransformControls mode: W (translate), E (rotate), R (scale)
export function useTransformModeHotkeys(enabled = true) {
  const setMode = useStore((s) => s.setTransformMode)

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'w') setMode('translate')
      else if (key === 'e') setMode('rotate')
      else if (key === 'r') setMode('scale')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, setMode])
}
