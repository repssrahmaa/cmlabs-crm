"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"

interface Props {
  data: { month: string; created: number; won: number }[]
}
export default function MonthlyLeadsChart({ data }: Props)  {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
        Leads Bulanan
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
            formatter={(value) => {
  if (typeof value !== 'number') return null;
  return [
    String(value),
    typeof name === 'string' && name === "created" ? "Created" : "Won",
  ];
}}
          />
          <Bar dataKey="created" name="Created" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="won" name="Won" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
