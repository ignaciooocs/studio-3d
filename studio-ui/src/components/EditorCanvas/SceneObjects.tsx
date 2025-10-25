import { Edges, Text3D, Center } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import CustomGLTF from './CustomGLTF'

const DEFAULT_COLOR = '#7dd3fc' // Color por defecto para objetos no seleccionados
const SELECTED_COLOR = '#60a5fa' // Color para objeto seleccionado
const CUBE_DIMS: [number, number, number] = [20, 20, 20] // Tamaño base del cubo (mm)
const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json' // Fuente JSON para Text3D

// Iterará y dibujará los objetos desde el store global (Fase 2)
export default function SceneObjects() {
  const objects = useStore((s) => s.objects) // Lista de objetos en escena
  const selectedId = useStore((s) => s.selectedId) // ID seleccionado actual
  const setSelected = useStore((s) => s.setSelected) // Acción para seleccionar

  return (
    <group>
      {objects.map((o) => {
        const isSelected = o.id === selectedId // ¿Este objeto está seleccionado?
        const color = o.color ?? (isSelected ? SELECTED_COLOR : DEFAULT_COLOR) // Color final
        const common = {
          position: o.position as any, // Posición [x,y,z]
          rotation: (o.rotation as any), // Rotación [x,y,z] (radianes)
          scale: o.scale as any, // Escala [x,y,z]
          name: o.id, // Usamos el id como nombre para localizar el Object3D
          onClick: (e: any) => {
            e.stopPropagation() // Evita que el click llegue al canvas (deselección)
            setSelected(o.id) // Seleccionar este objeto
          },
          castShadow: true, // El objeto proyecta sombra
          receiveShadow: true, // El objeto recibe sombra
        }

        if (o.type === 'cube') {
          return (
            <mesh key={o.id} {...common}>
              <boxGeometry args={CUBE_DIMS} />
              <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
              {isSelected && <Edges color="#111827" />}{/* Resalta bordes si está seleccionado */}
            </mesh>
          )
        }
        if (o.type === 'sphere') {
          return (
            <mesh key={o.id} {...common}>
              <sphereGeometry args={[10, 32, 16]} />{/* Radio 10mm, segmentos */}
              <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
              {isSelected && <Edges color="#111827" />}{/* Resalta bordes si está seleccionado */}
            </mesh>
          )
        }
        if (o.type === 'text') {
          return (
            <group key={o.id} {...common}>
              <Center>
                <Text3D font={FONT_URL} size={o.fontSize ?? 16} height={o.thickness ?? 4}>
                  {o.text ?? 'Texto'}
                  <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
                </Text3D>
              </Center>s
            </group>
          )
        }
        if (o.type === 'custom' && o.src && o.srcType === 'gltf') {
          return (
            <group key={o.id} {...common}>
              <CustomGLTF src={o.src} objectId={o.id} />
            </group>
          )
        }
        // placeholder para otros tipos
        return null
      })}
    </group>
  )
}
