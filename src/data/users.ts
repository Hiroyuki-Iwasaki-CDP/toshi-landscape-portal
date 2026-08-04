import type { Department, UserRole } from '../types'

export interface UserRecord {
  id: string
  name: string
  email: string
  department: Department | null
  role: UserRole
}

// ユーザー管理（ダミーデータ）
export const initialUsers: UserRecord[] = [
  { id: 'u01', name: '管理者 太郎', email: 'kanri@toshi-landscape.co.jp', department: null, role: 'admin' },
  { id: 'u02', name: '編集 花子', email: 'henshu@toshi-landscape.co.jp', department: 'TREE_RISK_ASSESSMENT', role: 'editor' },
  { id: 'u03', name: '現場 次郎', email: 'genba@toshi-landscape.co.jp', department: 'GREEN_MAINTENANCE', role: 'staff' },
  { id: 'u04', name: '山本 恵美', email: 'yamamoto@toshi-landscape.co.jp', department: 'LANDSCAPE_CONSULTING', role: 'editor' },
  { id: 'u05', name: '中村 悠斗', email: 'nakamura@toshi-landscape.co.jp', department: 'GREEN_MAINTENANCE', role: 'staff' },
  { id: 'u06', name: '小林 亮', email: 'kobayashi@toshi-landscape.co.jp', department: 'TREE_RISK_ASSESSMENT', role: 'staff' },
  { id: 'u07', name: '加藤 沙織', email: 'kato@toshi-landscape.co.jp', department: 'LANDSCAPE_CONSULTING', role: 'staff' },
]
