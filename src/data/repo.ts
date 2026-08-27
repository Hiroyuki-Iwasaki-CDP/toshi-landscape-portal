// データ取得の単一窓口。Supabase接続時は実データ、未接続時はダミーデータを返す。
import { supabase, isSupabaseConfigured, supabaseUrl, supabasePublishableKey } from '../lib/supabaseClient'
import type { Client, ClientAlias, ClientStatus, Department, NewsItem, SalesRecord, ScheduleItem, UserRole } from '../types'
import type { UserRecord } from './users'
import { newsItems } from './news'
import { scheduleItems } from './schedule'
import { clients as mockClients } from './clients'
import { clientAliases as mockClientAliases } from './clientAliases'
import { salesRecords as mockSalesRecords } from './sales'
import { initialUsers } from './users'
import { driveFiles as mockDriveFiles, type DriveFileItem, type DriveFileType } from './driveFiles'
import { driveFolderIds } from './driveFolderIds'
import { MOCK_FREEE_COMPANY_NAME, mockFreeeTransactions, type FreeeTransaction } from './freeeMock'
import { mockHandoverNotes, type HandoverNoteEntry } from './handoverNotesMock'

function mustSupabase() {
  if (!supabase) throw new Error('Supabaseが設定されていません')
  return supabase
}

export async function fetchNews(): Promise<NewsItem[]> {
  if (!isSupabaseConfigured) return newsItems
  const { data, error } = await mustSupabase().from('news').select('*').order('date', { ascending: false })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    date: row.date,
    category: row.category,
    title: row.title,
    body: row.body,
  }))
}

export async function fetchSchedule(): Promise<ScheduleItem[]> {
  if (!isSupabaseConfigured) return scheduleItems
  const { data, error } = await mustSupabase().from('schedule_items').select('*').order('date', { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    date: row.date,
    time: row.time,
    title: row.title,
    location: row.location,
  }))
}

export async function fetchClients(): Promise<Client[]> {
  if (!isSupabaseConfigured) return mockClients
  const { data, error } = await mustSupabase().from('clients').select('*').order('code', { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    industry: row.industry,
    contactPerson: row.contact_person,
    address: row.address,
    contractStartDate: row.contract_start_date,
    phone: row.phone,
    // departments列が未整備のDBでは、旧department列（単一）から補完する
    departments: (Array.isArray(row.departments) ? row.departments : row.department ? [row.department] : []) as Department[],
    status: row.status as ClientStatus,
  }))
}

export async function fetchClientAliases(): Promise<ClientAlias[]> {
  if (!isSupabaseConfigured) return mockClientAliases
  const { data, error } = await mustSupabase().from('client_aliases').select('*')
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    alias: row.alias,
    clientId: row.client_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }))
}

export async function fetchSalesRecords(): Promise<SalesRecord[]> {
  if (!isSupabaseConfigured) return mockSalesRecords
  // Supabaseプロジェクト側の設定でAPIの1リクエストあたりの最大件数が1000件に
  // 制限されており(.range()で広げても上限は変わらない)、3年分×取引先×部門×
  // スポット分で1000件を超えるため、1000件ずつページングして全件取得する
  const pageSize = 1000
  const rows: any[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await mustSupabase()
      .from('sales_records')
      .select('*')
      .range(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < pageSize) break
  }
  return rows.map((row) => ({
    clientId: row.client_id,
    department: row.department as Department,
    yearMonth: row.year_month,
    fiscalYear: row.fiscal_year,
    contractType: (row.contract_type ?? 'annual') as SalesRecord['contractType'],
    amount: Number(row.amount),
    manDays: Number(row.man_days),
    wasteKg: Number(row.waste_kg),
  }))
}

const MIME_TYPE_MAP: Record<string, DriveFileType> = {
  'application/vnd.google-apps.document': 'doc',
  'application/vnd.google-apps.spreadsheet': 'sheet',
  'application/vnd.google-apps.presentation': 'slide',
  'application/pdf': 'pdf',
}

