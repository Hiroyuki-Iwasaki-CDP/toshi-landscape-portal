interface CategoryTabsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function CategoryTabs<T extends string>({ options, value, onChange }: CategoryTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value
              ? 'bg-brand-600 text-white'
              : 'border border-brand-200 text-gray-500 hover:bg-brand-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
