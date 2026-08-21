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

// 枝上の位置(x,y)・葉の向き(角度)・大きさを並べた配置データ
// 間隔・角度・大きさをあえて不揃いにして、自然な枝分かれ・葉の付き方に見せる
const LEAVES: { x: number; y: number; angle: number; scale: number }[] = [
  { x: 258, y: -8, angle: 44, scale: 1.05 },
  { x: 244, y: 16, angle: -22, scale: 0.62 },
  { x: 224, y: 34, angle: 50, scale: 0.92 },
  { x: 206, y: 58, angle: -48, scale: 0.55 },
  { x: 188, y: 78, angle: 28, scale: 0.85 },
  { x: 160, y: 104, angle: -38, scale: 0.78 },
  { x: 150, y: 118, angle: 12, scale: 0.42 },
  { x: 126, y: 140, angle: 44, scale: 0.72 },
  { x: 100, y: 168, angle: -32, scale: 0.6 },
  { x: 82, y: 192, angle: 22, scale: 0.48 },
  { x: 64, y: 216, angle: -40, scale: 0.4 },
]

export function LeafDecoration({ className }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true" fill="none">
      {/* 枝(茎)。ゆるいS字にして真っ直ぐすぎない自然な曲がりにする */}
      <path
        d="M272 -18 C 248 26, 244 66, 196 92 C 152 114, 128 148, 88 188 C 70 208, 62 228, 52 254"
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
