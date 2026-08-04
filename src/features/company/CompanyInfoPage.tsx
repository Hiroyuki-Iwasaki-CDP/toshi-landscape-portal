import { useMemo, useState } from 'react'
import { Bell, CalendarDays, MapPin, Clock, Search, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { newsItems } from '../../data/news'
import { scheduleItems } from '../../data/schedule'
import { formatDateJa } from '../../lib/format'

const PAGE_SIZE = 10

export function CompanyNewsPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return newsItems
    return newsItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q),
    )
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-brand-800 sm:text-xl">お知らせ</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="タイトル・本文を検索"
          className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <Card>
        {pageItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">該当するお知らせが見つかりませんでした</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {pageItems.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="gray">{item.category}</Badge>
                    <span className="text-xs text-gray-400">{formatDateJa(item.date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-gray-700">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-brand-50 pt-4">
            <span className="text-xs text-gray-400">
              {filtered.length}件中 {(currentPage - 1) * PAGE_SIZE + 1}〜
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}件
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="前のページ"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition-colors ${
                    p === currentPage ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-brand-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="次のページ"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export function CompanySchedulePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">スケジュール</h1>
        <a
          href="https://calendar.google.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Googleカレンダーで開く
        </a>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-700">
        <RefreshCw className="h-3.5 w-3.5 shrink-0" />
        <span>Googleカレンダーと連携済み（モック）。予定の追加・編集はGoogleカレンダー側で行うと、こちらにも反映されます。</span>
      </div>

      <Card>
        <ul className="divide-y divide-brand-50">
          {scheduleItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-700">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateJa(item.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
