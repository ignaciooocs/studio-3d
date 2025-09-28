import { GizmoHelper, Edges, Text } from '@react-three/drei'

// Pequeño cubo en esquina para orientar al usuario. Usa GizmoHelper para fijarse en la esquina
// y rotar en sincronía con la cámara.
export default function OrientationCube() {
  const size = 24
  const half = size / 2

  return (
    <GizmoHelper alignment="top-right" margin={[80, 80]}>
      <group scale={3}>
        <mesh>
          <boxGeometry args={[size, size, size]} />
          <meshBasicMaterial color="#ffffff" />
          <Edges color="#374151" />
        </mesh>
        {/* Etiquetas de caras (en español) */}
        {/* Superior (+Y) */}
        <Text position={[0, half + 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={5} color="#111827">Superior</Text>
        {/* Inferior (-Y) */}
        <Text position={[0, -half - 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} fontSize={5} color="#111827">Inferior</Text>
        {/* Frontal (+Z) */}
        <Text position={[0, 0, half + 0.6]} rotation={[0, 0, 0]} fontSize={5} color="#111827">Frontal</Text>
        {/* Posterior (-Z) */}
        <Text position={[0, 0, -half - 0.6]} rotation={[0, Math.PI, 0]} fontSize={5} color="#111827">Posterior</Text>
        {/* Derecha (+X) */}
        <Text position={[half + 0.6, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={5} color="#111827">Derecha</Text>
        {/* Izquierda (-X) */}
        <Text position={[-half - 0.6, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={5} color="#111827">Izquierda</Text>
      </group>
    </GizmoHelper>
  )
}
