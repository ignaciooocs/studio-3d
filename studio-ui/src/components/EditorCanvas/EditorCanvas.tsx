import { Suspense } from 'react'
import { Box, Paper } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PrintBed from './PrintBed'
import BuildVolume from './BuildVolume.tsx'
import OrientationCube from './OrientationCube.tsx'
import { useStore } from '../../store/useStore'

// Implemented R3F Canvas with camera, lights, OrbitControls, PrintBed and BuildVolume
export default function EditorCanvas() {
  const showBuildVolume = useStore((s) => s.showBuildVolume)

  return (
    <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
      <Paper variant="outlined" sx={{ height: '100%', minHeight: 420, overflow: 'hidden' }}>
        <Canvas
          gl={{ logarithmicDepthBuffer: true }}
          shadows
          dpr={[1, 2]}
          camera={{ position: [600, 600, 600], fov: 50, near: 0.1, far: 5000 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            {/* Lights */}
            <hemisphereLight intensity={0.5} groundColor="white" />
            <directionalLight position={[200, 300, 200]} intensity={1} castShadow />

            {/* Scene elements */}
            <PrintBed />
            {showBuildVolume && <BuildVolume width={220} depth={220} height={250} />}

            {/* Controls */}
            <OrbitControls makeDefault target={[0, 0, 0]} enableDamping minDistance={80} maxDistance={3000} />

            {/* Orientation cube in top-right corner */}
            <OrientationCube />
          </Suspense>
        </Canvas>
      </Paper>
    </Box>
  )
}
