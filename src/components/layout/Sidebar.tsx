import { NavLink } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { navCategories } from './NavConfig'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABEL } from '../../types'

export function Sidebar() {
  const { role, displayName, logout } = useAuth()

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-brand-100 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-brand-100 px-6 py-5">
        <LayoutDashboard className="h-6 w-6 text-brand-600" />
        <div>
          <p className="text-sm font-bold leading-tight text-brand-800">トシ・ランドスケープ</p>
          <p className="text-xs text-gray-400">社内ポータル（モック）</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navCategories.map((category) => (
          <div key={category.key} className="mb-5">
            <p className="mb-1.5 px-3 text-xs font-bold tracking-wide text-brand-400">{category.label}</p>
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
                          ? 'bg-brand-600 font-semibold text-white'
                          : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
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

      <div className="border-t border-brand-100 px-4 py-4">
        <p className="px-2 text-xs text-gray-400">ログイン中</p>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-semibold text-brand-800">
            {displayName}（{role ? ROLE_LABEL[role] : ''}）
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-brand-50 hover:text-brand-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            切替
          </button>
        </div>
      </div>
    </aside>
  )
}
