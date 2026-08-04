import type { UserRole } from '../types'

/** Googleログインのモック用ダミーアカウント（メールアドレスのドメイン/ローカル部で権限を自動判定する想定） */
export interface GoogleAccount {
  email: string
  name: string
  role: UserRole
}

export const googleAccounts: GoogleAccount[] = [
  { email: 'kanri@toshi-landscape.co.jp', name: '管理者 太郎', role: 'admin' },
  { email: 'henshu@toshi-landscape.co.jp', name: '編集 花子', role: 'editor' },
  { email: 'genba@toshi-landscape.co.jp', name: '現場 次郎', role: 'staff' },
]
