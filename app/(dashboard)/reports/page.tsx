"use client"

import { useState, useEffect, useCallback } from "react"
import { useRoleGuard }                     from "@/hooks/useRoleGuard"
import { useRealtimeDashboard }             from "@/hooks/useRealtimeDashboard"
import { generateDocxDocument }             from "@/lib/services/documentGenerator"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { STATUS_LABEL, STATUS_COLOR } from "@/types/lead"


const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
const CUR_YEAR = new Date().getFullYear()
const YEARS  = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(v)
}
function formatRpFull(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`
}

// ── Chart Filter Bar ───────────────────────────────────────────
function ChartFilter({
  year, month, onYearChange, onMonthChange, showMonth = true,
}: {
  year: string; month: string
  onYearChange: (y: string) => void
  onMonthChange: (m: string) => void
  showMonth?: boolean
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <select value={year} onChange={(e) => onYearChange(e.target.value)} style={{
        padding: "4px 10px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, cursor: "pointer",
      }}>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      {showMonth && (
        <select value={month} onChange={(e) => onMonthChange(e.target.value)} style={{
          padding: "4px 10px", background: "var(--bg-card2)", color: "var(--text-secondary)",
          border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, cursor: "pointer",
        }}>
          <option value="all">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
        </select>
      )}
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────
function CTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-lg)", minWidth: 140,
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color ?? p.fill }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.name}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Sales Detail Modal ─────────────────────────────────────────
function SalesDetailModal({ sales, onClose }: { sales: any; onClose: () => void }) {
  const [tab, setTab] = useState<"deal"|"recycle"|"all">("all")

  const leads = sales.leads ?? []
  const filtered = tab === "all"    ? leads
    : tab === "deal"   ? leads.filter((l: any) => l.status === "DEAL")
    : leads.filter((l: any) => l.status === "RECYCLE")

  const byStatus = leads.reduce((acc: any, l: any) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(byStatus).map(([status, count]) => ({
    name: STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status,
    value: count as number,
    color: STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
  }))

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-card)", borderRadius: 16,
        width: "100%", maxWidth: 680, maxHeight: "90vh",
        overflowY: "auto", border: "1px solid var(--border)",
        boxShadow: "var(--shadow-xl)", animation: "scaleIn .2s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              Detail Performa — {sales.name}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
              {sales.total} total lead · Win rate {sales.winRate}%
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>&times;</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { l: "Total Lead",  v: sales.total,           c: "var(--primary)"  },
              { l: "Deal",        v: sales.won,             c: "var(--success)"  },
              { l: "Recycle",     v: sales.lost,            c: "var(--danger)"   },
              { l: "Revenue",     v: formatRp(sales.revenue), c: "var(--purple)" },
            ].map((s) => (
              <div key={s.l} style={{ background: "var(--bg-card2)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Donut chart distribusi status */}
          {pieData.length > 0 && (
            <div style={{ background: "var(--bg-card2)", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Distribusi Lead per Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <PieChart width={120} height={120}>
                  <Pie data={pieData} cx={55} cy={55} innerRadius={32} outerRadius={50} dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {pieData.map((d) => (
                    <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab filter */}
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-card2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 14 }}>
            {([
              { k: "all",    l: `Semua (${leads.length})`               },
              { k: "deal",   l: `Deal (${sales.won})`                   },
              { k: "recycle",l: `Recycle / Gagal (${sales.lost})`       },
            ] as const).map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                flex: 1, padding: "7px 10px",
                background: tab === t.k ? "var(--bg-card)" : "transparent",
                border: "none", borderRadius: 7,
                fontSize: 12, fontWeight: tab === t.k ? 700 : 500,
                color: tab === t.k
                  ? t.k === "deal" ? "var(--success)" : t.k === "recycle" ? "var(--danger)" : "var(--primary)"
                  : "var(--text-muted)",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: tab === t.k ? "var(--shadow-xs)" : "none",
              }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* Lead list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                Tidak ada data
              </div>
            ) : filtered.map((lead: any) => {
              const sc    = STATUS_COLOR[lead.status as keyof typeof STATUS_COLOR] ?? "#94a3b8"
              const isDeal    = lead.status === "DEAL"
              const isRecycle = lead.status === "RECYCLE"

              return (
                <div key={lead.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px",
                  background: isDeal ? "rgba(16,185,129,0.05)" : isRecycle ? "rgba(248,113,113,0.05)" : "var(--bg-card2)",
                  borderRadius: 10,
                  border: `1px solid ${isDeal ? "rgba(16,185,129,0.2)" : isRecycle ? "rgba(248,113,113,0.2)" : "var(--border)"}`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lead.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {lead.clientName}{lead.clientCompany ? ` — ${lead.clientCompany}` : ""}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: sc + "18", color: sc, flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    {STATUS_LABEL[lead.status as keyof typeof STATUS_LABEL] ?? lead.status}
                  </span>
                  {lead.value ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: isDeal ? "var(--success)" : "var(--text-muted)", flexShrink: 0 }}>
                      {formatRp(Number(lead.value))}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes scaleIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function ReportsPage() {
  const { is, canGenerateDocument }    = useRoleGuard()

  const [activeTab, setActiveTab]      = useState<"report"|"document">("report")
  const [reportData, setReportData]    = useState<any>(null)
  const [loading, setLoading]          = useState(true)
  const [selectedSales, setSelectedSales] = useState<any>(null)

  // Filter state
  const [rYear,  setRYear]  = useState(String(CUR_YEAR))
  const [rMonth, setRMonth] = useState("all")

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ year: rYear, month: rMonth })
      const res = await fetch(`/api/reports?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Gagal")
      setReportData(await res.json())
    } catch {}
    finally { setLoading(false) }
  }, [rYear, rMonth])

  useEffect(() => { fetchReport() }, [fetchReport])
  useRealtimeDashboard({ onDashboardRefresh: fetchReport })

  const monthlyChart = reportData?.charts?.monthlyBreakdown ?? []
  const salesPerf    = reportData?.salesPerformance ?? []
  const statusChart  = (reportData?.charts?.leadsByStatus ?? []).map((d: any) => ({
    name:  STATUS_LABEL[d.status as keyof typeof STATUS_LABEL] ?? d.status,
    value: d.count,
    color: STATUS_COLOR[d.status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Tab Header ───────────────────────────────────── */}
      <div style={{
        display: "flex", background: "var(--bg-card)",
        borderRadius: 14, padding: 4, border: "1px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
      }}>
        {[
          { k: "report",   l: "Laporan Performa" },
          { k: "document", l: "Dokumen" },
        ].map((t) => (
          <button key={t.k} onClick={() => setActiveTab(t.k as any)} style={{
            flex: 1, padding: "10px 16px",
            background: activeTab === t.k ? "var(--primary)" : "transparent",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: activeTab === t.k ? 700 : 500,
            color: activeTab === t.k ? "#fff" : "var(--text-muted)",
            cursor: "pointer", transition: "all 0.2s",
            boxShadow: activeTab === t.k ? "var(--shadow-primary)" : "none",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── REPORT TAB ───────────────────────────────────── */}
      {activeTab === "report" && (
        <>
          {/* Filter */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 18px", background: "var(--bg-card)",
            borderRadius: 12, border: "1px solid var(--border)",
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Filter Periode
            </h3>
            <ChartFilter
              year={rYear} month={rMonth}
              onYearChange={setRYear} onMonthChange={setRMonth}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Memuat data...</div>
          ) : (
            <>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { l: "Total Lead",   v: reportData?.summary?.totalLeads ?? 0,     c: "var(--primary)" },
                  { l: "Deal",         v: reportData?.summary?.wonLeads ?? 0,        c: "var(--success)" },
                  { l: "Recycle",      v: reportData?.summary?.lostLeads ?? 0,       c: "var(--danger)"  },
                  { l: "Total Revenue", v: formatRp(reportData?.summary?.totalRevenue ?? 0), c: "var(--purple)" },
                ].map((s) => (
                  <div key={s.l} style={{
                    background: "var(--bg-card)", borderRadius: 14, padding: "18px 20px",
                    border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)",
                  }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.l}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Monthly Trend Chart */}
              <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Tren Lead per Bulan</h3>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Perbandingan lead masuk, deal, dan recycle</p>
                  </div>
                  <ChartFilter year={rYear} month={rMonth} onYearChange={setRYear} onMonthChange={setRMonth} showMonth={false} />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      {[["c","#4B9EF3"],["d","#10b981"],["r","#ef4444"]].map(([id,c]) => (
                        <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                    <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#4B9EF3" strokeWidth={2.5} fill="url(#gc)" dot={{ r: 3, fill: "#4B9EF3", strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="won"     name="Deal"       stroke="#10b981" strokeWidth={2.5} fill="url(#gd)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="lost"    name="Recycle"    stroke="#ef4444" strokeWidth={2.5} fill="url(#gr)" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Distribusi Status Lead</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statusChart} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CTooltip />} />
                      <Bar dataKey="value" name="Lead" radius={[5, 5, 0, 0]} maxBarSize={36}>
                        {statusChart.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Perbandingan Deal vs Recycle</h3>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: 140, height: 140 }}>
                      <PieChart width={140} height={140}>
                        <Pie
                          data={[
                            { name: "Deal",    value: reportData?.summary?.wonLeads  ?? 0, fill: "#10b981" },
                            { name: "Aktif",   value: reportData?.summary?.activeLeads ?? 0, fill: "#4B9EF3" },
                            { name: "Recycle", value: reportData?.summary?.lostLeads  ?? 0, fill: "#ef4444" },
                          ]}
                          cx={65} cy={65} innerRadius={38} outerRadius={56}
                          dataKey="value" paddingAngle={3} strokeWidth={0}
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#4B9EF3" />
                          <Cell fill="#ef4444" />
                        </Pie>
                      </PieChart>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{reportData?.summary?.winRate ?? 0}%</div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Win Rate</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                    {[
                      { l: "Deal",    v: reportData?.summary?.wonLeads   ?? 0, c: "#10b981" },
                      { l: "Aktif",   v: reportData?.summary?.activeLeads ?? 0, c: "#4B9EF3" },
                      { l: "Recycle", v: reportData?.summary?.lostLeads   ?? 0, c: "#ef4444" },
                    ].map((s) => (
                      <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.c }} />
                          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.l}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales Performance — klik untuk detail */}
              <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Performa Sales</h3>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Klik baris untuk melihat detail lead per sales</p>
                  </div>
                  <ChartFilter year={rYear} month={rMonth} onYearChange={setRYear} onMonthChange={setRMonth} />
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--table-head-bg)" }}>
                        {["Ranking","Nama","Role","Total Lead","Deal","Recycle","Win Rate","Revenue",""].map((h) => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {salesPerf.map((s: any, i: number) => (
                        <tr
                          key={s.name}
                          onClick={() => setSelectedSales(s)}
                          style={{
                            borderTop: "1px solid var(--table-border)",
                            background: i % 2 === 0 ? "var(--bg-card)" : "var(--table-row-alt)",
                            cursor: "pointer", transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "var(--bg-card)" : "var(--table-row-alt)"}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: 14 }}>
                              {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i+1}th`}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</div>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--primary-pale)", color: "var(--primary)" }}>
                              {s.role === "SALES_MANAGER" ? "SM" : "AE"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>{s.total}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{s.won}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>{s.lost}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: "var(--bg-card2)", borderRadius: 999, minWidth: 60, overflow: "hidden" }}>
                                <div style={{
                                  height: "100%", borderRadius: 999, width: `${s.winRate}%`,
                                  background: s.winRate >= 60 ? "var(--success)" : s.winRate >= 30 ? "var(--warning)" : "var(--danger)",
                                }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{s.winRate}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>
                            {formatRp(s.revenue)}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: 11, color: "var(--primary)" }}>Detail →</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── DOCUMENT TAB ─────────────────────────────────── */}
      {activeTab === "document" && (
        <DocumentTab canGenerate={canGenerateDocument} />
      )}

      {selectedSales && (
        <SalesDetailModal sales={selectedSales} onClose={() => setSelectedSales(null)} />
      )}
    </div>
  )
}

// ── Document Tab ───────────────────────────────────────────────
function DocumentTab({ canGenerate }: { canGenerate: boolean }) {
  const [docs, setDocs]         = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => { setDocs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

async function handleDownload(doc: any) {
  try {
   const { generateDocumentNumber } =
  await import("@/lib/services/documentGenerator")

    await generateDocxDocument({
      type:    doc.type,
      title:   doc.title,
      number:  doc.content?.documentNumber
        ?? generateDocumentNumber(doc.type),

      date:    doc.content?.date
        ?? new Date().toLocaleDateString("id-ID"),

      lead:    doc.lead,
      content: doc.content ?? {},
    })

  } catch (err: any) {
    alert("Gagal generate dokumen: " + err.message)
  }
}

  const STATUS_DOC_COLOR: Record<string, string> = {
    DRAFT:     "#f59e0b",
    FINALIZED: "#4B9EF3",
    SENT:      "#10b981",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Memuat dokumen...</div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)" }}>
          Belum ada dokumen
        </div>
      ) : docs.map((doc, i) => {
        const sc = STATUS_DOC_COLOR[doc.status] ?? "#94a3b8"
        return (
          <div key={doc.id} style={{
            background: "var(--bg-card)", borderRadius: 12, padding: "16px 20px",
            border: "1px solid var(--border)", display: "flex", alignItems: "center",
            gap: 16, flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{doc.title}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                  background: sc + "18", color: sc,
                }}>
                  {doc.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {doc.lead?.clientName}{doc.lead?.clientCompany ? ` — ${doc.lead.clientCompany}` : ""} · {doc.type}
              </div>
            </div>
            <button
              onClick={() => handleDownload(doc)}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                boxShadow: "var(--shadow-primary)",
                whiteSpace: "nowrap",
              }}
            >
              Download .docx
            </button>
          </div>
        )
      })}
    </div>
  )
}
