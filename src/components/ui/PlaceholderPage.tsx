import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  categoryLabel?: string
}

export function PlaceholderPage({ title, categoryLabel }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-16 text-center">
      <Construction className="mb-4 h-10 w-10 text-brand-300" />
      {categoryLabel && <p className="text-xs font-semibold tracking-wide text-brand-400">{categoryLabel}</p>}
      <h1 className="mt-1 text-lg font-bold text-gray-700 sm:text-xl">{title}</h1>
      <p className="mt-2 text-sm text-gray-400">このページは準備中です。今後のリリースで追加予定です。</p>
    </div>
  )
}
