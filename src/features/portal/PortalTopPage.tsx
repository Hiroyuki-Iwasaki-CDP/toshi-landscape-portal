import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, Leaf, ShieldAlert, Mountain, ArrowRight, Bell, Target, ShieldCheck, TrendingUp, Award } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LeafDecoration } from '../../components/ui/LeafDecoration'
import { navCategories } from '../../components/layout/NavConfig'
import { fetchNews } from '../../data/repo'
import { useAsyncData } from '../../lib/useAsyncData'
import { companyCreed, companyMission, goals2026 } from '../../data/company'
import { formatDateJa } from '../../lib/format'
import { newsCategoryColor } from '../../lib/newsCategory'
import { useAuth } from '../../context/AuthContext'

const CATEGORY_ICON: Record<string, ComponentType<{ className?: string }>> = {
  company: Building2,
  customer: Users,
  'green-maintenance': Leaf,
  'tree-risk': ShieldAlert,
  'landscape-consulting': Mountain,
}

const GOAL_ICONS = [ShieldCheck, TrendingUp, Award]

const CATEGORY_LINK: Record<string, string> = {
  company: '/company/news',
  customer: '/clients',
  'green-maintenance': '/green-maintenance/manual',
  'tree-risk': '/tree-risk/manual',
  'landscape-consulting': '/landscape-consulting/manual',
}

export function PortalTopPage() {
  const { displayName } = useAuth()
  const { data: newsItems, loading: newsLoading } = useAsyncData(fetchNews, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-400">おかえりなさい</p>
        <h1 className="text-xl font-bold text-brand-800 sm:text-2xl">{displayName} さん</h1>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-5 text-white shadow-sm sm:p-6">
        <LeafDecoration className="pointer-events-none absolute -right-6 -top-10 h-64 w-64 text-white" />

        <div className="relative">
          <p className="text-xs font-semibold tracking-wide text-brand-200">社是</p>
          <p className="mt-1 text-lg font-bold sm:text-xl">{companyCreed}</p>
          <p className="mt-2 text-sm text-brand-100">{companyMission}</p>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-brand-200">
              <Target className="h-3.5 w-3.5" />
              2026年の目標
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {goals2026.map((goal, i) => {
                const GoalIcon = GOAL_ICONS[i % GOAL_ICONS.length]
                return (
                  <li key={goal.label} className="flex items-start gap-2.5 rounded-xl bg-white/10 px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <GoalIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{goal.label}</p>
                      <p className="mt-0.5 text-xs text-brand-100">{goal.detail}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {navCategories.map((category) => {
          const Icon = CATEGORY_ICON[category.key] ?? Building2
          return (
            <Link
              key={category.key}
              to={CATEGORY_LINK[category.key] ?? '/'}
              className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand-800">{category.label}</p>
                <p className="truncate text-xs text-gray-400">{category.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-200 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" />
            </Link>
          )
        })}
      </div>

      <Card
        title="お知らせ"
        actions={
          <Link to="/company/news" className="text-xs font-semibold text-brand-600 hover:underline">
            すべて見る
          </Link>
        }
      >
        {newsLoading ? (
          <p className="py-4 text-center text-sm text-gray-400">読み込み中…</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {(newsItems ?? []).slice(0, 4).map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color={newsCategoryColor(item.category)}>{item.category}</Badge>
                    <span className="text-xs text-gray-400">{formatDateJa(item.date)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-700">{item.title}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
