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
      background:   "var(--bg-card)",
      borderRadius: 12,
      padding:      20,
      border:       "1px solid var(--border)",
      borderTop:    `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
          {sub}
        </div>
      )}
      {trend && (
        <div style={{
          marginTop:  8,
          fontSize:   12,
          fontWeight: 600,
          color:      trend === "up" ? "var(--success)" : trend === "down" ? "var(--error)" : "var(--text-muted)",
        }}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "─"} {trend === "neutral" ? "Stabil" : trend === "up" ? "Naik" : "Turun"}
        </div>
      )}
    </div>
  )
}