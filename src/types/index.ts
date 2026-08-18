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

/** 取引先の状態 */
export type ClientStatus = 'active' | 'paused' | 'ended'

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: '稼働中',
  paused: '休止',
  ended: '終了',
}

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
  /** 主管部門（実績データ取込時、CSVに部門列がなくてもこの値で部門を補完する） */
  department: Department
  status: ClientStatus
}

/** 取引先の別名（税理士CSV等での表記ゆれを吸収する名寄せ辞書） */
export interface ClientAlias {
  id: string
  alias: string
  clientId: string
  createdAt: string // YYYY-MM-DD
  createdBy: string
}

/** 契約種別（年間契約による継続売上か、単発のスポット売上か） */
export type ContractType = 'annual' | 'spot'

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  annual: '年間契約',
  spot: 'スポット',
}

/** 売上データ（取引先×部門×年月×契約種別） */
export interface SalesRecord {
  clientId: string
  department: Department
  yearMonth: string // YYYY-MM
  fiscalYear: number
  contractType: ContractType
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
