import { Bell, CalendarDays, MapPin, Clock } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { newsItems } from '../../data/news'
import { scheduleItems } from '../../data/schedule'
import { formatDateJa } from '../../lib/format'

export function CompanyNewsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-brand-800 sm:text-xl">お知らせ</h1>
      <Card>
        <ul className="divide-y divide-brand-50">
          {newsItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="gray">{item.category}</Badge>
                  <span className="text-xs text-gray-400">{formatDateJa(item.date)}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-700">{item.title}</p>
                <p className="mt-1 text-sm text-gray-500">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function CompanySchedulePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-brand-800 sm:text-xl">スケジュール</h1>
      <Card>
        <ul className="divide-y divide-brand-50">
          {scheduleItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-700">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateJa(item.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {item.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
