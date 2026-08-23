// バナー背景用の装飾イラスト（小枝に葉が付く、シンプルなモチーフ）
// 実物の小枝の参考写真に合わせ、枝の先端側（右上）に葉を大きく密集させ、
// 根元側（左下）に向かって葉を小さく・まばらにしている。
import type { CSSProperties } from 'react'

interface LeafDecorationProps {
  className?: string
  style?: CSSProperties
}

// 単体の葉（付け根(0,0)から先端(0,-length)へ伸びる、丸みのある一枚葉+中央の葉脈）
function LeafShape({ transform, length }: { transform: string; length: number }) {
  const width = length * 0.42
  const waist = -length * 0.4
  return (
    <g transform={transform}>
      <path d={`M0 0 Q ${-width} ${waist} 0 ${-length} Q ${width} ${waist} 0 0 Z`} fill="currentColor" />
      <path
        d={`M0 ${-length * 0.08} L0 ${-length * 0.92}`}
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  )
}

// 葉の付け根(枝上の点 sx,sy)・先端(x,y)・長さ
// 枝の先端側(右上)に大きな葉を、根元側(左下)に小さな葉を配置する
const LEAVES: { sx: number; sy: number; x: number; y: number; length: number }[] = [
  { sx: 186, sy: 14, x: 166, y: -18, length: 62 },
  { sx: 186, sy: 14, x: 202, y: 24, length: 56 },
  { sx: 164, sy: 42, x: 132, y: 22, length: 60 },
  { sx: 164, sy: 42, x: 182, y: 64, length: 50 },
  { sx: 138, sy: 72, x: 106, y: 58, length: 52 },
  { sx: 138, sy: 72, x: 156, y: 100, length: 42 },
  { sx: 108, sy: 106, x: 82, y: 92, length: 40 },
  { sx: 108, sy: 106, x: 128, y: 132, length: 30 },
  { sx: 78, sy: 132, x: 52, y: 146, length: 28 },
]

// 葉柄の方向(sx,sy→x,y)から、葉が同じ方向を向くための回転角を求める
function stalkAngleDeg(sx: number, sy: number, x: number, y: number): number {
  const dx = x - sx
  const dy = y - sy
  return (Math.atan2(dx, -dy) * 180) / Math.PI
}

export function LeafDecoration({ className, style }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 210 210" className={className} style={style} aria-hidden="true" fill="none">
      {/* 枝(茎)。木質の硬い直線にする(蔦のようにしならせない) */}
      <path d="M198 -2 L26 240" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

      <g opacity="0.5">
        {LEAVES.map((leaf, i) => {
          const angle = stalkAngleDeg(leaf.sx, leaf.sy, leaf.x, leaf.y)
          return (
            <g key={i}>
              <line
                x1={leaf.sx}
                y1={leaf.sy}
                x2={leaf.x}
                y2={leaf.y}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <LeafShape transform={`translate(${leaf.x} ${leaf.y}) rotate(${angle})`} length={leaf.length} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
