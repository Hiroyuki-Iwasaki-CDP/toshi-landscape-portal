import { useEffect, useState } from 'react'
import { ShieldAlert, Users } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PageHeaderBanner } from '../../components/ui/PageHeaderBanner'
import { useAuth } from '../../context/AuthContext'
import { fetchUsers } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import type { UserRecord } from '../../data/users'
import { DEPARTMENT_LABEL, ROLE_LABEL, type UserRole } from '../../types'

const ROLE_BADGE_COLOR: Record<UserRole, 'brand' | 'amber' | 'gray'> = {
  admin: 'brand',
  editor: 'amber',
  staff: 'gray',
}

export function UserManagementPage() {
  const { role } = useAuth()
  const { data: fetchedUsers, loading, error } = useAsyncData(fetchUsers, [])
  const [users, setUsers] = useState<UserRecord[]>([])

  useEffect(() => {
    if (fetchedUsers) setUsers(fetchedUsers)
  }, [fetchedUsers])

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-16 text-center">
        <ShieldAlert className="mb-4 h-10 w-10 text-brand-300" />
        <h1 className="text-lg font-bold text-gray-700 sm:text-xl">アクセス権限がありません</h1>
        <p className="mt-2 text-sm text-gray-400">ユーザー管理は管理者権限でログインした場合のみ閲覧できます。</p>
      </div>
    )
  }

  function handleRoleChange(userId: string, nextRole: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)))
  }

  return (
    <div className="space-y-4">
      <PageHeaderBanner
        icon={Users}
        eyebrow="COMPANY"
        title="ユーザー管理"
        description="メールアドレスに紐づく権限を管理します（変更はこの画面の表示のみに反映されます。書き込みは未対応です）"
      />

      <Card>
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-400">読み込み中…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">データの取得に失敗しました: {error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-xs text-gray-400">
                  <th className="py-2 pr-4 font-semibold">氏名</th>
                  <th className="py-2 pr-4 font-semibold">メールアドレス</th>
                  <th className="py-2 pr-4 font-semibold">所属部門</th>
                  <th className="py-2 pr-4 font-semibold">権限</th>
                  <th className="py-2 font-semibold">変更</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4 font-medium text-gray-700">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.department ? DEPARTMENT_LABEL[u.department] : '全社'}</td>
                    <td className="py-3 pr-4">
                      <Badge color={ROLE_BADGE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                    </td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="rounded-lg border border-brand-200 px-2 py-1 text-xs"
                      >
                        {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