interface DriveApiFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webViewLink?: string
  thumbnailLink?: string
  excerpt?: string
  lastModifyingUser?: { displayName?: string }
}

interface DriveFileMetaRow {
  file_id: string
  category: string | null
  detail: string | null
  tags: string[] | null
}

// Googleドライブのファイル自体にはこのアプリ独自の「カテゴリー・詳細説明・タグ」を
// 保存できないため、drive_file_meta テーブル（file_id紐付け）に保存し、
// 実データ取得時にここで突き合わせて補完する。テーブルが無い/未接続の場合は空扱いにする。
async function fetchDriveFileMeta(path: string): Promise<Map<string, DriveFileMetaRow>> {
  const map = new Map<string, DriveFileMetaRow>()
  const { data, error } = await mustSupabase().from('drive_file_meta').select('*').eq('path', path)
  if (error) {
    console.warn('drive_file_meta の取得に失敗しました（テーブル未作成の可能性）:', error.message)
    return map
  }
  for (const row of data as DriveFileMetaRow[]) map.set(row.file_id, row)
  return map
}

export async function updateDriveFileMeta(
  path: string,
  fileId: string,
  patch: { category?: string; detail?: string; tags?: string[] },
  updatedBy: string,
): Promise<void> {
  const { error } = await mustSupabase()
    .from('drive_file_meta')
    .upsert({ file_id: fileId, path, ...patch, updated_by: updatedBy, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function fetchDriveFiles(path: string): Promise<DriveFileItem[]> {
  const folderId = driveFolderIds[path]
  if (!folderId || !isSupabaseConfigured) return mockDriveFiles[path] ?? []

  const [driveRes, metaMap] = await Promise.all([
    fetch(`${supabaseUrl}/functions/v1/drive-list?folderId=${encodeURIComponent(folderId)}`, {
      headers: {
        apikey: supabasePublishableKey!,
        Authorization: `Bearer ${supabasePublishableKey}`,
      },
    }),
    fetchDriveFileMeta(path),
  ])
  const data = await driveRes.json()
  if (!driveRes.ok) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))

  return (data.files as DriveApiFile[]).map((f) => {
    const meta = metaMap.get(f.id)
    return {
      id: f.id,
      name: f.name,
      type: MIME_TYPE_MAP[f.mimeType] ?? 'doc',
      updatedAt: f.modifiedTime,
      updatedBy: f.lastModifyingUser?.displayName ?? '不明',
      webViewLink: f.webViewLink,
      thumbnailLink: f.thumbnailLink,
      excerpt: f.excerpt,
      category: meta?.category ?? undefined,
      detail: meta?.detail ?? undefined,
      tags: meta?.tags ?? undefined,
    }
  })
}

export interface AppSheetData {
  sheetName: string
  headers: string[]
  records: Record<string, string>[]
}

// AppSheet連携テスト用のスプレッドシートID(検証用の個人テストシート)
const APPSHEET_TEST_SPREADSHEET_ID = '1VBsbj-HAxIPb3yVXi_9A3IzZ7nRnWKd7_ytX1dXjqJ4'

export async function fetchAppSheetTestData(): Promise<AppSheetData> {
  if (!isSupabaseConfigured) throw new Error('Supabaseが設定されていません')

  const url = `${supabaseUrl}/functions/v1/sheet-read?spreadsheetId=${encodeURIComponent(APPSHEET_TEST_SPREADSHEET_ID)}`
  const res = await fetch(url, {
    headers: {
      apikey: supabasePublishableKey!,
      Authorization: `Bearer ${supabasePublishableKey}`,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
  return data as AppSheetData
}

// freee会計連携（データ取込ページ用）
// クライアントよりfreeeとの連携方針がほぼ確定した(2026-08-18)ため、いつでも実API接続に
// 差し替えられるよう drive-list/sheet-read と同じ「単一窓口+設定フラグ」の形にしてある。
// 実装時にやること:
//   1. freee開発者コンソールでアプリを作成し、client_id/secretを発行
//   2. OAuth認可コードを受け取るリダイレクト先(このポータル or 専用ページ)を用意
//   3. Supabase Edge Function(例: freee-token-exchange, freee-transactions)を追加し、
//      認可コード→アクセストークン交換、トークンでの取引一覧取得をサーバー側で行う
//      (フロントにclient_secretを露出させないこと。drive-list/sheet-readと同じ設計方針)
//   4. isFreeeConfigured を true にし、下のダミー分岐を実際のEdge Function呼び出しに置き換える
const isFreeeConfigured = false

export async function connectToFreee(): Promise<{ companyName: string }> {
  if (!isFreeeConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return { companyName: MOCK_FREEE_COMPANY_NAME }
  }
  throw new Error('freee連携は未実装です')
}

export async function fetchFreeeTransactions(): Promise<FreeeTransaction[]> {
  if (!isFreeeConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    return mockFreeeTransactions
  }
  throw new Error('freee連携は未実装です')
}

// 取引先ごとの申し送り事項（Googleスプレッドシート連携）
// クライアントの要望により、担当者間の申し送り事項をスプレッドシートで管理し、
// 取引先詳細ページに表示する。drive-list/sheet-read/freee連携と同じ
// 「単一窓口+設定フラグ」の構造にしてあるので、実スプレッドシートが
// 用意でき次第すぐに切り替えられる。
// 実装時にやること:
//   1. クライアント側でスプレッドシートを作成（1行目の見出し: 取引先コード, 日付, 申し送り事項）
//   2. 前述のサービスアカウントに閲覧者権限で共有し、スプレッドシートIDを控える
//   3. HANDOVER_NOTES_SPREADSHEET_ID にそのIDを設定し、isHandoverNotesConfigured を true にする
//      (sheet-read Edge Functionをそのまま流用できるため、バックエンドの追加実装は不要)
// 作業のたびに申し送りが発生する前提のため、1取引先につき複数件(日付付き)を返す。
// 日付が新しい順に並べ替えて返す。
const isHandoverNotesConfigured = true
// クライアントが用意した「取引先ごとの申し送り事項」スプレッドシート(2026-08-19共有)
const HANDOVER_NOTES_SPREADSHEET_ID = '1MEl1gGQsdXcaPrOQVSmB_g6XfIFwt6fy3hYkjPaILqw'

function groupHandoverEntries(
  rows: { clientCode: string; date: string; note: string }[],
): Record<string, HandoverNoteEntry[]> {
  const map: Record<string, HandoverNoteEntry[]> = {}
  for (const { clientCode, date, note } of rows) {
    if (!clientCode) continue
    ;(map[clientCode] ??= []).push({ date, note })
  }
  for (const entries of Object.values(map)) {
    entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }
  return map
}

export async function fetchHandoverNotes(): Promise<Record<string, HandoverNoteEntry[]>> {
  if (!isHandoverNotesConfigured || !isSupabaseConfigured) {
    return groupHandoverEntries(mockHandoverNotes)
  }
  const url = `${supabaseUrl}/functions/v1/sheet-read?spreadsheetId=${encodeURIComponent(HANDOVER_NOTES_SPREADSHEET_ID)}`
  const res = await fetch(url, {
    headers: {
      apikey: supabasePublishableKey!,
      Authorization: `Bearer ${supabasePublishableKey}`,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))

  const records = data.records as Record<string, string>[]
  return groupHandoverEntries(
    records.map((r) => ({
      clientCode: r['取引先コード'],
      date: r['日付'] ?? '',
      note: r['申し送り事項'] ?? '',
    })),
  )
}

export async function fetchUsers(): Promise<UserRecord[]> {
  if (!isSupabaseConfigured) return initialUsers
  const { data, error } = await mustSupabase().from('portal_users').select('*').order('id', { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    department: row.department as Department | null,
    role: row.role as UserRole,
  }))
}
