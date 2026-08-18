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
import { mockHandoverNotes } from './handoverNotesMock'

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
    department: row.department as Department,
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
  const { data, error } = await mustSupabase().from('sales_records').select('*')
  if (error) throw error
  return data.map((row) => ({
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

export async function fetchDriveFiles(path: string): Promise<DriveFileItem[]> {
  const folderId = driveFolderIds[path]
  if (!folderId || !isSupabaseConfigured) return mockDriveFiles[path] ?? []

  const url = `${supabaseUrl}/functions/v1/drive-list?folderId=${encodeURIComponent(folderId)}`
  const res = await fetch(url, {
    headers: {
      apikey: supabasePublishableKey!,
      Authorization: `Bearer ${supabasePublishableKey}`,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))

  return (data.files as DriveApiFile[]).map((f) => ({
    id: f.id,
    name: f.name,
    type: MIME_TYPE_MAP[f.mimeType] ?? 'doc',
    updatedAt: f.modifiedTime,
    updatedBy: f.lastModifyingUser?.displayName ?? '不明',
    webViewLink: f.webViewLink,
    thumbnailLink: f.thumbnailLink,
    excerpt: f.excerpt,
  }))
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
//   1. クライアント側でスプレッドシートを作成（1行目の見出し: 取引先コード, 申し送り事項）
//   2. 前述のサービスアカウントに閲覧者権限で共有し、スプレッドシートIDを控える
//   3. HANDOVER_NOTES_SPREADSHEET_ID にそのIDを設定し、isHandoverNotesConfigured を true にする
//      (sheet-read Edge Functionをそのまま流用できるため、バックエンドの追加実装は不要)
const isHandoverNotesConfigured = true
// クライアントが用意した「取引先ごとの申し送り事項」スプレッドシート(2026-08-19共有)
const HANDOVER_NOTES_SPREADSHEET_ID = '1MEl1gGQsdXcaPrOQVSmB_g6XfIFwt6fy3hYkjPaILqw'

export async function fetchHandoverNotes(): Promise<Record<string, string>> {
  if (!isHandoverNotesConfigured || !isSupabaseConfigured) {
    return Object.fromEntries(mockHandoverNotes.map((n) => [n.clientCode, n.note]))
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
  const map: Record<string, string> = {}
  for (const r of records) {
    const code = r['取引先コード']
    if (code) map[code] = r['申し送り事項'] ?? ''
  }
  return map
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
