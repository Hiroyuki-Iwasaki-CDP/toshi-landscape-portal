import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Coins, Users2, Trash2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { MonthlySalesChart } from '../../components/charts/MonthlySalesChart'
import { DeptShareChart } from '../../components/charts/DeptShareChart'
import { fetchClients, fetchSalesRecords } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { FISCAL_YEAR_OPTIONS } from '../../data/sales'
import { completionReports } from '../../data/reports'
import { CLIENT_STATUS_LABEL, DEPARTMENT_LABEL, DEPARTMENTS, type Client, type Department } from '../../types'
import { formatYen, formatNumber, formatDateJa } from '../../lib/format'
import { useAuth } from '../../context/AuthContext'

type Tab = 'info' | 'dashboard' | 'history'

const FISCAL_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

function monthOf(yearMonth: string): number {
  return Number(yearMonth.split('-')[1])
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: clients, loading, error } = useAsyncData(fetchClients, [])
  const client = clients?.find((c) => c.id === id)
  const [tab, setTab] = useState<Tab>('info')

  if (loading) {
    return <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
          <ChevronLeft className="h-4 w-4" />
          取引先一覧に戻る
        </Link>
        <Card>
          <p className="text-sm text-gray-500">指定された取引先が見つかりませんでした。</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ChevronLeft className="h-4 w-4" />
        取引先一覧に戻る
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-500">{client.code}</span>
          <h1 className="text-lg font-bold text-brand-800 sm:text-xl">{client.name}</h1>
        </div>
        <p className="text-sm text-gray-400">{client.industry}</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-brand-100 bg-white p-1">
        {(
          [
            ['info', '基本情報'],
            ['dashboard', 'ダッシュボード'],
            ['history', '作業履歴'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              tab === key ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-brand-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && <ClientInfoTab client={client} />}
      {tab === 'dashboard' && <ClientDashboardTab clientId={client.id} />}
      {tab === 'history' && <ClientHistoryTab clientId={client.id} />}
    </div>
  )
}

function ClientInfoTab({ client }: { client: Client }) {
  const rows: [string, string][] = [
    ['取引先コード', client.code],
    ['業種', client.industry],
    ['主管部門', DEPARTMENT_LABEL[client.department]],
    ['状態', CLIENT_STATUS_LABEL[client.status]],
    ['担当者', client.contactPerson],
    ['住所', client.address],
    ['電話番号', client.phone],
    ['契約開始日', formatDateJa(client.contractStartDate)],
  ]
  return (
    <Card title="基本情報">
      <dl className="divide-y divide-brand-50">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:gap-4">
            <dt className="w-32 shrink-0 text-xs font-semibold text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-700">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function ClientDashboardTab({ clientId }: { clientId: string }) {
  const { role } = useAuth()
  const isMasked = role !== 'admin'
  const { data: salesRecords, loading } = useAsyncData(fetchSalesRecords, [])
  const [fiscalYear, setFiscalYear] = useState<number>(FISCAL_YEAR_OPTIONS[FISCAL_YEAR_OPTIONS.length - 1])
  const [department, setDepartment] = useState<Department | 'all'>('all')

  const filtered = useMemo(
    () =>
      (salesRecords ?? []).filter(
        (r) =>
          r.clientId === clientId &&
          r.fiscalYear === fiscalYear &&
          (department === 'all' || r.department === department),
      ),
    [salesRecords, clientId, fiscalYear, department],
  )

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, r) => {
          acc.amount += r.amount
          acc.manDays += r.manDays
          acc.wasteKg += r.wasteKg
          return acc
        },
        { amount: 0, manDays: 0, wasteKg: 0 },
      ),
    [filtered],
  )

  const monthlyData = useMemo(() => {
    const byMonth = new Map<number, { annual: number; spot: number }>()
    for (const r of filtered) {
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
  }, [filtered])

  const deptData = useMemo(() => {
    const byDept = new Map<Department, number>()
    for (const r of filtered) {
      byDept.set(r.department, (byDept.get(r.department) ?? 0) + r.amount)
    }
    return DEPARTMENTS.map((d) => ({ label: DEPARTMENT_LABEL[d], amount: byDept.get(d) ?? 0 })).filter(
      (d) => d.amount > 0,
    )
  }, [filtered])

  if (loading) {
    return <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">年度</label>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))}
              className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
            >
              {FISCAL_YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}年度
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="売上合計" value={formatYen(totals.amount)} icon={<Coins className="h-5 w-5" />} masked={isMasked} />
        <StatCard label="人工合計" value={formatNumber(totals.manDays, '人工')} icon={<Users2 className="h-5 w-5" />} />
        <StatCard label="ごみ量合計" value={formatNumber(totals.wasteKg, 'kg')} icon={<Trash2 className="h-5 w-5" />} />
      </div>

      {isMasked ? (
        <Card>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
            <p className="text-sm font-semibold text-gray-400">権限がないため売上関連グラフは表示できません</p>
          </div>
        </Card>
      ) : (
        <>
          <Card title={`${fiscalYear}年度 月別売上推移`}>
            <MonthlySalesChart data={monthlyData} />
          </Card>
          <Card title="部門別構成比">
            <DeptShareChart data={deptData} />
          </Card>
        </>
      )}
    </div>
  )
}

function ClientHistoryTab({ clientId }: { clientId: string }) {
  const reports = completionReports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => (a.workDate < b.workDate ? 1 : -1))

  if (reports.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400">この取引先の作業履歴はまだありません。</p>
      </Card>
    )
  }

  return (
    <Card title={`作業履歴（${reports.length}件）`}>
      <ul className="divide-y divide-brand-50">
        {reports.map((r) => (
          <li key={r.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{DEPARTMENT_LABEL[r.department]}</Badge>
              <span className="text-xs text-gray-400">{formatDateJa(r.workDate)}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-gray-700">{r.siteName}</p>
            <p className="mt-1 text-sm text-gray-500">{r.summary}</p>
            <div className="mt-2 flex gap-4 text-xs text-gray-400">
              <span>担当: {r.staffName}</span>
              <span>人工: {r.manDays}</span>
              <span>ごみ量: {r.wasteKg}kg</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
