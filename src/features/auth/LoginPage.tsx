import { useNavigate } from 'react-router-dom'
import { ShieldCheck, HardHat, Trees } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSelect(role: UserRole) {
    login(role)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Trees className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-brand-800 sm:text-2xl">株式会社トシ・ランドスケープ</h1>
          <p className="mt-1 text-sm text-gray-500">社内ポータル（モック）</p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-600">ログインする権限を選択してください</p>
          <div className="space-y-3">
            <button
              onClick={() => handleSelect('admin')}
              className="flex w-full items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-left transition-colors hover:bg-brand-100"
            >
              <ShieldCheck className="h-6 w-6 shrink-0 text-brand-600" />
              <span>
                <span className="block text-sm font-bold text-brand-800">管理者としてログイン</span>
                <span className="block text-xs text-gray-500">売上・実績など全ての情報を閲覧できます</span>
              </span>
            </button>

            <button
              onClick={() => handleSelect('staff')}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-left transition-colors hover:bg-gray-100"
            >
              <HardHat className="h-6 w-6 shrink-0 text-gray-600" />
              <span>
                <span className="block text-sm font-bold text-gray-700">現場社員としてログイン</span>
                <span className="block text-xs text-gray-500">売上等の機微情報は制限表示されます</span>
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          ※本モックはダミーデータのみで動作します。パスワード入力は不要です。
        </p>
      </div>
    </div>
  )
}
