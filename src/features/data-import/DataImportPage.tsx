import { useMemo, useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, X, Download, Link2, RefreshCw } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageHeaderBanner } from '../../components/ui/PageHeaderBanner'
import { fetchClients, fetchClientAliases, connectToFreee, fetchFreeeTransactions } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { parseCsv } from '../../lib/csv'
import { formatYen } from '../../lib/format'
import type { FreeeTransaction } from '../../data/freeeMock'
import { DEPARTMENT_LABEL, DEPARTMENTS, type Client, type ClientAlias, type Department } from '../../types'

// 「取引先コード・名寄せ設計メモ」で想定されているCSV形式のサンプル
// (部門・補助科目, 摘要 は任意列。部門が空の行は取引先マスタの主管部門で補完される)
const SAMPLE_CSV = `計上年月,取引先名,請求額(税抜),部門・補助科目,摘要
2026-07,緑ヶ丘ハウジング(株),850000,,7月分定期メンテナンス
2026-07,サンパーク管理,420000,GREEN MAINTENANCE,
2026-07,市川市 公園緑地課,300000,,樹木診断報告
2026-07,新宿パークサイドビル,180000,,新規取引先の可能性あり（要紐付け）
2026-07,若葉会病院,-15000,,7月分過入金の返金
`

function normalizeName(s: string): string {
  return s.trim().replace(/[\s　]+/g, '')
}

function normalizeHeader(s: string): string {
  return s.replace(/[（）()\s]/g, '')
}

function findColumn(headers: string[], candidates: string[]): number {
  return headers.findIndex((h) => candidates.some((c) => normalizeHeader(h).includes(normalizeHeader(c))))
}

function parseYearMonth(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})[-/年](\d{1,2})月?$/)
  if (!m) return null
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  return `${m[1]}-${String(month).padStart(2, '0')}`
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[,¥円\s]/g, '')
  if (cleaned === '') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function matchDepartment(raw: string): Department | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  return (
    DEPARTMENTS.find(
      (d) => d === trimmed || DEPARTMENT_LABEL[d] === trimmed || DEPARTMENT_LABEL[d].replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''),
    ) ?? null
  )
}

interface ParsedRow {
  key: number
  rawClientName: string
  rawYearMonth: string
  rawAmount: string
  rawDepartment: string
  note: string
  yearMonth: string | null
  amount: number | null
  errors: string[]
  warnings: string[]
  resolvedClientId: string | null
  resolvedDepartment: Department | null
}

function buildAliasMap(clients: Client[], aliases: ClientAlias[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const c of clients) map.set(normalizeName(c.name), c.id)
  for (const a of aliases) map.set(normalizeName(a.alias), a.clientId)
  return map
}

function resolveRow(
  base: Omit<ParsedRow, 'resolvedClientId' | 'resolvedDepartment'>,
  aliasMap: Map<string, string>,
  clientsById: Map<string, Client>,
): ParsedRow {
  const clientId = aliasMap.get(normalizeName(base.rawClientName)) ?? null
  const client = clientId ? (clientsById.get(clientId) ?? null) : null
  const resolvedDepartment = client ? (matchDepartment(base.rawDepartment) ?? client.department) : null
  return { ...base, resolvedClientId: client ? clientId : null, resolvedDepartment }
}

interface RawRowInput {
  rawClientName: string
  rawYearMonth: string
  rawAmount: string
  rawDepartment: string
  note: string
}

function buildRow(
  key: number,
  raw: RawRowInput,
  aliasMap: Map<string, string>,
  clientsById: Map<string, Client>,
  seenKeys: Map<string, number>,
): ParsedRow {
  const { rawClientName, rawYearMonth, rawAmount, rawDepartment, note } = raw
  const yearMonth = parseYearMonth(rawYearMonth)
  const amount = parseAmount(rawAmount)

  const errors: string[] = []
  if (!rawClientName) errors.push('取引先名が空です')
  if (!rawYearMonth || yearMonth === null) errors.push('計上年月の形式が不正です（例: 2026-07）')
  if (!rawAmount || amount === null) errors.push('請求額が数値ではありません')

  const warnings: string[] = []
  if (amount !== null && amount < 0) warnings.push('金額がマイナスです（返金等の可能性）')

  const dupKey = `${normalizeName(rawClientName)}__${yearMonth ?? rawYearMonth}`
  const firstSeenAt = seenKeys.get(dupKey)
  if (firstSeenAt !== undefined) {
    warnings.push(`${firstSeenAt + 2}行目と取引先・年月が重複しています`)
  } else {
    seenKeys.set(dupKey, key)
  }

  const base = { key, rawClientName, rawYearMonth, rawAmount, rawDepartment, note, yearMonth, amount, errors, warnings }
  return resolveRow(base, aliasMap, clientsById)
}

