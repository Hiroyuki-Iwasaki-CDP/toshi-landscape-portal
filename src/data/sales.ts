import type { SalesRecord, Department } from '../types'
import { DEPARTMENTS } from '../types'
import { clients } from './clients'

// 文字列から決定論的な疑似乱数(0〜1)を作る簡易ハッシュ
// ダミーデータをリロードのたびに変えず、常に同じ見た目にするために使用する
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

const FISCAL_YEARS = [2023, 2024, 2025]

// 部門ごとの基準売上感（月あたり・取引先あたりのおおよその規模感）
const DEPT_BASE_AMOUNT: Record<Department, number> = {
  GREEN_MAINTENANCE: 850000,
  TREE_RISK_ASSESSMENT: 420000,
  LANDSCAPE_CONSULTING: 260000,
}

const DEPT_BASE_MANDAYS: Record<Department, number> = {
  GREEN_MAINTENANCE: 12,
  TREE_RISK_ASSESSMENT: 5,
  LANDSCAPE_CONSULTING: 3,
}

const DEPT_BASE_WASTE: Record<Department, number> = {
  GREEN_MAINTENANCE: 320,
  TREE_RISK_ASSESSMENT: 60,
  LANDSCAPE_CONSULTING: 10,
}

function buildSales(): SalesRecord[] {
  const records: SalesRecord[] = []

  for (const fiscalYear of FISCAL_YEARS) {
    // 会計年度は4月始まり
    for (let m = 0; m < 12; m++) {
      const monthIndex = (3 + m) % 12 // 4月=index3から開始
      const year = monthIndex < 3 ? fiscalYear + 1 : fiscalYear
      const yearMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

      for (const client of clients) {
        for (const department of DEPARTMENTS) {
          const seed = `${client.id}-${department}-${yearMonth}`
          const r1 = seededRandom(seed)
          const r2 = seededRandom(seed + '-2')

          // 取引先ごとに得意/不得意部門があるような濃淡をつける
          const clientFactor = 0.5 + seededRandom(client.id + department) * 1.2
          // 季節変動（繁忙期: 春・秋の造園シーズン）
          const seasonFactor =
            monthIndex === 3 || monthIndex === 4 || monthIndex === 9 || monthIndex === 10
              ? 1.3
              : 1.0
          // 年度が進むごとに緩やかに成長
          const growthFactor = 1 + (fiscalYear - 2023) * 0.06

          const amount = Math.round(
            DEPT_BASE_AMOUNT[department] *
              clientFactor *
              seasonFactor *
              growthFactor *
              (0.7 + r1 * 0.6),
          )
          const manDays = Math.max(
            0,
            Math.round(DEPT_BASE_MANDAYS[department] * clientFactor * seasonFactor * (0.6 + r2 * 0.8)),
          )
          const wasteKg = Math.max(
            0,
            Math.round(DEPT_BASE_WASTE[department] * clientFactor * seasonFactor * (0.6 + r1 * r2 * 1.5)),
          )

          records.push({
            clientId: client.id,
            department,
            yearMonth,
            fiscalYear,
            amount,
            manDays,
            wasteKg,
          })
        }
      }
    }
  }

  return records
}

export const salesRecords: SalesRecord[] = buildSales()

export const FISCAL_YEAR_OPTIONS = FISCAL_YEARS
