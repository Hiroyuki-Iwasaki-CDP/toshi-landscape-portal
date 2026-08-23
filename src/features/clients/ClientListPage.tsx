import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, ChevronRight, Search } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { CategoryTabs } from '../../components/ui/CategoryTabs'
import { fetchClients } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { CLIENT_STATUS_LABEL, DEPARTMENT_LABEL, DEPARTMENTS, type Department } from '../../types'

export function ClientListPage() {
  const { data: clients, loading, error } = useAsyncData(fetchClients, [])
  const [department, setDepartment] = useState<Department | 'すべて'>('すべて')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (clients ?? []).filter((c) => {
      if (department !== 'すべて' && c.department !== department) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q)
      )
    })
  }, [clients, department, query])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">取引先一覧</h1>
        <p className="text-sm text-gray-400">全{clients?.length ?? 0}件</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="取引先名・コード・業種・担当者で検索"
          className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <CategoryTabs
        options={[
          { value: 'すべて' as const, label: 'すべて' },
          ...DEPARTMENTS.map((d) => ({ value: d, label: DEPARTMENT_LABEL[d] })),
        ]}
        value={department}
        onChange={setDepartment}
      />

      <Card className="p-0 sm:p-0">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">該当する取引先が見つかりませんでした</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {filtered.map((client) => (
              <li key={client.id}>
                <Link
                  to={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-brand-50 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-500">
                        {client.code}
                      </span>
                      <p className="truncate text-sm font-bold text-gray-700">{client.name}</p>
                      {client.status !== 'active' && <Badge color="amber">{CLIENT_STATUS_LABEL[client.status]}</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {client.industry} ・ 担当: {client.contactPerson} ・ 主管: {DEPARTMENT_LABEL[client.department]}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
