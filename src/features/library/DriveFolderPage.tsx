import { useMemo, useState } from 'react'
import { FileText, FileSpreadsheet, Presentation, File as FileIcon, Search, UploadCloud, FolderSync } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { driveFiles, type DriveFileItem, type DriveFileType } from '../../data/driveFiles'
import { formatDateJa } from '../../lib/format'

const TYPE_ICON: Record<DriveFileType, typeof FileText> = {
  doc: FileText,
  sheet: FileSpreadsheet,
  slide: Presentation,
  pdf: FileText,
}

const TYPE_COLOR: Record<DriveFileType, string> = {
  doc: 'bg-blue-50 text-blue-500',
  sheet: 'bg-green-50 text-green-600',
  slide: 'bg-amber-50 text-amber-600',
  pdf: 'bg-red-50 text-red-500',
}

const EMPTY_FILES: DriveFileItem[] = []

function FileCard({ file }: { file: DriveFileItem }) {
  const Icon = TYPE_ICON[file.type]
  return (
    <div className="flex flex-col rounded-2xl border border-brand-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${TYPE_COLOR[file.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold leading-snug text-gray-700">{file.name}</p>
      <p className="mt-2 text-xs text-gray-400">
        {formatDateJa(file.updatedAt)} ・ {file.updatedBy}
      </p>
      <p className="mt-auto pt-3 text-xs font-medium text-gray-300">Driveで開く（連携後に有効）</p>
    </div>
  )
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

  const files = driveFiles[path] ?? EMPTY_FILES
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return files
    return files.filter((f) => f.name.toLowerCase().includes(q))
  }, [files, query])

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-400">{categoryLabel}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-brand-800 sm:text-xl">{title}</h1>
          {canEdit && (
            <Button variant="secondary" className="text-xs">
              <UploadCloud className="h-4 w-4" />
              ファイルを追加
            </Button>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <FolderSync className="h-3.5 w-3.5" />
          Googleドライブと連携（モック表示・実データではありません）
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ファイル名で検索"
          className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileIcon className="mb-3 h-8 w-8 text-brand-200" />
            <p className="text-sm text-gray-400">
              {files.length === 0 ? 'このフォルダにはまだファイルがありません' : '該当するファイルが見つかりませんでした'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}
