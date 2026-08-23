import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import leafBranch from '../../assets/leaf-branch.png'

interface PageHeaderBannerProps {
  icon: LucideIcon
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeaderBanner({ icon: Icon, eyebrow, title, description, actions }: PageHeaderBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-600 p-5 text-white shadow-sm sm:p-6">
      <img
        src={leafBranch}
        alt=""
        className="pointer-events-none absolute right-0 bottom-0 opacity-70 mix-blend-screen"
        style={{ height: '110px', width: 'auto' }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/30">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            {eyebrow && <p className="text-xs font-semibold tracking-wide text-brand-200">{eyebrow}</p>}
            <h1 className={`text-lg font-bold sm:text-xl ${eyebrow ? 'mt-0.5' : ''}`}>{title}</h1>
            {description && <p className="mt-1 text-sm text-brand-100">{description}</p>}
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
