// バナー背景用の装飾イラスト（曲線を多用した、自然で装飾的な葉のクラスター）
// lucideのアイコン(単色線画)では硬い印象になるため、独自SVGで柔らかい雰囲気を出す
interface LeafDecorationProps {
  className?: string
}

function LeafShape({ transform, opacity }: { transform?: string; opacity: number }) {
  return (
    <g transform={transform} opacity={opacity}>
      <path
        d="M50 92 C18 78 6 44 14 10 C46 2 78 10 92 34 C100 58 82 84 50 92 Z"
        fill="white"
      />
      <path
        d="M50 88 C48 66 46 34 40 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <path
        d="M46 60 C36 55 28 50 22 42 M48 40 C40 33 34 27 30 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </g>
  )
}

export function LeafDecoration({ className }: LeafDecorationProps) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true">
      <LeafShape transform="translate(90 10) rotate(18) scale(1.7)" opacity={0.14} />
      <LeafShape transform="translate(10 90) rotate(-24) scale(1.1)" opacity={0.1} />
      <LeafShape transform="translate(150 120) rotate(52) scale(0.85)" opacity={0.08} />
    </svg>
  )
}
