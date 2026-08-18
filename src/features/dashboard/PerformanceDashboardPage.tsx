import { useMemo, useState } from 'react'
import { Coins, Users2, Trash2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { MonthlySalesChart } from '../../components/charts/MonthlySalesChart'
import { DeptShareChart } from '../../components/charts/DeptShareChart'
import { ClientRankingChart } from '../../components/charts/ClientRankingChart'
import { FISCAL_YEAR_OPTIONS } from '../../data/sales'
import { fetchClients, fetchSalesRecords, fetchHandoverNotes } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { DEPARTMENT_LABEL, DEPARTMENTS, type Department } from '../../types'
import { formatYen, formatNumber } from '../../lib/format'
import { useAuth } from '../../context/AuthContext'

type PeriodType = 'yearly' | 'monthly'

const FISCAL_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

function monthOf(yearMonth: string): number {
  return Number(yearMonth.split('-')[1])
}

export function PerformanceDashboardPage() {
  const { role } = useAuth()
  const isMasked = role !== 'admin'

  const { data: salesRecords, loading: salesLoading } = useAsyncData(fetchSalesRecords, [])
  const { data: clients, loading: clientsLoading } = useAsyncData(fetchClients, [])
  const { data: handoverNotes } = useAsyncData(fetchHandoverNotes, [])

  const [periodType, setPeriodType] = useState<PeriodType>('monthly')
  const [fiscalYear, setFiscalYear] = useState<number>(FISCAL_YEAR_OPTIONS[FISCAL_YEAR_OPTIONS.length - 1])
  const [clientId, setClientId] = useState<string>('all')
  const [department, setDepartment] = useState<Department | 'all'>('all')

  const filteredRecords = useMemo(() => {
    return (salesRecords ?? []).filter((r) => {
      if (periodType === 'monthly' && r.fiscalYear !== fiscalYear) return false
      if (clientId !== 'all' && r.clientId !== clientId) return false
      if (department !== 'all' && r.department !== department) return false
      return true
    })
  }, [salesRecords, periodType, fiscalYear, clientId, department])

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc.amount += r.amount
        acc.manDays += r.manDays
        acc.wasteKg += r.wasteKg
        return acc
      },
      { amount: 0, manDays: 0, wasteKg: 0 },
    )
  }, [filteredRecords])

  const monthlyChartData = useMemo(() => {
    if (periodType === 'monthly') {
      const byMonth = new Map<number, { annual: number; spot: number }>()
      for (const r of filteredRecords) {
        const m = monthOf(r.yearMonth)
        const entry = byMonth.get(m) ?? { annual: 0, spot: 0 }
        entry[r.contractType] += r.amount
        byMonth.set(m, entry)
      }
      return FISCAL_MONTH_ORDER.map((m) => ({
        label: `${m}月`,
        annual: byMonth.get(m)?.annual ?? 0,
        spot: byMonth.get(m)?.spot ?? 0,
      }))
    }
    const byYear = new Map<number, { annual: number; spot: number }>()
    for (const r of filteredRecords) {
      const entry = byYear.get(r.fiscalYear) ?? { annual: 0, spot: 0 }
      entry[r.contractType] += r.amount
      byYear.set(r.fiscalYear, entry)
    }
    return FISCAL_YEAR_OPTIONS.map((y) => ({
      label: `${y}年度`,
      annual: byYear.get(y)?.annual ?? 0,
      spot: byYear.get(y)?.spot ?? 0,
    }))
  }, [filteredRecords, periodType])

  const contractTypeTotals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, r) => {
        acc[r.contractType] += r.amount
        return acc
      },
      { annual: 0, spot: 0 },
    )
  }, [filteredRecords])

  const deptShareData = useMemo(() => {
    const byDept = new Map<Department, number>()
    for (const r of filteredRecords) {
      byDept.set(r.department, (byDept.get(r.department) ?? 0) + r.amount)
    }
    return DEPARTMENTS.map((d) => ({ label: DEPARTMENT_LABEL[d], amount: byDept.get(d) ?? 0 })).filter(
      (d) => d.amount > 0,
    )
  }, [filteredRecords])

  const selectedClient = useMemo(() => (clients ?? []).find((c) => c.id === clientId) ?? null, [clients, clientId])
  const selectedClientNote = selectedClient ? handoverNotes?.[selectedClient.code] : undefined

  const clientRankingData = useMemo(() => {
    const byClient = new Map<string, number>()
    for (const r of filteredRecords) {
      byClient.set(r.clientId, (byClient.get(r.clientId) ?? 0) + r.amount)
    }
    return (clients ?? [])
      .map((c) => ({ label: c.name, amount: byClient.get(c.id) ?? 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [filteredRecords, clients])

  if (salesLoading || clientsLoading) {
    return <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">実績ダッシュボード</h1>
        <p className="text-sm text-gray-400">
          売上・人工・ごみ量の実績を、月別・年度別・物件（取引先）別・部門別に確認できます
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">期間</label>
            <div className="flex rounded-lg border border-brand-200 p-0.5">
              {(['monthly', 'yearly'] as PeriodType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodType(p)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    periodType === p ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-brand-50'
                  }`}
                >
                  {p === 'monthly' ? '月間' : '年間'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">年度</label>
            <select
              value={fiscalYear}
              disabled={periodType === 'yearly'}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
            >
              {FISCAL_YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}年度
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">取引先（物件）</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
            >
              <option value="all">すべての取引先</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">部門</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department | 'all')}
              className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
            >
              <option value="all">すべての部門</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {DEPARTMENT_LABEL[d]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedClient && (
        <Card title={`申し送り事項（${selectedClient.name}）`}>
          {selectedClientNote ? (
            <p className="whitespace-pre-wrap text-sm text-gray-700">{selectedClientNote}</p>
          ) : (
            <p className="text-sm text-gray-400">現在登録されている申し送り事項はありません。</p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="売上合計" value={formatYen(totals.amount)} icon={<Coins className="h-5 w-5" />} masked={isMasked} />
        <StatCard label="人工合計" value={formatNumber(totals.manDays, '人工')} icon={<Users2 className="h-5 w-5" />} />
        <StatCard label="ごみ量合計" value={formatNumber(totals.wasteKg, 'kg')} icon={<Trash2 className="h-5 w-5" />} />
      </div>

      {isMasked ? (
        <Card title="売上関連グラフ">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm font-semibold text-gray-400">権限がないため売上関連グラフは表示できません</p>
            <p className="mt-1 text-xs text-gray-400">閲覧するには管理者権限でログインしてください</p>
          </div>
        </Card>
      ) : (
        <>
          <Card title={periodType === 'monthly' ? `${fiscalYear}年度 月別売上推移` : '年度別売上推移'}>
            <p className="mb-2 text-xs text-gray-400">
              年間契約: <span className="font-semibold text-brand-700">{formatYen(contractTypeTotals.annual)}</span>
              　スポット: <span className="font-semibold text-amber-600">{formatYen(contractTypeTotals.spot)}</span>
            </p>
            <MonthlySalesChart data={monthlyChartData} />
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="部門別構成比">
              <DeptShareChart data={deptShareData} />
            </Card>
            <Card title="物件（取引先）別売上ランキング">
              <ClientRankingChart data={clientRankingData} />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
