import { Line } from '@react-three/drei'
import React from 'react'
import { useStore } from '../../store/useStore'
import { useThemeContext } from '../../context/ThemeProvider'

// Renderizará la cama de impresión y límites físicos (Fase 1)
export default function PrintBed() {
  const size = 220 // mm
  const half = size / 2
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
  for (let i = 0; i <= size / minorStep; i++) {
    const x = -half + i * minorStep
    const isMajor = i % (majorStep / minorStep) === 0
    if ((isMajor && showGridMajor) || (!isMajor && showGridMinor)) {
      lines.push(
        <Line
          key={`x-${i}`}
          points={[[x, 0.001, -half], [x, 0.001, half]]}
          color={isMajor ? '#6b7280' : '#cbd5e1'}
          lineWidth={isMajor ? 1.6 : 0.8}
        />
      )
    }
  }

  // Líneas paralelas al eje X (variando Z)
  for (let j = 0; j <= size / minorStep; j++) {
    const z = -half + j * minorStep
    const isMajor = j % (majorStep / minorStep) === 0
    if ((isMajor && showGridMajor) || (!isMajor && showGridMinor)) {
      lines.push(
        <Line
          key={`z-${j}`}
          points={[[-half, 0.001, z], [half, 0.001, z]]}
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
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={bedColor} />
      </mesh>

      {/* Grid manual visible tipo Tinkercad */}
      {lines}

      {/* Borde perimetral marcado */}
      <Line
        points={[
          [-half, 0.002, -half],
          [half, 0.002, -half],
          [half, 0.002, half],
          [-half, 0.002, half],
          [-half, 0.002, -half],
        ]}
        color="#111827"
        lineWidth={1.8}
      />

      {/* Ejes X/Z (opcional) para orientación rápida */}
      <Line points={[[-half, 0.003, 0], [half, 0.003, 0]]} color="#ef4444" lineWidth={1.8} />
      <Line points={[[0, 0.003, -half], [0, 0.003, half]]} color="#3b82f6" lineWidth={1.8} />
    </group>
  )
}
