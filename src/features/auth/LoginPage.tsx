import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trees, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { googleAccounts, type GoogleAccount } from '../../data/googleAccounts'
import { ROLE_LABEL } from '../../types'

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.11H1.26a12 12 0 0 0 0 10.76l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleSelect(account: GoogleAccount) {
    login(account)
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
          {!pickerOpen ? (
            <>
              <p className="mb-4 text-sm font-semibold text-gray-600">
                会社のGoogleアカウントでログインしてください
              </p>
              <button
                onClick={() => setPickerOpen(true)}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <GoogleLogo />
                Googleでログイン
              </button>
              <p className="mt-3 text-xs text-gray-400">
                メールアドレスに応じて「管理者」「編集者」「一般社員」の権限が自動的に割り当てられます。
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setPickerOpen(false)}
                className="mb-4 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                戻る
              </button>
              <p className="mb-4 text-sm font-semibold text-gray-600">アカウントを選択（モック用ダミー）</p>
              <div className="space-y-2">
                {googleAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleSelect(account)}
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-brand-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {account.name.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-gray-800">{account.name}</span>
                      <span className="block truncate text-xs text-gray-500">{account.email}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-600 ring-1 ring-brand-200">
                      {ROLE_LABEL[account.role]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          ※本モックは実際のGoogle認証を行いません。ダミーアカウントの選択で権限別の表示を確認できます。
        </p>
      </div>
    </div>
  )
}
