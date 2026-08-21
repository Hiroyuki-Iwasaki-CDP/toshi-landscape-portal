import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, Home } from 'lucide-react'
import { navCategories } from './NavConfig'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABEL } from '../../types'

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const { role, displayName, logout } = useAuth()
  const location = useLocation()

  // ブラウザの戻る/進む操作でパスが変わった場合もメニューを閉じる
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3">
        <Link to="/" className="text-sm font-bold text-brand-800">
          トシ・ランドスケープ
        </Link>
        <button
          aria-label="メニューを開く"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-brand-700 hover:bg-brand-50"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative flex w-[85%] max-w-sm flex-col overflow-y-auto bg-brand-600 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-white">{displayName}としてログイン中</p>
                <p className="text-xs text-brand-300">役割: {role ? ROLE_LABEL[role] : ''}</p>
              </div>
              <button
                aria-label="メニューを閉じる"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-brand-200 hover:bg-white/5"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3">
              <div className="mb-4">
                <NavLink
                  to="/"
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      isActive ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-white/5'
                    }`
                  }
                >
                  <Home className="h-4 w-4" />
                  ホーム
                </NavLink>
              </div>

              {navCategories.map((category) => (
                <div key={category.key} className="mb-4">
                  <p className="mb-1.5 px-3 text-xs font-bold tracking-wide text-brand-300">{category.label}</p>
                  <ul className="space-y-0.5">
                    {category.items
                      .filter((item) => !item.adminOnly || role === 'admin')
                      .map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-lg px-3 py-2.5 text-sm ${
                              isActive
                                ? 'bg-brand-800 font-semibold text-white'
                                : 'text-brand-100/80 hover:bg-white/5 hover:text-white'
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-white/10 px-4 py-3">
              <button
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <LogOut className="h-4 w-4" />
                ログインを切り替える
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
