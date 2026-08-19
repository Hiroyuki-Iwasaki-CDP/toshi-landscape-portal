import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { formatYen } from '../../lib/format'

const COLORS = ['#2e6b5e', '#82b8a7', '#c9a227']

interface DeptShareChartProps {
  data: { label: string; amount: number }[]
}

export function DeptShareChart({ data }: DeptShareChartProps) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <PieChart margin={{ top: 60, right: 32, bottom: 16, left: 32 }}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={100}
          isAnimationActive={false}
          fontSize={11}
          label={(entry) => `${(((entry.percent as number) ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatYen(Number(value))} />
        <Legend wrapperStyle={{ paddingTop: 20, lineHeight: '1.8em', fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
