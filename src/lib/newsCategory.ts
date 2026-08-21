// お知らせのカテゴリごとのバッジ色
const CATEGORY_COLOR: Record<string, 'amber' | 'blue' | 'purple' | 'gray'> = {
  お知らせ: 'amber',
  システム: 'blue',
  人事: 'purple',
}

export function newsCategoryColor(category: string): 'amber' | 'blue' | 'purple' | 'gray' {
  return CATEGORY_COLOR[category] ?? 'gray'
}
