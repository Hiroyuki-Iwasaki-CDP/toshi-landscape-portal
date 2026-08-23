// バナー背景用の装飾イラスト（小枝に葉が密集して茂るモチーフ）
// 参考写真(実物の小枝)に合わせ、葉を密に重ねて茂みらしく見せている。
// 葉の向きは「葉柄(付け根から葉までの線)の方向」から自動計算し、
// 葉と葉柄が同じ方向を向くようにして接続を自然に見せている。
import type { CSSProperties } from 'react'

interface LeafDecorationProps {
  className?: string
  style?: CSSProperties
}

// 単体の葉（付け根(0,0)から上方向へ伸びる、先端が尖った細長い形+中央の葉脈+側脈）
function LeafShape({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <path
        d="M0 0 C13 -10 16 -38 9 -60 C6 -72 3 -80 0 -88 C-3 -80 -6 -72 -9 -60 C-16 -38 -13 -10 0 0 Z"
        fill="currentColor"
      />
      <path
        d="M0 -6 L0 -82 M0 -22 L-7 -34 M0 -22 L7 -34 M0 -44 L-8 -56 M0 -44 L8 -56"
        stroke="white"
        strokeOpacity="0.22"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  )
}

// 葉の付け根(枝上の点 sx,sy)・葉柄の先端(x,y)・大きさ
// 葉の向きはsx,sy→x,yの方向から自動計算するため、角度は持たせない
// 密集した葉のかたまりを枝の先端側(右上)に多めに、根元(左下)ほど少なく配置する
const LEAVES: { sx: number; sy: number; x: number; y: number; scale: number }[] = [
  { sx: 250, sy: 8, x: 276, y: -22, scale: 0.85 },
  { sx: 250, sy: 8, x: 292, y: 6, scale: 0.95 },
  { sx: 240, sy: 20, x: 264, y: 44, scale: 0.7 },
  { sx: 226, sy: 36, x: 210, y: 10, scale: 0.9 },
  { sx: 226, sy: 36, x: 250, y: 54, scale: 0.6 },
  { sx: 210, sy: 54, x: 176, y: 34, scale: 0.75 },
  { sx: 210, sy: 54, x: 222, y: 82, scale: 0.85 },
  { sx: 196, sy: 70, x: 192, y: 100, scale: 0.65 },
  { sx: 196, sy: 70, x: 160, y: 60, scale: 0.55 },
  { sx: 178, sy: 90, x: 150, y: 118, scale: 0.72 },
  { sx: 178, sy: 90, x: 202, y: 122, scale: 0.5 },
  { sx: 158, sy: 112, x: 128, y: 96, scale: 0.6 },
  { sx: 158, sy: 112, x: 140, y: 148, scale: 0.4 },
  { sx: 130, sy: 142, x: 100, y: 158, scale: 0.42 },
  { sx: 100, sy: 174, x: 72, y: 190, scale: 0.34 },
  { sx: 74, sy: 202, x: 48, y: 216, scale: 0.28 },
]

// 葉柄の方向(sx,sy→x,y)から、葉が同じ方向を向くための回転角を求める
function stalkAngleDeg(sx: number, sy: number, x: number, y: number): number {
  const dx = x - sx
  const dy = y - sy
  return (Math.atan2(dx, -dy) * 180) / Math.PI
}

export function LeafDecoration({ className, style }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 280 280" className={className} style={style} aria-hidden="true" fill="none">
      {/* 枝(茎)。木質の硬い直線にする(蔦のようにしならせない) */}
      <path d="M262 -4 L58 210" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

      <g opacity="0.45">
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
              <LeafShape transform={`translate(${leaf.x} ${leaf.y}) rotate(${angle}) scale(${leaf.scale})`} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
