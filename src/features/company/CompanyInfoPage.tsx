import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  MapPin,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { CategoryTabs } from '../../components/ui/CategoryTabs'
import { fetchNews, fetchSchedule } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { formatDateJa } from '../../lib/format'
import { newsCategoryColor } from '../../lib/newsCategory'
import { useAuth } from '../../context/AuthContext'
import type { NewsItem } from '../../types'

const PAGE_SIZE = 10
const NEWS_CATEGORIES = ['お知らせ', 'システム', '人事']

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

interface NewsFormValue {
  date: string
  category: string
  title: string
  body: string
}

interface NewsFormProps {
  initial?: NewsItem
  onCancel: () => void
  onSave: (value: NewsFormValue) => void
}

function NewsForm({ initial, onCancel, onSave }: NewsFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayStr())
  const [category, setCategory] = useState(initial?.category ?? NEWS_CATEGORIES[0])
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')

  function handleSave() {
    if (!title.trim() || !body.trim()) return
    onSave({ date, category, title: title.trim(), body: body.trim() })
  }

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力"
          className="w-full rounded-lg border border-brand-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">本文</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="本文を入力"
          className="w-full resize-none rounded-lg border border-brand-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="text-xs">
          <X className="h-3.5 w-3.5" />
          取消
        </Button>
        <Button onClick={handleSave} className="text-xs">
          <Check className="h-3.5 w-3.5" />
          {initial ? '更新する' : '投稿する'}
        </Button>
      </div>
    </div>
  )
}

export function CompanyNewsPage() {
  const { role } = useAuth()
  const canWrite = role === 'admin' || role === 'editor'
  const { data: fetchedNews, loading, error } = useAsyncData(fetchNews, [])
  const [localNews, setLocalNews] = useState<NewsItem[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('すべて')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (fetchedNews) setLocalNews(fetchedNews)
  }, [fetchedNews])

  function sortByDateDesc(items: NewsItem[]): NewsItem[] {
    return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }

  function handleCreate(value: NewsFormValue) {
    const newItem: NewsItem = { id: `local-${Date.now()}`, ...value }
    setLocalNews((prev) => sortByDateDesc([newItem, ...prev]))
    setCreating(false)
  }

  function handleUpdate(id: string, value: NewsFormValue) {
    setLocalNews((prev) => sortByDateDesc(prev.map((n) => (n.id === id ? { ...n, ...value } : n))))
    setEditingId(null)
  }

  function handleDelete(id: string) {
    if (!window.confirm('このお知らせを削除しますか？')) return
    setLocalNews((prev) => prev.filter((n) => n.id !== id))
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return localNews.filter((item) => {
      if (category !== 'すべて' && item.category !== category) return false
      if (!q) return true
      return item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)
    })
  }, [localNews, query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  function handleCategoryChange(value: string) {
    setCategory(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">お知らせ</h1>
        {canWrite && !creating && (
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => {
              setCreating(true)
              setEditingId(null)
            }}
          >
            <Plus className="h-4 w-4" />
            新規投稿
          </Button>
        )}
      </div>

      {canWrite && (
        <p className="text-xs text-gray-400">
          ※このモックでは投稿内容は実データベースに保存されません（画面を再読み込みすると元に戻ります）
        </p>
      )}

      {creating && (
        <NewsForm onCancel={() => setCreating(false)} onSave={handleCreate} />
      )}

      <CategoryTabs
        options={[{ value: 'すべて', label: 'すべて' }, ...NEWS_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        value={category}
        onChange={handleCategoryChange}
      />

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
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        ) : pageItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">該当するお知らせが見つかりませんでした</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {pageItems.map((item) =>
              editingId === item.id ? (
                <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <NewsForm initial={item} onCancel={() => setEditingId(null)} onSave={(value) => handleUpdate(item.id, value)} />
                </li>
              ) : (
                <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={newsCategoryColor(item.category)}>{item.category}</Badge>
                      <span className="text-xs text-gray-400">{formatDateJa(item.date)}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-gray-700">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.body}</p>
                  </div>
                  {canWrite && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          setEditingId(item.id)
                          setCreating(false)
                        }}
                        className="rounded p-1.5 text-gray-300 hover:bg-brand-50 hover:text-brand-600"
                        aria-label="編集"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-600"
                        aria-label="削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ),
            )}
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
  const { data: scheduleItems, loading, error } = useAsyncData(fetchSchedule, [])

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
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {(scheduleItems ?? []).map((item) => (
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
        )}
      </Card>
    </div>
  )
}
