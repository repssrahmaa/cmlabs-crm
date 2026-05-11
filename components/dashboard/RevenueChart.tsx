"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  historical: { month: string; revenue: number; type: "actual" }[];
  projections: { month: string; revenue: number; type: "projected" }[];
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value)
}

export default function RevenueChart({ historical, projections }: Props) {
  // Combine historical and projected data
 const data = [...historical, ...projections];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(v) => formatRupiah(v)}
          />
          <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
          formatter={(value, name) => {
            if (typeof value !== 'number') return null;
            return [formatRupiah(value), name];
          }}
        />
            <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
            dot={{ r: 4, fill: "#2563eb" }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}