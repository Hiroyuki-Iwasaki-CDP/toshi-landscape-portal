import { Link } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { fetchClients } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'

export function ClientListPage() {
  const { data: clients, loading, error } = useAsyncData(fetchClients, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">取引先一覧</h1>
        <p className="text-sm text-gray-400">全{clients?.length ?? 0}件</p>
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {(clients ?? []).map((client) => (
              <li key={client.id}>
                <Link
                  to={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-brand-50 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-500">
                        {client.code}
                      </span>
                      <p className="truncate text-sm font-bold text-gray-700">{client.name}</p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {client.industry} ・ 担当: {client.contactPerson}
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