function buildRowsFromCsv(text: string, aliasMap: Map<string, string>, clientsById: Map<string, Client>): ParsedRow[] {
  const table = parseCsv(text)
  if (table.length === 0) return []
  const headers = table[0]
  const idxYearMonth = findColumn(headers, ['計上年月', '年月'])
  const idxClientName = findColumn(headers, ['取引先名', '取引先'])
  const idxAmount = findColumn(headers, ['請求額', '金額'])
  const idxDepartment = findColumn(headers, ['部門', '補助科目'])
  const idxNote = findColumn(headers, ['摘要', '備考'])

  const seenKeys = new Map<string, number>()

  return table.slice(1).map((cols, i) =>
    buildRow(
      i,
      {
        rawClientName: idxClientName >= 0 ? (cols[idxClientName] ?? '').trim() : '',
        rawYearMonth: idxYearMonth >= 0 ? (cols[idxYearMonth] ?? '').trim() : '',
        rawAmount: idxAmount >= 0 ? (cols[idxAmount] ?? '').trim() : '',
        rawDepartment: idxDepartment >= 0 ? (cols[idxDepartment] ?? '').trim() : '',
        note: idxNote >= 0 ? (cols[idxNote] ?? '').trim() : '',
      },
      aliasMap,
      clientsById,
      seenKeys,
    ),
  )
}

function buildRowsFromFreee(
  transactions: FreeeTransaction[],
  aliasMap: Map<string, string>,
  clientsById: Map<string, Client>,
): ParsedRow[] {
  const seenKeys = new Map<string, number>()
  return transactions.map((t, i) =>
    buildRow(
      i,
      {
        rawClientName: t.partnerName.trim(),
        rawYearMonth: t.date.slice(0, 7),
        rawAmount: String(t.amount),
        rawDepartment: (t.department ?? '').trim(),
        note: (t.memo ?? '').trim(),
      },
      aliasMap,
      clientsById,
      seenKeys,
    ),
  )
}

function rowStatus(r: ParsedRow): 'error' | 'matched' | 'unresolved' {
  if (r.errors.length > 0) return 'error'
  if (r.resolvedClientId) return 'matched'
  return 'unresolved'
}

