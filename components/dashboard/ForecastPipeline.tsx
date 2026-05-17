const STATUS_LABEL: Record<string, string> = {
  APPROACH:          "Lead Masuk",
  COLD_LEAD:     "Dihubungi",
  NEEDS_IDENTIFIED: "Kebutuhan",
  DECK_REQUEST:    "Proposal",
  MEETING:      "Negosiasi",
  CONTRACT_SENT:    "Kontrak Dikirim",
}

const STATUS_COLOR: Record<string, string> = {
  APPROACH:          "#6366f1",
  COLD_LEAD:     "#3b82f6",
  NEEDS_IDENTIFIED: "#0ea5e9",
  DECK_REQUEST:    "#f59e0b",
  MEETING:      "#f97316",
  CONTRACT_SENT:    "#8b5cf6",
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   "#ef4444",
  MEDIUM: "#f59e0b",
  LOW:    "#10b981",
}

interface ForecastLead {
  id:            string
  title:         string
  status:        string
  value:         number
  probability:   number
  weightedValue: number
  priority:      string
  assignedTo:    string
}

interface Props {
  leads: ForecastLead[]
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value)
}

export default function ForecastPipeline({ leads }: Props) {
  return (
    <div style={{
      background:   "var(--bg-card)",
      borderRadius: 12,
      border:       "1px solid var(--border)",
      overflow:     "hidden",
    }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
          Pipeline Forecast (Top 10)
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
          Diurutkan berdasarkan weighted value tertinggi
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-card)" }}>
              {["Judul Lead", "Status", "Prioritas", "Nilai", "Probabilitas", "Weighted Value", "PIC"].map((h) => (
                <th key={h} style={{
                  padding:       "10px 16px",
                  textAlign:     "left",
                  fontSize:      11,
                  fontWeight:    600,
                  color:         "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace:    "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr key={lead.id} style={{
                borderTop:  "1px solid #f1f5f9",
                background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-card)",
              }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)", maxWidth: 200 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lead.title}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize:     11,
                    fontWeight:   600,
                    padding:      "3px 8px",
                    borderRadius: 999,
                    background:   (STATUS_COLOR[lead.status] ?? "#94a3b8") + "20",
                    color:        STATUS_COLOR[lead.status] ?? "#94a3b8",
                    whiteSpace:   "nowrap",
                  }}>
                    {STATUS_LABEL[lead.status] ?? lead.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize:     11,
                    fontWeight:   600,
                    padding:      "3px 8px",
                    borderRadius: 999,
                    background:   (PRIORITY_COLOR[lead.priority] ?? "#94a3b8") + "20",
                    color:        PRIORITY_COLOR[lead.priority] ?? "#94a3b8",
                  }}>
                    {lead.priority}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text)", whiteSpace: "nowrap" }}>
                  {formatRupiah(lead.value)}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg-card)", borderRadius: 999, minWidth: 60 }}>
                      <div style={{
                        height:     "100%",
                        borderRadius: 999,
                        width:      `${lead.probability}%`,
                        background: lead.probability >= 65
                          ? "#10b981"
                          : lead.probability >= 30
                          ? "#f59e0b"
                          : "#6366f1",
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", minWidth: 32 }}>
                      {lead.probability}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#059669", whiteSpace: "nowrap" }}>
                  {formatRupiah(lead.weightedValue)}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>
                  {lead.assignedTo}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                  Tidak ada leads aktif dengan nilai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}