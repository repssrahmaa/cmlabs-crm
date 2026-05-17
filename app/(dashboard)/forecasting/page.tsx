"use client"

import { useState, useEffect, useCallback } from "react"
import { useRealtimeDashboard }             from "@/hooks/useRealtimeDashboard"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { STATUS_COLOR, STATUS_LABEL }       from "@/types/lead"

function formatRp(v: number, full = false) {
  if (full) return `Rp ${v.toLocaleString("id-ID")}`
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

// ── Probability Badge ──────────────────────────────────────────
function ProbBadge({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{
      display:      "inline-flex", alignItems: "center", gap: 4,
      padding:      "3px 10px", borderRadius: 999,
      background:   color + "18",
      border:       `1px solid ${color}35`,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
    </div>
  )
}

// ── Lead Detail Modal ──────────────────────────────────────────
function LeadCalcModal({ lead, onClose }: { lead: any; onClose: () => void }) {
  const color = STATUS_COLOR[lead.status as keyof typeof STATUS_COLOR] ?? "#94a3b8"

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", zIndex: 200,
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   "var(--bg-card)",
          borderRadius: 16, padding: 28,
          width: "100%", maxWidth: 480,
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
          animation: "scaleIn .2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Detail Perhitungan Forecast
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
              {lead.title}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>
            &times;
          </button>
        </div>

        {/* Client info */}
        <div style={{ padding: "12px 16px", background: "var(--bg-card2)", borderRadius: 10, marginBottom: 16, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Informasi Lead</div>
          {[
            { l: "Client",    v: lead.clientName + (lead.clientCompany ? ` (${lead.clientCompany})` : "") },
            { l: "PIC Sales", v: lead.assignedTo },
            { l: "Status",    v: STATUS_LABEL[lead.status as keyof typeof STATUS_LABEL] ?? lead.status },
          ].map((r) => (
            <div key={r.l} style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", width: 70, flexShrink: 0 }}>{r.l}</span>
              <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* Calculation breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            Rincian Perhitungan
          </div>

          {/* Nilai Lead */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", background: "var(--bg-card2)",
            borderRadius: 8, border: "1px solid var(--border)",
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Nilai Lead</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Estimasi nilai kontrak yang diinput</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
              {formatRp(lead.value, true)}
            </div>
          </div>

          {/* Simbol kali */}
          <div style={{ textAlign: "center", fontSize: 16, color: "var(--text-muted)", fontWeight: 700 }}>×</div>

          {/* Probabilitas */}
          <div style={{
            padding: "12px 14px", background: color + "10",
            borderRadius: 8, border: `1px solid ${color}30`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color }}>
                  Probabilitas — {STATUS_LABEL[lead.status as keyof typeof STATUS_LABEL] ?? lead.status}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5, maxWidth: 280 }}>
                  {lead.calculation.explanation}
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color, flexShrink: 0, marginLeft: 12 }}>
                {lead.probability}%
              </div>
            </div>
            {/* Progress bar probabilitas */}
            <div style={{ marginTop: 10, height: 6, background: "var(--bg-card)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999, width: `${lead.probability}%`,
                background: color, transition: "width 0.6s ease",
              }} />
            </div>
          </div>

          {/* Simbol sama dengan */}
          <div style={{ textAlign: "center", fontSize: 16, color: "var(--text-muted)", fontWeight: 700 }}>=</div>

          {/* Weighted Value */}
          <div style={{
            padding:    "14px 16px",
            background: "linear-gradient(135deg, var(--primary-pale), var(--bg-card2))",
            borderRadius: 10, border: "1px solid var(--primary-glow)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Weighted Forecast Value
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>
              {formatRp(lead.weightedValue, true)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Formula: {lead.calculation.formula} = {lead.calculation.weightedFormatted}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ProbBadge pct={lead.probability} color={color} />
        </div>
      </div>
      <style>{`@keyframes scaleIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function ForecastingPage() {
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [filterYear, setFilterYear]     = useState(String(new Date().getFullYear()))
  const [filterMonth, setFilterMonth]   = useState(String(new Date().getMonth() + 1))
  const [showGuide, setShowGuide]       = useState(false)
  const [statusFilter, setStatusFilter] = useState("ALL")

  const fetchForecast = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        period: filterPeriod,
        year:   filterYear,
        ...(filterPeriod === "month" ? { month: filterMonth } : {}),
      })
      const res = await fetch(`/api/dashboard/forecast?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Gagal memuat data")
      setData(await res.json())
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterPeriod, filterYear, filterMonth])

  useEffect(() => { fetchForecast() }, [fetchForecast])
  const { connected } = useRealtimeDashboard({ onForecastRefresh: fetchForecast, onLeadChange: fetchForecast })

  const years  = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !data) return (
    <div style={{ padding: 20, background: "var(--danger-pale)", borderRadius: 12, color: "var(--danger)" }}>
      {error} <button onClick={fetchForecast} style={{ marginLeft: 10, padding: "5px 12px", background: "var(--bg-card)", border: "1px solid var(--danger)", borderRadius: 6, cursor: "pointer", color: "var(--danger)" }}>Coba lagi</button>
    </div>
  )

  const { summary, leads, forecastByStatus, monthlyHistory, probabilityGuide } = data

  const filteredLeads = statusFilter === "ALL"
    ? leads
    : leads.filter((l: any) => l.status === statusFilter)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header + Filter ─────────────────────────────── */}
      <div style={{
        background:   "linear-gradient(135deg, var(--hero-from,#0f172a), var(--hero-mid,#1e293b), var(--hero-to,#1e3a5f))",
        borderRadius: 20, padding: "22px 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"#4B9EF3", opacity:0.07, pointerEvents:"none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>Dashboard Forecasting</h2>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Proyeksi revenue berdasarkan seluruh history pipeline</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#34d399" : "#fbbf24" }} />
              <span style={{ fontSize: 12, color: connected ? "#34d399" : "#fbbf24", fontWeight: 600 }}>{connected ? "Live" : "Offline"}</span>
              <button onClick={fetchForecast} style={{ padding: "4px 10px", background: "rgba(75,158,243,0.2)", border: "1px solid rgba(75,158,243,0.3)", borderRadius: 6, color: "#93c5fd", fontSize: 11, cursor: "pointer" }}>Refresh</button>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Period */}
            {[
              { v: "all",   l: "Semua" },
              { v: "year",  l: "Per Tahun" },
              { v: "month", l: "Per Bulan" },
            ].map((p) => (
              <button key={p.v} onClick={() => setFilterPeriod(p.v)} style={{
                padding: "5px 14px",
                background: filterPeriod === p.v ? "#4B9EF3" : "rgba(255,255,255,0.08)",
                border: `1px solid ${filterPeriod === p.v ? "#4B9EF3" : "rgba(255,255,255,0.15)"}`,
                borderRadius: 999, fontSize: 11, fontWeight: 600,
                color: filterPeriod === p.v ? "#fff" : "rgba(255,255,255,0.6)",
                cursor: "pointer",
              }}>
                {p.l}
              </button>
            ))}

            {/* Year selector */}
            {filterPeriod !== "all" && (
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{
                padding: "5px 10px", background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999,
                fontSize: 11, color: "#fff", cursor: "pointer",
              }}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            )}

            {/* Month selector */}
            {filterPeriod === "month" && (
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{
                padding: "5px 10px", background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999,
                fontSize: 11, color: "#fff", cursor: "pointer",
              }}>
                {months.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { l: "Total Leads",       v: summary.totalLeads,    c: "var(--primary)", sub: `${summary.activeLeads} aktif` },
          { l: "Deal Confirmed",    v: formatRp(summary.totalRevenue), c: "var(--success)", sub: `${summary.dealLeads} deals` },
          { l: "Weighted Forecast", v: formatRp(summary.totalForecast), c: "var(--purple)", sub: "Estimasi realistis" },
          { l: "Best Case",         v: formatRp(summary.bestCase), c: "var(--warning)", sub: "Jika semua deal" },
        ].map((s) => (
          <div key={s.l} style={{
            background: "var(--bg-card)", borderRadius: 14, padding: "18px 20px",
            border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Monthly History Chart ─────────────────────────── */}
      <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Tren Revenue & Pipeline (12 Bulan)</h3>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Perbandingan revenue deal confirmed vs nilai pipeline aktif</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyHistory} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fgRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fgPipe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4B9EF3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4B9EF3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="monthShort" tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
            <Tooltip
              contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
              formatter={(value) => [formatRp(Number(value ?? 0)),
    "Revenue",
  ]}
              />
            <Area type="monotone" dataKey="revenue"      name="Revenue Deal"   stroke="#10b981" strokeWidth={2.5} fill="url(#fgRev)"  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="pipelineValue" name="Pipeline Aktif" stroke="#4B9EF3" strokeWidth={2.5} fill="url(#fgPipe)" dot={{ r: 3, fill: "#4B9EF3", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Probability Guide ─────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Panduan Probabilitas per Stage</h3>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Dasar perhitungan weighted forecast value</p>
          </div>
          <button onClick={() => setShowGuide(!showGuide)} style={{ padding: "4px 12px", background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>
            {showGuide ? "Sembunyikan" : "Lihat Panduan"}
          </button>
        </div>

        {showGuide && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {probabilityGuide.map((g: any) => (
              <div key={g.status} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 14px", background: "var(--bg-card2)",
                borderRadius: 10, border: "1px solid var(--border)",
              }}>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: g.color + "20", color: g.color,
                  }}>
                    {g.label}
                  </span>
                </div>
                <div style={{ width: 60, textAlign: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: g.color }}>{g.probability}%</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: "var(--bg-card)", borderRadius: 999, marginBottom: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${g.probability}%`, background: g.color, borderRadius: 999 }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{g.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pipeline Forecast per Status ──────────────────── */}
      <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Weighted Forecast per Stage</h3>
        <p style={{ margin: "0 0 20px", fontSize: 11, color: "var(--text-muted)" }}>Klik nilai untuk melihat detail perhitungan</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {forecastByStatus.map((stage: any) => {
            const color    = STATUS_COLOR[stage.status as keyof typeof STATUS_COLOR] ?? "#94a3b8"
            const maxVal   = Math.max(...forecastByStatus.map((s: any) => s.weightedValue), 1)
            const barWidth = Math.round((stage.weightedValue / maxVal) * 100)

            return (
              <div key={stage.status}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      {STATUS_LABEL[stage.status as keyof typeof STATUS_LABEL] ?? stage.status}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{stage.count} lead</span>
                    <ProbBadge pct={stage.probability} color={color} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color }}>
                      {formatRp(stage.weightedValue)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
                      dari {formatRp(stage.totalValue)}
                    </span>
                  </div>
                </div>
                <div style={{ height: 10, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999, width: `${barWidth}%`,
                    background: color, transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Detail Lead Table dengan drill-down ───────────── */}
      <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Detail Pipeline — Semua Lead ({filteredLeads.length})
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Klik baris untuk melihat detail perhitungan weighted value</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "APPROACH", "COLD_LEAD", "DECK_REQUEST", "MEETING", "DEAL", "RECYCLE"].map((s) => {
              const c = s === "ALL" ? "var(--text-muted)" : STATUS_COLOR[s as keyof typeof STATUS_COLOR] ?? "#94a3b8"
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "4px 10px",
                  background: statusFilter === s ? (s === "ALL" ? "var(--primary)" : c) : "var(--bg-card2)",
                  border: `1px solid ${statusFilter === s ? (s === "ALL" ? "var(--primary)" : c) : "var(--border)"}`,
                  borderRadius: 6, fontSize: 10, fontWeight: 600,
                  color: statusFilter === s ? "#fff" : "var(--text-muted)",
                  cursor: "pointer",
                }}>
                  {s === "ALL" ? "Semua" : STATUS_LABEL[s as keyof typeof STATUS_LABEL] ?? s}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--table-head-bg)" }}>
                {["Judul Lead", "Client", "PIC Sales", "Status", "Nilai Lead", "Probabilitas", "Weighted Value", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", fontSize: 10,
                    fontWeight: 700, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead: any, i: number) => {
                const color = STATUS_COLOR[lead.status as keyof typeof STATUS_COLOR] ?? "#94a3b8"
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      borderTop:  "1px solid var(--table-border)",
                      background: i % 2 === 0 ? "var(--bg-card)" : "var(--table-row-alt)",
                      cursor:     "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "var(--bg-card)" : "var(--table-row-alt)"}
                  >
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.title}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lead.clientName}</div>
                      {lead.clientCompany && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{lead.clientCompany}</div>}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>
                      {lead.assignedTo}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                        background: color + "20", color,
                      }}>
                        {STATUS_LABEL[lead.status as keyof typeof STATUS_LABEL] ?? lead.status}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {formatRp(lead.value, true)}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <ProbBadge pct={lead.probability} color={color} />
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 800, color: "var(--primary)", whiteSpace: "nowrap" }}>
                      {formatRp(lead.weightedValue, true)}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, color: "var(--primary)" }}>Detail →</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <LeadCalcModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  )
}