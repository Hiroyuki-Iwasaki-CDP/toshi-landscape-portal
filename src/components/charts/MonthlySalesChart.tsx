import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatYen } from '../../lib/format'

interface MonthlySalesChartProps {
  data: { label: string; annual: number; spot: number }[]
}

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="#9ca3af"
          tickFormatter={(v: number) => `${Math.round(v / 10000).toLocaleString()}万`}
          width={56}
        />
        <Tooltip formatter={(value) => formatYen(Number(value))} labelStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="annual" name="年間契約" stackId="sales" fill="#2e6b5e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="spot" name="スポット" stackId="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
