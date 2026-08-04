import { useEffect, useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

interface ImportResult {
  fileName: string
  importedCount: number
  inconsistencies: { row: number; original: string; suggested: string }[]
}

// 表記ゆれ検出のダミー結果パターン（ファイル名に依らず、それらしい結果を再現するための固定シード値）
function buildDummyResult(fileName: string): ImportResult {
  let seed = 0
  for (let i = 0; i < fileName.length; i++) seed += fileName.charCodeAt(i)

  const importedCount = 80 + (seed % 60)
  const patterns = [
    { original: '緑ヶ丘ハウジング(株)', suggested: '緑ヶ丘ハウジング株式会社' },
    { original: 'サンパーク管理', suggested: '株式会社サンパーク管理' },
    { original: '若葉会病院', suggested: '医療法人社団 若葉会' },
    { original: '常盤台学院', suggested: 'learning学園 常盤台学院' },
  ]
  const inconsistencyCount = 1 + (seed % 4)
  const inconsistencies = Array.from({ length: inconsistencyCount }, (_, i) => ({
    row: 3 + i * 7 + (seed % 5),
    original: patterns[i % patterns.length].original,
    suggested: patterns[i % patterns.length].suggested,
  }))

  return { fileName, importedCount, inconsistencies }
}

export function DataImportPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setResult(null)
  }

  function handleImport() {
    if (!file) return
    setImporting(true)
    setResult(null)
    // 実際の取込処理は行わず、ダミー結果を一定時間後に表示する
    timeoutRef.current = window.setTimeout(() => {
      setResult(buildDummyResult(file.name))
      setImporting(false)
    }, 800)
  }

  function handleReset() {
    setFile(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-brand-800 sm:text-xl">データ取込</h1>
        <p className="text-sm text-gray-400">
          税理士事務所から提供されるCSV/Excelファイルから売上・実績データを取り込みます（モック）
        </p>
      </div>

      <Card title="ファイル選択">
        <label
          htmlFor="import-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-4 py-10 text-center transition-colors hover:bg-brand-50"
        >
          <UploadCloud className="h-8 w-8 text-brand-400" />
          <p className="text-sm font-semibold text-brand-700">クリックしてファイルを選択</p>
          <p className="text-xs text-gray-400">CSV / Excel (.csv, .xlsx) に対応</p>
          <input
            ref={inputRef}
            id="import-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {file && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-100 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-brand-500" />
              <span className="truncate text-sm text-gray-700">{file.name}</span>
            </div>
            <button onClick={handleReset} className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="ファイルを取り消す">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? '取込中…' : '取込を実行する'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card title="取込結果">
          <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm font-semibold text-brand-800">
              {result.importedCount}件を取り込みました。表記ゆれ{result.inconsistencies.length}件を検出しました。
            </p>
          </div>

          {result.inconsistencies.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-xs text-gray-400">
                    <th className="py-2 pr-4 font-semibold">行</th>
                    <th className="py-2 pr-4 font-semibold">取込データ</th>
                    <th className="py-2 font-semibold">推奨表記</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {result.inconsistencies.map((item) => (
                    <tr key={item.row}>
                      <td className="py-2 pr-4 text-gray-400">{item.row}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {item.original}
                        </span>
                      </td>
                      <td className="py-2 font-semibold text-brand-700">{item.suggested}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
