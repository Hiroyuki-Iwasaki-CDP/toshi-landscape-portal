// 共通フォーマットユーティリティ

export function formatYen(amount: number): string {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`
}

export function formatNumber(value: number, unit = ''): string {
  return `${value.toLocaleString('ja-JP')}${unit}`
}

export function formatDateJa(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatYearMonthJa(yearMonth: string): string {
  const [y, m] = yearMonth.split('-')
  return `${y}年${Number(m)}月`
}
