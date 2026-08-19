import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatYen } from '../../lib/format'

interface MonthlySalesChartProps {
  data: { label: string; annual: number; spot: number }[]
  /** 'total': 合計のみ1本の折れ線 / 'breakdown': 年間契約・スポットを2本の折れ線で内訳表示 */
  mode: 'total' | 'breakdown'
}

export function MonthlySalesChart({ data, mode }: MonthlySalesChartProps) {
  const chartData: { label: string; annual?: number; spot?: number; total?: number }[] =
    mode === 'total' ? data.map((d) => ({ label: d.label, total: d.annual + d.spot })) : data

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
        {mode === 'total' ? (
          <Line type="monotone" dataKey="total" name="売上合計" stroke="#2e6b5e" strokeWidth={2.5} dot={{ r: 3 }} />
        ) : (
          <>
            <Line type="monotone" dataKey="annual" name="年間契約" stroke="#2e6b5e" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="spot" name="スポット" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
