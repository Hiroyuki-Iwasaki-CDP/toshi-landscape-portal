import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { formatYen } from '../../lib/format'

const COLORS = ['#2e6b5e', '#82b8a7', '#c9a227']

interface DeptShareChartProps {
  data: { label: string; amount: number }[]
}

export function DeptShareChart({ data }: DeptShareChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => {
            const payload = entry.payload as { label: string } | undefined
            return `${payload?.label ?? ''} ${(((entry.percent as number) ?? 0) * 100).toFixed(0)}%`
          }}
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatYen(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
