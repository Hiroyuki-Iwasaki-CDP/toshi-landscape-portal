import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'brand' | 'gray' | 'amber' | 'red' | 'blue' | 'purple'
}

const COLOR_CLASS: Record<NonNullable<BadgeProps['color']>, string> = {
  brand: 'bg-brand-100 text-brand-700',
  gray: 'bg-gray-100 text-gray-600',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

export function Badge({ children, color = 'brand' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_CLASS[color]}`}>
      {children}
    </span>
  )
}
