import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatYen } from '../../lib/format'

interface MonthlySalesChartProps {
  data: { label: string; amount: number }[]
}

export function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="#9ca3af"
          tickFormatter={(v: number) => `${Math.round(v / 10000).toLocaleString()}万`}
          width={56}
        />
        <Tooltip formatter={(value) => formatYen(Number(value))} labelStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="amount" name="売上" stroke="#2e6b5e" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
