import { Suspense } from 'react'
import { Box, Paper } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import { useThemeContext } from '../../context/ThemeProvider'
import SceneWrapper from './SceneWrapper'

// Implemented R3F Canvas with camera, lights, OrbitControls, PrintBed and BuildVolume
export default function EditorCanvas() {
  const setSelected = useStore((s) => s.setSelected)
  const useAutoColors = useStore((s) => s.useAutoColors)
  const manualCanvasBgColor = useStore((s) => s.canvasBgColor)
  const { mode } = useThemeContext()
  
  // Sistema híbrido de colores: automático del tema o manual
  const canvasBgColor = useAutoColors 
    ? (mode === 'light' ? '#f5f5f5' : '#2a2a2a')
    : manualCanvasBgColor

  return (
    <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
      <Paper variant="outlined" sx={{ height: '100%', minHeight: 420, overflow: 'hidden' }}>
        <Canvas
          gl={{ logarithmicDepthBuffer: true }}
          shadows
          dpr={[1, 2]}
          camera={{ position: [500, 600, 500], fov: 50, near: 0.1, far: 5000 }}
          style={{ width: '100%', height: '100%' }}
          onPointerMissed={() => setSelected(null)}
        >
          <color attach="background" args={[canvasBgColor]} />
          <Suspense fallback={null}>
            <SceneWrapper />
            {/* Controls */}
            <OrbitControls makeDefault target={[0, 0, 0]} enableDamping minDistance={80} maxDistance={3000} />
          </Suspense>
        </Canvas>
      </Paper>
    </Box>
  )
}
