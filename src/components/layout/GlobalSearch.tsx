import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, Bell, Building2, LayoutGrid } from 'lucide-react'
import { navCategories } from './NavConfig'
import { fetchNews, fetchClients } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { driveFiles as mockDriveFiles } from '../../data/driveFiles'
import { newsCategoryColor } from '../../lib/newsCategory'
import { Badge } from '../ui/Badge'

interface SearchResult {
  key: string
  icon: typeof FileText
  title: string
  subtitle: string
  path: string
  badge?: { label: string; color: 'amber' | 'blue' | 'purple' | 'gray' }
}

interface GlobalSearchProps {
  variant: 'sidebar' | 'mobile'
}

export function GlobalSearch({ variant }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const { data: newsItems } = useAsyncData(fetchNews, [])
  const { data: clients } = useAsyncData(fetchClients, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: SearchResult[] = []

    for (const category of navCategories) {
      for (const item of category.items) {
        if (item.label.toLowerCase().includes(q)) {
          out.push({
            key: `nav-${item.path}`,
            icon: LayoutGrid,
            title: item.label,
            subtitle: `ページ ・ ${category.label}`,
            path: item.path,
          })
        }
      }
    }

    for (const item of newsItems ?? []) {
      if (item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q)) {
        out.push({
          key: `news-${item.id}`,
          icon: Bell,
          title: item.title,
          subtitle: 'お知らせ',
          path: '/company/news',
          badge: { label: item.category, color: newsCategoryColor(item.category) },
        })
      }
    }

    for (const client of clients ?? []) {
      if (
        client.name.toLowerCase().includes(q) ||
        client.code.toLowerCase().includes(q) ||
        client.industry.toLowerCase().includes(q) ||
        client.contactPerson.toLowerCase().includes(q)
      ) {
        out.push({
          key: `client-${client.id}`,
          icon: Building2,
          title: client.name,
          subtitle: `取引先 ・ ${client.industry}`,
          path: `/clients/${client.id}`,
        })
      }
    }

    for (const [path, files] of Object.entries(mockDriveFiles)) {
      for (const file of files) {
        const hit =
          file.name.toLowerCase().includes(q) ||
          file.detail?.toLowerCase().includes(q) ||
          file.tags?.some((t) => t.toLowerCase().includes(q))
        if (hit) {
          out.push({
            key: `file-${file.id}`,
            icon: FileText,
            title: file.name,
            subtitle: `資料 ・ ${file.updatedBy}`,
            path,
          })
        }
      }
    }

    return out.slice(0, 30)
  }, [query, newsItems, clients])

  function goTo(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <>
      {variant === 'sidebar' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-100 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Search className="h-4 w-4" />
          検索
        </button>
      ) : (
        <button
          aria-label="検索"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-brand-700 hover:bg-brand-50"
        >
          <Search className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-brand-100 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ページ・お知らせ・取引先・資料を検索"
                className="min-w-0 flex-1 text-sm focus:outline-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  キーワードを入力してください
                </p>
              ) : results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  該当する結果が見つかりませんでした
                </p>
              ) : (
                <ul className="divide-y divide-brand-50">
                  {results.map((r) => (
                    <li key={r.key}>
                      <button
                        onClick={() => goTo(r.path)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50"
                      >
                        <r.icon className="h-4 w-4 shrink-0 text-brand-400" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-700">{r.title}</p>
                            {r.badge && <Badge color={r.badge.color}>{r.badge.label}</Badge>}
                          </div>
                          <p className="truncate text-xs text-gray-400">{r.subtitle}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
