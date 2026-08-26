// お知らせのカテゴリごとのバッジ色
const CATEGORY_COLOR: Record<string, 'amber' | 'blue' | 'purple' | 'red' | 'gray'> = {
  お知らせ: 'amber',
  人事: 'purple',
  安全: 'red',
  システム: 'blue',
}

export function newsCategoryColor(category: string): 'amber' | 'blue' | 'purple' | 'red' | 'gray' {
  return CATEGORY_COLOR[category] ?? 'gray'
}
