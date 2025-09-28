import { Grid } from '@react-three/drei'

// Renderizará la cama de impresión y límites físicos (Fase 1)
export default function PrintBed() {
  const size = 220 // mm
  return (
    <group>
      {/* Plano de cama */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      {/* Grid con celdas de 10mm */}
      <Grid
        args={[size, size]}
        sectionSize={10}
        sectionThickness={1}
        cellSize={2}
        cellThickness={0.5}
        infiniteGrid={false}
        fadeDistance={0}
        position={[0, 0.001, 0]}
      />
    </group>
  )
}
