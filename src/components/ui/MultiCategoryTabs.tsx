interface MultiCategoryTabsProps<T extends string> {
  options: { value: T; label: string }[]
  values: T[]
  onChange: (values: T[]) => void
}

export function MultiCategoryTabs<T extends string>({ options, values, onChange }: MultiCategoryTabsProps<T>) {
  function toggle(value: T) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange([])}
        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
          values.length === 0 ? 'bg-brand-600 text-white' : 'border border-brand-200 text-gray-500 hover:bg-brand-50'
        }`}
      >
        すべて
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => toggle(option.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            values.includes(option.value)
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
