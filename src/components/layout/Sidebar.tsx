import { Link, NavLink } from 'react-router-dom'
import { LogOut, Home } from 'lucide-react'
import { navCategories } from './NavConfig'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABEL } from '../../types'
import toshiLogoWhite from '../../assets/toshi-logo-white.png'

export function Sidebar() {
  const { role, displayName, logout } = useAuth()

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col bg-brand-600 md:flex">
      <Link
        to="/"
        className="flex flex-col items-start gap-1 border-b border-white/10 px-6 py-5 transition-colors hover:bg-white/5"
      >
        <img src={toshiLogoWhite} alt="トシ・ランドスケープ" className="h-14 w-auto" />
        <p className="text-xs text-brand-300">社内ポータル（モック）</p>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-white/5'
              }`
            }
          >
            <Home className="h-4 w-4" />
            ホーム
          </NavLink>
        </div>

        {navCategories.map((category) => (
          <div key={category.key} className="mb-5">
            <p className="mb-1.5 px-3 text-xs font-bold tracking-wide text-brand-300">{category.label}</p>
            <ul className="space-y-0.5">
              {category.items
                .filter((item) => !item.adminOnly || role === 'admin')
                .map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm transition-colors ${
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

      <div className="border-t border-white/10 px-4 py-4">
        <p className="px-2 text-xs text-brand-300">ログイン中</p>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-semibold text-white">
            {displayName}（{role ? ROLE_LABEL[role] : ''}）
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-brand-200 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            切替
          </button>
        </div>
      </div>
    </aside>
  )
}
