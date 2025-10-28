import { Line } from '@react-three/drei'
import React from 'react'
import { useStore } from '../../store/useStore'
import { useThemeContext } from '../../context/ThemeProvider'

// Renderizará la cama de impresión y límites físicos (Fase 1)
export default function PrintBed() {
  const getSelectedPrinter = useStore((s) => s.getSelectedPrinter)
  const { bed } = getSelectedPrinter()
  const width = bed.width
  const depth = bed.depth
  const halfW = width / 2
  const halfD = depth / 2
  const useAutoColors = useStore((s) => s.useAutoColors)
  const manualBedColor = useStore((s) => s.bedColor)
  const showGridMinor = useStore((s) => s.showGridMinor)
  const showGridMajor = useStore((s) => s.showGridMajor)
  const { mode } = useThemeContext()

  // Sistema híbrido de colores: automático del tema o manual
  const bedColor = useAutoColors 
    ? (mode === 'light' ? '#e5e7eb' : '#b0b0b0ff')
    : manualBedColor

  const minorStep = 5
  const majorStep = 10
  const lines: React.ReactElement[] = []

  // Líneas paralelas al eje Z (variando X)
  for (let i = 0; i <= width / minorStep; i++) {
    const x = -halfW + i * minorStep
    const isMajor = i % (majorStep / minorStep) === 0
    if ((isMajor && showGridMajor) || (!isMajor && showGridMinor)) {
      lines.push(
        <Line
          key={`x-${i}`}
          points={[[x, 0.001, -halfD], [x, 0.001, halfD]]}
          color={isMajor ? '#6b7280' : '#cbd5e1'}
          lineWidth={isMajor ? 1.6 : 0.8}
        />
      )
    }
  }

  // Líneas paralelas al eje X (variando Z)
  for (let j = 0; j <= depth / minorStep; j++) {
    const z = -halfD + j * minorStep
    const isMajor = j % (majorStep / minorStep) === 0
    if ((isMajor && showGridMajor) || (!isMajor && showGridMinor)) {
      lines.push(
        <Line
          key={`z-${j}`}
          points={[[-halfW, 0.001, z], [halfW, 0.001, z]]}
          color={isMajor ? '#6b7280' : '#cbd5e1'}
          lineWidth={isMajor ? 1.6 : 0.8}
        />
      )
    }
  }

  return (
    <group>
      {/* Plano de cama */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={bedColor} />
      </mesh>

      {/* Grid manual visible tipo Tinkercad */}
      {lines}

      {/* Borde perimetral marcado */}
      <Line
        points={[
          [-halfW, 0.002, -halfD],
          [halfW, 0.002, -halfD],
          [halfW, 0.002, halfD],
          [-halfW, 0.002, halfD],
          [-halfW, 0.002, -halfD],
        ]}
        color="#111827"
        lineWidth={1.8}
      />

      {/* Ejes X/Z (opcional) para orientación rápida */}
      <Line points={[[-halfW, 0.003, 0], [halfW, 0.003, 0]]} color="#ef4444" lineWidth={1.8} />
      <Line points={[[0, 0.003, -halfD], [0, 0.003, halfD]]} color="#3b82f6" lineWidth={1.8} />
    </group>
  )
}
