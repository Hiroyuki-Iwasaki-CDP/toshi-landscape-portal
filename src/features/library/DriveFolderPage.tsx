import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  File as FileIcon,
  Search,
  UploadCloud,
  FolderSync,
  Pencil,
  Check,
  X,
  Tag,
  Building2,
  Users,
  Leaf,
  ShieldAlert,
  Mountain,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CategoryTabs } from '../../components/ui/CategoryTabs'
import { PageHeaderBanner } from '../../components/ui/PageHeaderBanner'
import { useAuth } from '../../context/AuthContext'
import { type DriveFileItem, type DriveFileType } from '../../data/driveFiles'
import { driveFolderIds } from '../../data/driveFolderIds'
import { fetchDriveFiles } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { formatDateJa } from '../../lib/format'
import { getManualImagery } from '../../lib/manualImagery'

interface FileCardProps {
  file: DriveFileItem
  canEdit: boolean
  onUpdate: (id: string, patch: { detail: string; tags: string[] }) => void
  onTagClick: (tag: string) => void
}

function FileCard({ file, canEdit, onUpdate, onTagClick }: FileCardProps) {
  const { Icon, gradient } = getManualImagery(file.name)
  const [editing, setEditing] = useState(false)
  const [detailDraft, setDetailDraft] = useState(file.detail ?? '')
  const [tagsDraft, setTagsDraft] = useState((file.tags ?? []).join(', '))

  function startEdit() {
    setDetailDraft(file.detail ?? '')
    setTagsDraft((file.tags ?? []).join(', '))
    setEditing(true)
  }

  function save() {
    const tags = tagsDraft
      .split(/[,、\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean)
    onUpdate(file.id, { detail: detailDraft.trim(), tags })
    setEditing(false)
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${gradient}`}>
        <Icon className="h-12 w-12 text-white/90" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold leading-snug text-gray-700">{file.name}</p>
          {canEdit && !editing && (
            <button
              onClick={startEdit}
              className="shrink-0 rounded p-1 text-gray-300 hover:bg-brand-50 hover:text-brand-600"
              aria-label="詳細・タグを編集"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={detailDraft}
              onChange={(e) => setDetailDraft(e.target.value)}
              placeholder="簡単な詳細説明"
              rows={2}
              className="w-full resize-none rounded-lg border border-brand-200 px-2 py-1.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <input
              type="text"
              value={tagsDraft}
              onChange={(e) => setTagsDraft(e.target.value)}
              placeholder="タグ（カンマ区切り、例: 安全, 夏季）"
              className="w-full rounded-lg border border-brand-200 px-2 py-1.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="flex justify-end gap-1">
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                <X className="h-3.5 w-3.5" />
                取消
              </button>
              <button
                onClick={save}
                className="flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-xs text-white hover:bg-brand-700"
              >
                <Check className="h-3.5 w-3.5" />
                保存
              </button>
            </div>
          </div>
        ) : (
          <>
            {(file.detail || file.excerpt) && (
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500">
                {file.detail || `${file.excerpt}…`}
              </p>
            )}
            {file.tags && file.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {file.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="inline-flex items-center gap-0.5 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600 hover:bg-brand-100"
                  >
                    <Tag className="h-2.5 w-2.5" />#{tag}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-2 text-xs text-gray-400">
          {formatDateJa(file.updatedAt)} ・ {file.updatedBy}
        </p>
        {file.webViewLink ? (
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noreferrer"
            className="mt-auto pt-3 text-xs font-semibold text-brand-600 hover:underline"
          >
            Driveで開く →
          </a>
        ) : (
          <p className="mt-auto pt-3 text-xs font-medium text-gray-300">Driveで開く（連携後に有効）</p>
        )}
      </div>
    </div>
  )
}

const FILE_TYPE_LABEL: Record<DriveFileType, string> = {
  doc: 'ドキュメント',
  sheet: 'スプレッドシート',
  slide: 'スライド',
  pdf: 'PDF',
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  COMPANY: Building2,
  CUSTOMER: Users,
  'GREEN MAINTENANCE': Leaf,
  'TREE RISK ASSESSMENT': ShieldAlert,
  'LANDSCAPE CONSULTING': Mountain,
}

interface DriveFolderPageProps {
  path: string
  title: string
  categoryLabel: string
}

export function DriveFolderPage({ path, title, categoryLabel }: DriveFolderPageProps) {
  const { role } = useAuth()
  const canEdit = role === 'admin' || role === 'editor'
  const [query, setQuery] = useState('')
  const [fileType, setFileType] = useState<DriveFileType | 'すべて'>('すべて')
  const isConnected = Boolean(driveFolderIds[path])

  const { data: fetchedFiles, loading, error } = useAsyncData(() => fetchDriveFiles(path), [path])
  const [localFiles, setLocalFiles] = useState<DriveFileItem[]>([])

  useEffect(() => {
    if (fetchedFiles) setLocalFiles(fetchedFiles)
  }, [fetchedFiles])

  function handleUpdate(id: string, patch: { detail: string; tags: string[] }) {
    setLocalFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const availableTypes = useMemo(() => {
    const seen = new Set<DriveFileType>()
    for (const f of localFiles) seen.add(f.type)
    return [...seen]
  }, [localFiles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '')
    return localFiles.filter((f) => {
      if (fileType !== 'すべて' && f.type !== fileType) return false
      if (!q) return true
      if (f.name.toLowerCase().includes(q)) return true
      if (f.detail?.toLowerCase().includes(q)) return true
      if (f.excerpt?.toLowerCase().includes(q)) return true
      if (f.tags?.some((t) => t.toLowerCase().includes(q))) return true
      return false
    })
  }, [localFiles, query, fileType])

  const legendItems = useMemo(() => {
    const seen = new Map<string, { gradient: string; label: string }>()
    for (const f of localFiles) {
      const { gradient, label } = getManualImagery(f.name)
      if (!seen.has(label)) seen.set(label, { gradient, label })
    }
    return [...seen.values()]
  }, [localFiles])

  return (
    <div className="space-y-4">
      <PageHeaderBanner
        icon={CATEGORY_ICON[categoryLabel] ?? FileIcon}
        eyebrow={categoryLabel}
        title={title}
        description={
          <span className="flex items-center gap-1">
            <FolderSync className="h-3.5 w-3.5" />
            {isConnected ? 'Googleドライブと連携済み（実データ）' : 'Googleドライブと連携（モック表示・実データではありません）'}
          </span>
        }
        actions={
          canEdit && (
            <Button variant="secondary" className="text-xs">
              <UploadCloud className="h-4 w-4" />
              ファイルを追加
            </Button>
          )
        }
      />

      {availableTypes.length > 1 && (
        <CategoryTabs
          options={[
            { value: 'すべて' as const, label: 'すべて' },
            ...availableTypes.map((t) => ({ value: t, label: FILE_TYPE_LABEL[t] })),
          ]}
          value={fileType}
          onChange={setFileType}
        />
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ファイル名・詳細・#タグ で検索"
          className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {!loading && legendItems.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-brand-100 bg-white px-3 py-2">
          <span className="text-xs font-semibold text-gray-400">色分け:</span>
          {legendItems.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${item.gradient}`} />
              {item.label}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <Card>
          <p className="py-12 text-center text-sm text-gray-400">読み込み中…</p>
        </Card>
      ) : error ? (
        <Card>
          <p className="py-12 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileIcon className="mb-3 h-8 w-8 text-brand-200" />
            <p className="text-sm text-gray-400">
              {localFiles.length === 0 ? 'このフォルダにはまだファイルがありません' : '該当するファイルが見つかりませんでした'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((file) => (
            <FileCard key={file.id} file={file} canEdit={canEdit} onUpdate={handleUpdate} onTagClick={setQuery} />
          ))}
        </div>
      )}
    </div>
  )
}
