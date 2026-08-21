// バナー背景用の装飾イラスト（小枝に葉が互い違いに並ぶモチーフ）
interface LeafDecorationProps {
  className?: string
}

// 単体の葉（中心を軸に上向きの、先が尖った楕円形+中央の葉脈）
function LeafShape({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <path d="M0 -34 C13 -26 15 8 0 34 C-15 8 -13 -26 0 -34 Z" fill="currentColor" />
      <path d="M0 -28 L0 28" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
    </g>
  )
}

// 枝上の位置(x,y)・葉の向き(角度)を並べた配置データ(小枝が右上から左下へ伸びるイメージ)
const LEAVES: { x: number; y: number; angle: number; scale: number }[] = [
  { x: 250, y: -10, angle: 35, scale: 1 },
  { x: 224, y: 34, angle: -35, scale: 0.95 },
  { x: 196, y: 78, angle: 40, scale: 0.9 },
  { x: 168, y: 120, angle: -40, scale: 0.85 },
  { x: 140, y: 162, angle: 38, scale: 0.78 },
  { x: 112, y: 202, angle: -38, scale: 0.7 },
  { x: 86, y: 238, angle: 35, scale: 0.6 },
]

export function LeafDecoration({ className }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true" fill="none">
      {/* 枝(茎) */}
      <path
        d="M270 -20 C 230 40, 160 130, 70 250"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <g opacity="0.5">
        {LEAVES.map((leaf, i) => (
          <LeafShape key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`} />
        ))}
      </g>
    </svg>
  )
}
