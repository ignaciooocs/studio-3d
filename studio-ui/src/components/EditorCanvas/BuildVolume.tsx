import { Edges } from '@react-three/drei'

interface Props {
  width: number
  depth: number
  height: number
}

// Caja transparente para visualizar el volumen máximo de impresión.
export default function BuildVolume({ width, depth, height }: Props) {
  return (
    <group position={[0, height / 2, 0]}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color="#4b5563" transparent opacity={0.06} depthWrite={false} />
        <Edges color="#9ca3af" />
      </mesh>
    </group>
  )
}
