import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function Card({ title, children, className = '', actions }: CardProps) {
  return (
    <div className={`rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-bold text-brand-800 sm:text-lg">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
