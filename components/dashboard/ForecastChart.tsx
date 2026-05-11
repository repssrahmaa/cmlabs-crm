"use client"

import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts"

interface DataPoint {
  month:   string
  revenue: number
  type:    "actual" | "projected"
}

interface Props {
  historical:  DataPoint[]
  projections: DataPoint[]
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value)
}

export default function ForecastChart({ historical, projections }: Props) {
  // Gabungkan data aktual + proyeksi
  const allData = [
    ...historical.map((d) => ({
      month:    d.month,
      aktual:   d.revenue,
      proyeksi: null as number | null,
    })),
    ...projections.map((d) => ({
      month:    d.month,
      aktual:   null as number | null,
      proyeksi: d.revenue,
    })),
  ]

  const dividerMonth = historical[historical.length - 1]?.month

  return (
    <div style={{
      background:   "#fff",
      borderRadius: 12,
      padding:      24,
      border:       "1px solid #e2e8f0",
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
          Revenue Aktual vs Proyeksi
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
          6 bulan historis + 3 bulan proyeksi ke depan
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={allData} margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
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
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
            formatter={(val) => val === "aktual" ? "Revenue Aktual" : "Proyeksi"}
          />
          {dividerMonth && (
            <ReferenceLine
              x={dividerMonth}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: "Sekarang", position: "top", fontSize: 11, fill: "#94a3b8" }}
            />
          )}
          <Bar
            dataKey="aktual"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.85}
          />
          <Line
            type="monotone"
            dataKey="proyeksi"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}