function SummaryStat({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'brand' | 'amber' | 'red' | 'gray' }) {
  const toneClass = {
    brand: 'text-brand-700',
    amber: 'text-amber-700',
    red: 'text-red-600',
    gray: 'text-gray-700',
  }[tone]
  return (
    <div className="rounded-xl border border-brand-100 px-3 py-2.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-0.5 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  )
}

type ImportSource = 'csv' | 'freee'

export function DataImportPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: fetchedClients, loading: clientsLoading } = useAsyncData(fetchClients, [])
  const { data: fetchedAliases, loading: aliasesLoading, error: aliasesError } = useAsyncData(fetchClientAliases, [])
  const masterDataLoading = clientsLoading || aliasesLoading

  const [source, setSource] = useState<ImportSource>('csv')
  const [sessionClients, setSessionClients] = useState<Client[]>([])
  const [extraAliases, setExtraAliases] = useState<ClientAlias[]>([])
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [newClientDrafts, setNewClientDrafts] = useState<Record<number, string>>({})
  const [showNewClientForm, setShowNewClientForm] = useState<Record<number, boolean>>({})
  const [freeeConnecting, setFreeeConnecting] = useState(false)
  const [freeeCompanyName, setFreeeCompanyName] = useState<string | null>(null)
  const [freeeFetching, setFreeeFetching] = useState(false)

  const allClients = useMemo(() => [...(fetchedClients ?? []), ...sessionClients], [fetchedClients, sessionClients])
  const clientsById = useMemo(() => new Map(allClients.map((c) => [c.id, c])), [allClients])
  const sortedClients = useMemo(() => [...allClients].sort((a, b) => a.code.localeCompare(b.code)), [allClients])
  const aliasMap = useMemo(
    () => buildAliasMap(allClients, [...(fetchedAliases ?? []), ...extraAliases]),
    [allClients, fetchedAliases, extraAliases],
  )

  const summary = useMemo(() => {
    if (!rows) return null
    const errorCount = rows.filter((r) => rowStatus(r) === 'error').length
    const matchedCount = rows.filter((r) => rowStatus(r) === 'matched').length
    const unresolvedCount = rows.filter((r) => rowStatus(r) === 'unresolved').length
    return { total: rows.length, errorCount, matchedCount, unresolvedCount }
  }, [rows])

  const deptBreakdown = useMemo(() => {
    if (!rows) return []
    const map = new Map<Department, number>()
    for (const r of rows) {
      if (rowStatus(r) === 'matched' && r.resolvedDepartment) {
        map.set(r.resolvedDepartment, (map.get(r.resolvedDepartment) ?? 0) + (r.amount ?? 0))
      }
    }
    return DEPARTMENTS.map((d) => ({ department: d, amount: map.get(d) ?? 0 })).filter((x) => x.amount !== 0)
  }, [rows])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    if (!selected) return
    setFileName(selected.name)
    setConfirmed(false)
    setShowNewClientForm({})
    setNewClientDrafts({})
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      setRows(buildRowsFromCsv(text, aliasMap, clientsById))
    }
    reader.readAsText(selected, 'utf-8')
  }

  function handleReset() {
    setRows(null)
    setFileName(null)
    setConfirmed(false)
    setShowNewClientForm({})
    setNewClientDrafts({})
    setFreeeCompanyName(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleSourceChange(next: ImportSource) {
    setSource(next)
    handleReset()
  }

  async function handleConnectFreee() {
    setFreeeConnecting(true)
    const { companyName } = await connectToFreee()
    setFreeeCompanyName(companyName)
    setFreeeConnecting(false)
  }

  async function handleFetchFreeeTransactions() {
    setFreeeFetching(true)
    setConfirmed(false)
    setShowNewClientForm({})
    setNewClientDrafts({})
    const transactions = await fetchFreeeTransactions()
    setRows(buildRowsFromFreee(transactions, aliasMap, clientsById))
    setFileName(`freee連携データ（モック・${transactions.length}件）`)
    setFreeeFetching(false)
  }

  function handleDownloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '実績データ取込サンプル.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function assignClientToRow(rowKey: number, client: Client) {
    const row = rows?.find((r) => r.key === rowKey)
    if (!row) return

    const alias: ClientAlias = {
      id: `session-${Date.now()}-${rowKey}`,
      alias: row.rawClientName,
      clientId: client.id,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: '（このセッション）',
    }
    setExtraAliases((prev) => [...prev, alias])

    setRows((prev) =>
      (prev ?? []).map((r) => {
        if (r.errors.length > 0) return r
        if (normalizeName(r.rawClientName) !== normalizeName(row.rawClientName)) return r
        const department = matchDepartment(r.rawDepartment) ?? client.department
        return { ...r, resolvedClientId: client.id, resolvedDepartment: department }
      }),
    )
  }

  function handleCreateNewClient(rowKey: number, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const newClient: Client = {
      id: `session-c-${Date.now()}`,
      code: `C${String(allClients.length + 1).padStart(3, '0')}`,
      name: trimmed,
      industry: '未設定',
      contactPerson: '未設定',
      address: '未設定',
      contractStartDate: new Date().toISOString().slice(0, 10),
      phone: '未設定',
      department: 'GREEN_MAINTENANCE',
      status: 'active',
    }
    setSessionClients((prev) => [...prev, newClient])
    assignClientToRow(rowKey, newClient)
    setShowNewClientForm((prev) => ({ ...prev, [rowKey]: false }))
  }

  const canConfirm = Boolean(summary && summary.unresolvedCount === 0 && summary.matchedCount > 0 && !confirmed)

  return (
    <div className="space-y-4">
      <PageHeaderBanner
        icon={UploadCloud}
        eyebrow="COMPANY"
        title="データ取込"
        description="税理士事務所から提供されるCSVファイル、または将来的にはfreee会計から実績データ（取引先×年月×金額）を取り込みます。取引先名は登録済みの別名辞書と自動照合し、未紐付けの場合はこの画面で手動で紐付けます。"
      />

      <div className="flex gap-1 rounded-lg border border-brand-100 bg-white p-1">
        {(
          [
            ['csv', 'CSVファイル'],
            ['freee', 'freee連携（モック）'],
          ] as [ImportSource, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleSourceChange(key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              source === key ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-brand-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {source === 'csv' ? (
        <>
          <Card title="CSVフォーマット">
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <span className="font-semibold text-gray-700">計上年月</span>（必須・例: 2026-07）
              </li>
              <li>
                <span className="font-semibold text-gray-700">取引先名</span>（必須）
              </li>
              <li>
                <span className="font-semibold text-gray-700">請求額(税抜)</span>（必須・数値）
              </li>
              <li>
                <span className="font-semibold text-gray-700">部門・補助科目</span>（任意 — 未入力の場合は取引先マスタの主管部門を自動で使用）
              </li>
              <li>
                <span className="font-semibold text-gray-700">摘要</span>（任意）
              </li>
            </ul>
            <p className="mt-3 text-xs text-gray-400">
              文字コードはUTF-8を想定しています。列の順序は問いませんが、上記の見出し名（または部分一致）を含む列見出しが必要です。
            </p>
            <div className="mt-4">
              <Button variant="secondary" className="text-xs" onClick={handleDownloadSample}>
                <Download className="h-4 w-4" />
                サンプルCSVをダウンロード
              </Button>
            </div>
          </Card>

          <Card title="ファイル選択">
            {masterDataLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-100 bg-brand-50/30 px-4 py-10 text-center">
                <p className="text-sm text-gray-400">取引先マスタを読み込み中…</p>
              </div>
            ) : (
              <label
                htmlFor="import-file"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-4 py-10 text-center transition-colors hover:bg-brand-50"
              >
                <UploadCloud className="h-8 w-8 text-brand-400" />
                <p className="text-sm font-semibold text-brand-700">クリックしてファイルを選択</p>
                <p className="text-xs text-gray-400">CSV (.csv) に対応</p>
                <input ref={inputRef} id="import-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            {aliasesError && (
              <p className="mt-2 text-xs text-amber-600">
                別名辞書の取得に失敗しました（{aliasesError}）。取引先名の完全一致のみで自動照合します。
              </p>
            )}

            {fileName && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-100 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 shrink-0 text-brand-500" />
                  <span className="truncate text-sm text-gray-700">{fileName}</span>
                </div>
                <button onClick={handleReset} className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="ファイルを取り消す">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card title="freee会計 連携（モック）">
          <p className="text-sm text-gray-600">
            クライアントより「データ取込はfreeeとの連携を検討している」とのご要望を受け、実際のfreee
            APIとはまだ接続していませんが、接続できた場合にどのような画面・データの流れになるかを確認するためのモックです。
          </p>
          <p className="mt-2 text-xs text-amber-600">
            ※実際のfreee連携には freee 側でのAPI利用申請・OAuth認可の設定が別途必要です（未着手）。
          </p>

          {!freeeCompanyName ? (
            <div className="mt-4">
              <Button onClick={handleConnectFreee} disabled={freeeConnecting} className="text-xs">
                <Link2 className="h-4 w-4" />
                {freeeConnecting ? '接続中…' : 'freeeに接続する（モック）'}
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-brand-100 bg-white px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Link2 className="h-4 w-4 text-brand-500" />
                  接続先: <span className="font-semibold">{freeeCompanyName}</span>
                </div>
                <button
                  onClick={() => setFreeeCompanyName(null)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100"
                  aria-label="接続を解除"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={handleFetchFreeeTransactions} disabled={freeeFetching} className="text-xs">
                <RefreshCw className="h-4 w-4" />
                {freeeFetching ? '取得中…' : '取引データを取得'}
              </Button>
            </div>
          )}

          {aliasesError && (
            <p className="mt-2 text-xs text-amber-600">
              別名辞書の取得に失敗しました（{aliasesError}）。取引先名の完全一致のみで自動照合します。
            </p>
          )}

          {fileName && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-100 bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-brand-500" />
                <span className="truncate text-sm text-gray-700">{fileName}</span>
              </div>
              <button onClick={handleReset} className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="取消">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </Card>
      )}

      {rows && summary && (
        <>
          <Card title="取込サマリー">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat label="総行数" value={summary.total} />
              <SummaryStat label="自動紐付け" value={summary.matchedCount} tone="brand" />
              <SummaryStat label="要確認" value={summary.unresolvedCount} tone="amber" />
              <SummaryStat label="エラー(除外)" value={summary.errorCount} tone="red" />
            </div>
            {summary.unresolvedCount > 0 && (
              <p className="mt-3 text-xs text-amber-700">
                「要確認」の行は下の表の「紐付け先」列で既存の取引先を選ぶか、新規取引先として登録してください。すべて解消すると取込を確定できます。
              </p>
            )}
          </Card>

          <Card title={`取込プレビュー（${rows.length}行）`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-xs text-gray-400">
                    <th className="py-2 pr-3 font-semibold">状態</th>
                    <th className="py-2 pr-3 font-semibold">計上年月</th>
                    <th className="py-2 pr-3 font-semibold">取引先名（CSV）</th>
                    <th className="py-2 pr-3 font-semibold">紐付け先</th>
                    <th className="py-2 pr-3 font-semibold">請求額</th>
                    <th className="py-2 font-semibold">備考</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {rows.map((row) => {
                    const status = rowStatus(row)
                    return (
                      <tr key={row.key}>
                        <td className="py-2 pr-3 align-top">
                          {status === 'error' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              エラー
                            </span>
                          )}
                          {status === 'matched' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              OK
                            </span>
                          )}
                          {status === 'unresolved' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              要確認
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 align-top text-gray-600">{row.yearMonth ?? (row.rawYearMonth || '—')}</td>
                        <td className="py-2 pr-3 align-top text-gray-700">{row.rawClientName || '—'}</td>
                        <td className="py-2 pr-3 align-top">
                          {status === 'matched' && row.resolvedClientId && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700">{clientsById.get(row.resolvedClientId)?.name}</p>
                              {row.resolvedDepartment && (
                                <span className="mt-0.5 inline-block">
                                  <Badge>{DEPARTMENT_LABEL[row.resolvedDepartment]}</Badge>
                                </span>
                              )}
                            </div>
                          )}
                          {status === 'unresolved' && (
                            <div className="min-w-[180px]">
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  const v = e.target.value
                                  if (v === '__new__') {
                                    setShowNewClientForm((prev) => ({ ...prev, [row.key]: true }))
                                  } else if (v) {
                                    const client = clientsById.get(v)
                                    if (client) assignClientToRow(row.key, client)
                                  }
                                }}
                                className="w-full rounded-lg border border-brand-200 px-2 py-1.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                              >
                                <option value="">既存の取引先を選択…</option>
                                {sortedClients.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.code} {c.name}
                                  </option>
                                ))}
                                <option value="__new__">＋ 新規取引先として登録</option>
                              </select>
                              {showNewClientForm[row.key] && (
                                <div className="mt-1.5 flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={newClientDrafts[row.key] ?? row.rawClientName}
                                    onChange={(e) => setNewClientDrafts((prev) => ({ ...prev, [row.key]: e.target.value }))}
                                    className="w-full rounded border border-brand-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleCreateNewClient(row.key, newClientDrafts[row.key] ?? row.rawClientName)}
                                    className="shrink-0 rounded bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                                  >
                                    登録
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {status === 'error' && <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="py-2 pr-3 align-top text-gray-600">{row.amount !== null ? formatYen(row.amount) : row.rawAmount || '—'}</td>
                        <td className="py-2 align-top text-xs">
                          {row.errors.map((e) => (
                            <p key={e} className="text-red-600">
                              {e}
                            </p>
                          ))}
                          {row.warnings.map((w) => (
                            <p key={w} className="text-amber-600">
                              {w}
                            </p>
                          ))}
                          {row.note && <p className="text-gray-400">{row.note}</p>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setConfirmed(true)} disabled={!canConfirm}>
              {confirmed ? '取込済み' : '取込を確定する'}
            </Button>
          </div>

          {confirmed && (
            <Card title="取込結果（モック）">
              <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                <p className="text-sm font-semibold text-brand-800">
                  {summary.matchedCount}件を取り込みました（部門は取引先マスタの主管部門から自動補完）。エラー{summary.errorCount}件は除外しました。
                </p>
              </div>
              {deptBreakdown.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-brand-100 text-xs text-gray-400">
                        <th className="py-2 pr-4 font-semibold">部門</th>
                        <th className="py-2 font-semibold">金額合計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                      {deptBreakdown.map((d) => (
                        <tr key={d.department}>
                          <td className="py-2 pr-4">{DEPARTMENT_LABEL[d.department]}</td>
                          <td className="py-2 font-semibold text-brand-700">{formatYen(d.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-xs text-gray-400">
                ※このモックでは実データベースへの書き込みは行っていません。今回新たに紐付けた取引先名は、このセッション中のみ別名として記憶されます。
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
