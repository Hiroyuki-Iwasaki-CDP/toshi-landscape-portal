// 社内ポータル モックで使用する型定義

/** ログインユーザーの権限ロール（管理者・編集者・一般社員の3段階） */
export type UserRole = 'admin' | 'editor' | 'staff'

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: '管理者',
  editor: '編集者',
  staff: '一般社員',
}

/** 3部門の識別子 */
export type Department =
  | 'GREEN_MAINTENANCE'
  | 'TREE_RISK_ASSESSMENT'
  | 'LANDSCAPE_CONSULTING'

export const DEPARTMENT_LABEL: Record<Department, string> = {
  GREEN_MAINTENANCE: 'GREEN MAINTENANCE',
  TREE_RISK_ASSESSMENT: 'TREE RISK ASSESSMENT',
  LANDSCAPE_CONSULTING: 'LANDSCAPE CONSULTING',
}

export const DEPARTMENTS: Department[] = [
  'GREEN_MAINTENANCE',
  'TREE_RISK_ASSESSMENT',
  'LANDSCAPE_CONSULTING',
]

/** 取引先マスタ */
export interface Client {
  id: string
  code: string
  name: string
  industry: string
  contactPerson: string
  address: string
  contractStartDate: string // YYYY-MM-DD
  phone: string
}

/** 売上データ（取引先×部門×年月） */
export interface SalesRecord {
  clientId: string
  department: Department
  yearMonth: string // YYYY-MM
  fiscalYear: number
  amount: number // 円
  manDays: number // 人工
  wasteKg: number // ごみ量(kg)
}

/** 完了報告 */
export interface CompletionReport {
  id: string
  siteName: string
  clientId: string
  department: Department
  staffName: string
  manDays: number
  wasteKg: number
  workDate: string // YYYY-MM-DD
  summary: string
}

/** お知らせ */
export interface NewsItem {
  id: string
  date: string // YYYY-MM-DD
  category: string
  title: string
  body: string
}

/** スケジュール */
export interface ScheduleItem {
  id: string
  date: string // YYYY-MM-DD
  time: string
  title: string
  location: string
}
