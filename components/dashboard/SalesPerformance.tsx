interface SalesData {
  name:    string
  role:    string
  total:   number
  won:     number
  winRate: number
  revenue: number
}

interface Props {
  data: SalesData[]
}

const ROLE_LABEL: Record<string, string> = {
  SALES:     "Sales",
  MARKETING: "Marketing",
}

export default function SalesPerformance({ data }: Props) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
          Performa Tim Sales
        </h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["#", "Nama", "Role", "Total Leads", "Won", "Win Rate", "Revenue"].map((h) => (
              <th key={h} style={{
                padding: "10px 16px", textAlign: "left",
                fontSize: 11, fontWeight: 600, color: "#64748b",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={s.name} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
                {i + 1}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "#dbeafe", color: "#2563eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{s.name}</span>
                </div>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#ede9fe", color: "#7c3aed", fontWeight: 600 }}>
                  {ROLE_LABEL[s.role] ?? s.role}
                </span>
              </td>
              <td style={{ padding: "12px 16px", fontSize: 14, color: "#475569" }}>{s.total}</td>
              <td style={{ padding: "12px 16px", fontSize: 14, color: "#059669", fontWeight: 600 }}>{s.won}</td>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Progress bar */}
                  <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999, maxWidth: 80 }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      width:  `${s.winRate}%`,
                      background: s.winRate >= 60 ? "#10b981" : s.winRate >= 30 ? "#f59e0b" : "#ef4444",
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", minWidth: 36 }}>
                    {s.winRate}%
                  </span>
                </div>
              </td>
              <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency", currency: "IDR", notation: "compact",
                }).format(s.revenue)}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                Belum ada data performa
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}