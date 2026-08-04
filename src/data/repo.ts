// データ取得の単一窓口。Supabase接続時は実データ、未接続時はダミーデータを返す。
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { Client, Department, NewsItem, SalesRecord, ScheduleItem, UserRole } from '../types'
import type { UserRecord } from './users'
import { newsItems } from './news'
import { scheduleItems } from './schedule'
import { clients as mockClients } from './clients'
import { salesRecords as mockSalesRecords } from './sales'
import { initialUsers } from './users'

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
