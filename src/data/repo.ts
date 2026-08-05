// データ取得の単一窓口。Supabase接続時は実データ、未接続時はダミーデータを返す。
import { supabase, isSupabaseConfigured, supabaseUrl, supabasePublishableKey } from '../lib/supabaseClient'
import type { Client, Department, NewsItem, SalesRecord, ScheduleItem, UserRole } from '../types'
import type { UserRecord } from './users'
import { newsItems } from './news'
import { scheduleItems } from './schedule'
import { clients as mockClients } from './clients'
import { salesRecords as mockSalesRecords } from './sales'
import { initialUsers } from './users'
import { driveFiles as mockDriveFiles, type DriveFileItem, type DriveFileType } from './driveFiles'
import { driveFolderIds } from './driveFolderIds'

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
  }))
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
