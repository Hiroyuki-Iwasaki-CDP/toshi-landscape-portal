// バナー背景用の装飾イラスト（小枝に葉が互い違いに並ぶモチーフ）
// 「蔦」に見えないよう、茎はしなやかに曲げず直線に近い硬さにしている
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

// 葉の付け根(枝上の点 sx,sy)・葉の位置(x,y)・向き(角度)・大きさ
// 付け根から短い葉柄(stalk)を伸ばして葉を付けることで「枝から生えている」感を出す
const LEAVES: { sx: number; sy: number; x: number; y: number; angle: number; scale: number }[] = [
  { sx: 258, sy: 4, x: 288, y: -18, angle: 48, scale: 1.05 },
  { sx: 240, sy: 30, x: 260, y: 10, angle: -30, scale: 0.55 },
  { sx: 214, sy: 58, x: 246, y: 40, angle: 46, scale: 0.9 },
  { sx: 196, sy: 84, x: 222, y: 108, angle: -42, scale: 0.5 },
  { sx: 170, sy: 112, x: 202, y: 100, angle: 26, scale: 0.8 },
  { sx: 146, sy: 140, x: 116, y: 122, angle: -34, scale: 0.72 },
  { sx: 130, sy: 158, x: 156, y: 172, angle: 14, scale: 0.4 },
  { sx: 108, sy: 184, x: 76, y: 168, angle: 40, scale: 0.65 },
  { sx: 86, sy: 210, x: 116, y: 226, angle: -28, scale: 0.55 },
  { sx: 68, sy: 232, x: 40, y: 216, angle: 20, scale: 0.45 },
]

export function LeafDecoration({ className }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true" fill="none">
      {/* 枝(茎)。蔦のようにしならせず、硬い木の枝らしく直線的にする */}
      <path d="M274 -16 L60 254" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      <g opacity="0.5">
        {LEAVES.map((leaf, i) => (
          <g key={i}>
            <line x1={leaf.sx} y1={leaf.sy} x2={leaf.x} y2={leaf.y} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <LeafShape transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`} />
          </g>
        ))}
      </g>
    </svg>
  )
}
