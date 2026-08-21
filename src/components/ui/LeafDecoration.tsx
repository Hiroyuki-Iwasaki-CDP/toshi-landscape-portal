// バナー背景用の装飾イラスト（小枝に葉が密集して茂るモチーフ）
// 参考写真(実物の小枝)に合わせ、葉を密に重ねて茂みらしく見せている
interface LeafDecorationProps {
  className?: string
}

// 単体の葉（先端が尖った細長い形+中央の葉脈+側脈）
function LeafShape({ transform }: { transform: string }) {
  return (
    <g transform={transform}>
      <path d="M0 -42 C11 -33 13 -8 8 12 C5 24 2 33 0 42 C-2 33 -5 24 -8 12 C-13 -8 -11 -33 0 -42 Z" fill="currentColor" />
      <path
        d="M0 -30 L0 34 M0 -18 L-7 -6 M0 -18 L7 -6 M0 0 L-8 12 M0 0 L8 12"
        stroke="white"
        strokeOpacity="0.22"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </g>
  )
}

// 葉の付け根(枝上の点 sx,sy)・葉の位置(x,y)・向き(角度)・大きさ
// 密集した葉のかたまりを枝の先端側(右上)に多めに、根元(左下)ほど少なく配置する
const LEAVES: { sx: number; sy: number; x: number; y: number; angle: number; scale: number }[] = [
  { sx: 250, sy: 8, x: 276, y: -22, angle: 30, scale: 0.85 },
  { sx: 250, sy: 8, x: 292, y: 6, angle: 70, scale: 0.95 },
  { sx: 240, sy: 20, x: 264, y: 44, angle: 115, scale: 0.7 },
  { sx: 226, sy: 36, x: 210, y: 10, angle: -50, scale: 0.9 },
  { sx: 226, sy: 36, x: 250, y: 54, angle: 95, scale: 0.6 },
  { sx: 210, sy: 54, x: 176, y: 34, angle: -35, scale: 0.75 },
  { sx: 210, sy: 54, x: 222, y: 82, angle: 120, scale: 0.85 },
  { sx: 196, sy: 70, x: 192, y: 100, angle: 150, scale: 0.65 },
  { sx: 196, sy: 70, x: 160, y: 60, angle: -60, scale: 0.55 },
  { sx: 178, sy: 90, x: 150, y: 118, angle: 155, scale: 0.72 },
  { sx: 178, sy: 90, x: 202, y: 122, angle: 100, scale: 0.5 },
  { sx: 158, sy: 112, x: 128, y: 96, angle: -40, scale: 0.6 },
  { sx: 158, sy: 112, x: 140, y: 148, angle: 145, scale: 0.4 },
  { sx: 130, sy: 142, x: 100, y: 158, angle: 160, scale: 0.42 },
  { sx: 100, sy: 174, x: 72, y: 190, angle: 160, scale: 0.34 },
  { sx: 74, sy: 202, x: 48, y: 216, angle: 155, scale: 0.28 },
]

export function LeafDecoration({ className }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true" fill="none">
      {/* 枝(茎)。木質の硬い直線にする(蔦のようにしならせない) */}
      <path d="M262 -4 L58 210" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

      <g opacity="0.45">
        {LEAVES.map((leaf, i) => (
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
            <LeafShape transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`} />
          </g>
        ))}
      </g>
    </svg>
  )
}
