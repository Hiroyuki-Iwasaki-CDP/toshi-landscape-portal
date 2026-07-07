import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon?: ReactNode
  hint?: string
  masked?: boolean
}

export function StatCard({ label, value, icon, hint, masked }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 sm:text-sm">{label}</span>
        {icon && <span className="text-brand-500">{icon}</span>}
      </div>
      {masked ? (
        <div className="mt-2">
          <p className="text-lg font-bold tracking-wide text-gray-300 select-none sm:text-2xl">●●●●●●</p>
          <p className="mt-1 text-xs text-gray-400">権限がないため非表示です</p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-xl font-bold text-brand-800 sm:text-2xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </>
      )}
    </div>
  )
}
