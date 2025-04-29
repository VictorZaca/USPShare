import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Slice { label: string; path: string; color: string }

// utilitário que converte "#RRGGBB" em {r,g,b}
const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '')
    const bigint = parseInt(h, 16)
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    }
  }

const PieMenu: React.FC = () => {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<number | null>(null)

  const slices: Slice[] = [
    { label: 'Página 1', path: '/page1', color: '#FF6384' },
    { label: 'Página 2', path: '/page2', color: '#36A2EB' },
    { label: 'Página 3', path: '/page3', color: '#FFCE56' },
]

// geometria básica
const rx = 300, ry = 200
const cx = rx + 100, cy = ry + 100
const baseAngle = 360 / slices.length

    const polarToCartesian = (cx: number, cy: number, rx: number, ry: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: cx + rx * Math.cos(rad),
        y: cy + ry * Math.sin(rad),
    };
    };

    const describeArc = (cx: number, cy: number, rx: number, ry: number, startDeg: number, endDeg: number) => {
    const start = polarToCartesian(cx, cy, rx, ry, endDeg);
    const end = polarToCartesian(cx, cy, rx, ry, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return [
        `M ${cx} ${cy}`,
        `L ${start.x} ${start.y}`,
        `A ${rx} ${ry} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
        'Z',
    ].join(' ');
    };
  // pré-cálculo dos arcos + posição do label + meio ângulo (pra calcular translate)
  const segments = useMemo(() => {
    let start = -90
    return slices.map(() => {
      const end = start + baseAngle
      // helper polarToCartesian e describeArc (igual ao seu)
      const d = describeArc(cx, cy, rx, ry, start, end)
      const midDeg = (start + end) / 2
      const midRad = (midDeg * Math.PI) / 180
      const labelX = cx + rx * 0.6 * Math.cos(midRad)
      const labelY = cy + ry * 0.6 * Math.sin(midRad)
      start = end
      return { d, midRad, labelX, labelY }
    })
  }, [slices.length])

  const bodyBg = hovered !== null
    ? (() => {
        const { r, g, b } = hexToRgb(slices[hovered].color)
        return `rgba(${r}, ${g}, ${b}, 0.1)`  // 10% de opacidade
      })()
    : ''  // '' volta ao padrão do CSS global

  // aplica no body
  useEffect(() => {
    document.body.style.transition = 'background-color 0.3s ease-out'
    document.body.style.backgroundColor = bodyBg
    return () => {
      // ao desmontar, limpa para não "grudar" em outras rotas
      document.body.style.backgroundColor = ''
      document.body.style.transition = ''
    }
  }, [bodyBg])

  return (
    <div style={{
      height: '100vh', display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <svg width={cx * 2} height={cy * 2}>
        {segments.map((seg, i) => {
          const isHovered = hovered === i
          const prev = hovered !== null && i === (hovered - 1 + slices.length) % slices.length
          const next = hovered !== null && i === (hovered + 1) % slices.length

          // parâmetros de destaque / compressão
          const scale = isHovered
            ? 1.15
            : (prev || next)
              ? 0.9
              : (hovered !== null)
                ? 0.85
                : 1
          const dist = isHovered ? 20 : 0
          const tx = dist * Math.cos(seg.midRad)
          const ty = dist * Math.sin(seg.midRad)

          const transform = `translate(${tx},${ty}) scale(${scale})`

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(slices[i].path)}
              style={{
                cursor: 'pointer',
                transformOrigin: `${cx}px ${cy}px`,
                transition: 'transform 0.3s ease-out'
              }}
              transform={transform}
            >
              <path
                d={seg.d}
                fill={slices[i].color}
                stroke="#fff"
                strokeWidth={isHovered ? 3 : 2}
                style={{ transition: 'stroke-width 0.3s ease-out' }}
              />
              <text
                x={seg.labelX}
                y={seg.labelY}
                textAnchor="middle"
                alignmentBaseline="middle"
                pointerEvents="none"
                style={{
                  fontSize: isHovered ? 18 : 16,
                  fontWeight: isHovered ? 600 : 500,
                  transition: 'font-size 0.3s ease-out, font-weight 0.3s ease-out',
                  fill: '#fff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {slices[i].label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ... suas funções polarToCartesian e describeArc ficam iguais
export default PieMenu
