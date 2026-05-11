interface Props {
  label:    string
  value:    string | number
  sub?:     string
  color:    string
  bg:       string
  trend?:   "up" | "down" | "neutral"
}

export default function KpiCard({ label, value, sub, color, bg, trend }: Props) {
  return (
    <div style={{
      background:   "#fff",
      borderRadius: 12,
      padding:      20,
      border:       "1px solid #e2e8f0",
      borderTop:    `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
          {sub}
        </div>
      )}
      {trend && (
        <div style={{
          marginTop:  8,
          fontSize:   12,
          fontWeight: 600,
          color:      trend === "up" ? "#059669" : trend === "down" ? "#dc2626" : "#94a3b8",
        }}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "─"} {trend === "neutral" ? "Stabil" : trend === "up" ? "Naik" : "Turun"}
        </div>
      )}
    </div>
  )
}