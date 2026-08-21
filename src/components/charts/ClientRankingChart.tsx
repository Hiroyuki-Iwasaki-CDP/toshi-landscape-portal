import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatYen } from '../../lib/format'

interface ClientRankingChartProps {
  data: { label: string; amount: number }[]
}

export function ClientRankingChart({ data }: ClientRankingChartProps) {
  const height = Math.max(240, data.length * 34)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          stroke="#9ca3af"
          tickFormatter={(v: number) => `${Math.round(v / 10000).toLocaleString()}万`}
        />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" width={160} />
        <Tooltip formatter={(value) => formatYen(Number(value))} />
        <Bar dataKey="amount" name="売上" fill="#557578" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
