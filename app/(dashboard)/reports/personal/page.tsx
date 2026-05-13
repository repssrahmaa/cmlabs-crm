"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession }                       from "next-auth/react"
import { useRealtimeDashboard }             from "@/hooks/useRealtimeDashboard"
import { format }                           from "date-fns"
import { id as localeId }                   from "date-fns/locale"
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts"

const B = {
  primary: "#4B9EF3", dark: "#1a2332", success: "#10b981",
  warning: "#f59e0b", danger: "#ef4444", purple: "#8b5cf6",
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

const STATUS_LABEL: Record<string, string> = {
  LEAD_IN: "Lead Masuk", CONTACT_MADE: "Dihubungi",
  NEEDS_IDENTIFIED: "Kebutuhan", PROPOSAL_MADE: "Proposal",
  NEGOTIATION: "Negosiasi", CONTRACT_SENT: "Kontrak",
}
const STATUS_COLOR: Record<string, string> = {
  LEAD_IN: "#6366f1", CONTACT_MADE: "#4B9EF3",
  NEEDS_IDENTIFIED: "#0ea5e9", PROPOSAL_MADE: "#f59e0b",
  NEGOTIATION: "#f97316", CONTRACT_SENT: "#8b5cf6",
}
const ACTIVITY_LABEL: Record<string, string> = {
  INTERNAL_NOTE: "Catatan", EMAIL_SENT: "Email",
  CALL: "Telepon", MEETING: "Meeting", TASK: "Tugas", NOTE: "Catatan",
}
const ACTIVITY_COLOR: Record<string, string> = {
  INTERNAL_NOTE: "#6366f1", EMAIL_SENT: "#4B9EF3",
  CALL: "#0891b2", MEETING: "#10b981", TASK: "#f59e0b", NOTE: "#94a3b8",
}

// ── Metric Tile ────────────────────────────────────────────────
function MetricTile({ icon, label, value, sub, color, size = "normal" }: {
  icon: string; label: string; value: string | number
  sub?: string; color: string; size?: "normal" | "large"
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   "var(--bg-card)",
        borderRadius: 14,
        padding:      size === "large" ? 24 : 18,
        border:       `1px solid ${hov ? color + "50" : "var(--border)"}`,
        transition:   "all 0.2s",
        transform:    hov ? "translateY(-2px)" : "none",
        boxShadow:    hov ? `0 8px 24px ${color}20` : "0 1px 4px rgba(0,0,0,0.04)",
        position:     "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", bottom: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: color + "08",
        transition: "transform 0.3s",
        transform:  hov ? "scale(1.4)" : "scale(1)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width:        36, height: 36, borderRadius: 8,
          background:   color + "15",
          display:      "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16,
          marginBottom: 10,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: size === "large" ? 32 : 24, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 3, background: `linear-gradient(90deg, ${color}, ${color}60)`,
        borderRadius: "14px 14px 0 0",
      }} />
    </div>
  )
}

export default function PersonalPerformancePage() {
  const { data: session }         = useSession()
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [tab, setTab]             = useState<"overview" | "pipeline" | "activity">("overview")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/reports/personal", { cache: "no-store" })
      if (!res.ok) throw new Error("Gagal memuat data")
      setData(await res.json())
      setLastUpdated(new Date())
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  const { connected } = useRealtimeDashboard({ onDashboardRefresh: fetchData, onLeadChange: fetchData })

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${B.primary}30`, borderTopColor: B.primary, animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#64748b", fontSize: 14 }}>Memuat performa Anda...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !data) return (
    <div style={{ padding: 20, background: "#fef2f2", borderRadius: 12, color: "#dc2626" }}>
      {error} <button onClick={fetchData} style={{ marginLeft: 10, padding: "5px 12px", background: "#fff", border: "1px solid #fca5a5", borderRadius: 6, cursor: "pointer", color: "#dc2626" }}>Coba lagi</button>
    </div>
  )

  const { kpi, charts, recentWon, activeLeadsDetail } = data
  const role = session?.user?.role

  const activityChartData = Object.entries(charts.activityByType ?? {}).map(([type, count]) => ({
    name:  ACTIVITY_LABEL[type] ?? type,
    value: count as number,
    color: ACTIVITY_COLOR[type] ?? "#94a3b8",
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Profile Hero ─────────────────────────────────── */}
      <div style={{
        background:   `linear-gradient(135deg, ${B.dark} 0%, #1e3a5f 60%, #0c4a6e 100%)`,
        borderRadius: 20,
        padding:      "28px 32px",
        position:     "relative",
        overflow:     "hidden",
      }}>
        {[
          { s: 160, t: -40, r: -20, o: 0.07 },
          { s: 90,  t: 30,  r: 120, o: 0.05 },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute", top: c.t, right: c.r,
            width: c.s, height: c.s, borderRadius: "50%",
            background: B.primary, opacity: c.o, pointerEvents: "none",
          }} />
        ))}

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {/* Avatar */}
              <div style={{
                width:        64, height: 64,
                borderRadius: 16,
                background:   `linear-gradient(135deg, ${B.primary}, #1a6fd4)`,
                display:      "flex", alignItems: "center",
                justifyContent: "center",
                fontSize:     26, fontWeight: 800, color: "#fff",
                boxShadow:    `0 4px 16px ${B.primary}50`,
                border:       "2px solid rgba(255,255,255,0.2)",
              }}>
                {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>
                    {session?.user?.name}
                  </h1>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px",
                    background: B.primary + "30", color: "#93c5fd",
                    border: `1px solid ${B.primary}40`, borderRadius: 999,
                  }}>
                    {role === "SALES_MANAGER" ? "Sales Manager" : "Account Executive"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                  {session?.user?.email}
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: connected ? B.success : B.warning,
                boxShadow:  connected ? `0 0 0 3px ${B.success}40` : `0 0 0 3px ${B.warning}40`,
              }} />
              <span style={{ fontSize: 12, color: connected ? B.success : B.warning, fontWeight: 600 }}>
                {connected ? "Live" : "Offline"}
              </span>
              {lastUpdated && (
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  · {format(lastUpdated, "HH:mm:ss", { locale: localeId })}
                </span>
              )}
              <button onClick={fetchData} style={{ padding: "4px 12px", background: "rgba(75,158,243,0.2)", border: `1px solid ${B.primary}40`, borderRadius: 8, color: "#93c5fd", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 24 }}>
            {[
              { label: "Total Leads",    value: kpi.totalLeads,                   color: B.primary  },
              { label: "Won",            value: kpi.wonLeads,                     color: B.success  },
              { label: "Win Rate",       value: `${kpi.winRate}%`,               color: "#a78bfa"  },
              { label: "Revenue",        value: formatRupiah(kpi.totalRevenue),   color: "#34d399"  },
              { label: "Task Done",      value: `${kpi.taskCompletionRate}%`,     color: B.warning  },
            ].map((s) => (
              <div key={s.label} style={{
                background:   "rgba(255,255,255,0.06)",
                border:       "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding:      "12px 14px",
              }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────── */}
      <div style={{
        display:      "flex", gap: 4, padding: 4,
        background:   "#f8fafc", borderRadius: 12,
        border:       "1px solid #e2e8f0",
      }}>
        {[
          { key: "overview",  label: "Overview",        icon: "📊" },
          { key: "pipeline",  label: "Pipeline Aktif",  icon: "🔀" },
          { key: "activity",  label: "Aktivitas",       icon: "📅" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              flex:         1, padding:    "10px 16px",
              background:   tab === t.key ? "#fff" : "transparent",
              border:       "none",
              borderRadius: 10,
              fontSize:     13, fontWeight: tab === t.key ? 700 : 500,
              color:        tab === t.key ? B.primary : "#64748b",
              cursor:       "pointer", transition: "all 0.2s",
              boxShadow:    tab === t.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              display:      "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ────────────────────────────────── */}
      {tab === "overview" && (
        <>
          {/* KPI Tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <MetricTile icon="📋" label="Total Leads"    value={kpi.totalLeads}                  color={B.primary} />
            <MetricTile icon="🏆" label="Leads Won"      value={kpi.wonLeads}                    color={B.success} sub={`Win rate ${kpi.winRate}%`} />
            <MetricTile icon="💰" label="Total Revenue"  value={formatRupiah(kpi.totalRevenue)}  color="#a78bfa"   sub={`Avg ${formatRupiah(kpi.avgDealSize)}`} />
            <MetricTile icon="🔥" label="Pipeline Value" value={formatRupiah(kpi.pipelineValue)} color={B.warning} sub={`${kpi.activeLeads} aktif`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <MetricTile icon="🎯" label="Win Rate"       value={`${kpi.winRate}%`}                 color={B.success} />
            <MetricTile icon="✅" label="Tugas Selesai"  value={`${kpi.completedTasks}/${kpi.totalTasks}`} color={B.primary} sub={`${kpi.taskCompletionRate}% completion`} />
            <MetricTile icon="📉" label="Leads Lost"     value={kpi.lostLeads}                    color={B.danger}  />
            <MetricTile icon="⚡" label="Total Aktivitas" value={kpi.totalActivities}              color="#0891b2"   />
          </div>

          {/* Trend Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Tren Bulanan Saya</h3>
              <p style={{ margin: "0 0 20px", fontSize: 12, color: "var(--text-muted)" }}>Leads dibuat dan won per bulan</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={charts.monthlyPersonal} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={B.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={B.primary} stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={B.success} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={B.success} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "var(--text-muted)" }}
                    itemStyle={{ color: "var(--text)" }}
                  />
                  <Area type="monotone" dataKey="created" name="Dibuat" stroke={B.primary} strokeWidth={2.5} fill="url(#gC)" dot={{ r: 4, fill: B.primary }} />
                  <Area type="monotone" dataKey="won"     name="Won"    stroke={B.success} strokeWidth={2.5} fill="url(#gW)" dot={{ r: 4, fill: B.success }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart untuk leads breakdown */}
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Komposisi Leads</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-muted)" }}>Breakdown status saat ini</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", width: 140, height: 140 }}>
                  <PieChart width={140} height={140}>
                    <Pie
                      data={[
                        { name: "Won",   value: kpi.wonLeads,   fill: B.success },
                        { name: "Aktif", value: kpi.activeLeads, fill: B.primary },
                        { name: "Lost",  value: kpi.lostLeads,  fill: B.danger  },
                      ]}
                      cx={65} cy={65}
                      innerRadius={42} outerRadius={60}
                      dataKey="value" paddingAngle={3}
                      strokeWidth={0}
                    >
                      {[B.success, B.primary, B.danger].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{kpi.totalLeads}</div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Total</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {[
                  { label: "Won",   value: kpi.wonLeads,    color: B.success },
                  { label: "Aktif", value: kpi.activeLeads, color: B.primary },
                  { label: "Lost",  value: kpi.lostLeads,   color: B.danger  },
                ].map((s) => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                      <span style={{ fontSize: 12, color: "#64748b" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Won Leads */}
          {recentWon.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{
                padding:    "16px 24px",
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                borderBottom: "1px solid #bbf7d0",
                display:    "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#065f46" }}>Leads Won Terakhir</h3>
                  <p style={{ margin: 0, fontSize: 11, color: "#059669" }}>Deal yang berhasil Anda closing</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentWon.map((lead: any, i: number) => (
                  <div key={lead.id} style={{
                    display:      "flex", alignItems: "center",
                    gap:          16, padding:    "14px 24px",
                    borderBottom: i < recentWon.length - 1 ? "1px solid #f1f5f9" : "none",
                    background:   i % 2 === 0 ? "#fff" : "#fafafa",
                  }}>
                    <div style={{
                      width:        36, height: 36, borderRadius: 10,
                      background:   B.success + "15",
                      display:      "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 16, flexShrink: 0,
                    }}>✅</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{lead.clientName}{lead.clientCompany ? ` · ${lead.clientCompany}` : ""}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: B.success }}>{lead.value ? formatRupiah(Number(lead.value)) : "-"}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{lead.closedAt ? format(new Date(lead.closedAt), "d MMM yyyy", { locale: localeId }) : "-"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB: PIPELINE ─────────────────────────────────── */}
      {tab === "pipeline" && (
        <>
          {/* Pipeline by Status */}
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Pipeline per Stage</h3>
            <p style={{ margin: "0 0 24px", fontSize: 12, color: "var(--text-muted)" }}>Distribusi nilai pipeline Anda</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(charts.pipelineByStatus ?? [])
                .sort((a: any, b: any) => b.value - a.value)
                .map((stage: any) => {
                  const max      = Math.max(...(charts.pipelineByStatus ?? []).map((s: any) => s.value), 1)
                  const barWidth = Math.round((stage.value / max) * 100)
                  const color    = STATUS_COLOR[stage.status] ?? "#94a3b8"

                  return (
                    <div key={stage.status}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                            {STATUS_LABEL[stage.status] ?? stage.status}
                          </span>
                          <span style={{
                            fontSize: 11, padding: "1px 8px", borderRadius: 999,
                            background: color + "15", color,
                          }}>
                            {stage.count} leads
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                          {formatRupiah(stage.value)}
                        </span>
                      </div>
                      <div style={{ height: 10, background: "var(--bg-card)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width:  `${barWidth}%`, background: color,
                          transition: "width 1s ease",
                          boxShadow: `0 0 8px ${color}60`,
                        }} />
                      </div>
                    </div>
                  )
                })}
              {(!charts.pipelineByStatus || charts.pipelineByStatus.length === 0) && (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  Tidak ada leads aktif saat ini
                </div>
              )}
            </div>
          </div>

          {/* Active Leads Detail */}
          {activeLeadsDetail.length > 0 && (
            <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  Leads Aktif Saya ({activeLeadsDetail.length})
                </h3>
              </div>
              {activeLeadsDetail.map((lead: any, i: number) => {
                const color = STATUS_COLOR[lead.status] ?? "#94a3b8"
                return (
                  <div key={lead.id} style={{
                    display:      "flex", alignItems: "center",
                    gap:          16, padding:    "14px 24px",
                    borderBottom: i < activeLeadsDetail.length - 1 ? "1px solid var(--border)" : "none",
                    background:   i % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)",
                  }}>
                    <div style={{
                      width:        10, height:      10,
                      borderRadius: "50%", background: color,
                      boxShadow:    `0 0 6px ${color}80`,
                      flexShrink:   0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{lead.clientName}{lead.clientCompany ? ` · ${lead.clientCompany}` : ""}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                      background: color + "15", color: "var(--text)", flexShrink: 0,
                    }}>
                      {STATUS_LABEL[lead.status] ?? lead.status}
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>
                      {lead.value ? formatRupiah(Number(lead.value)) : "-"}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── TAB: ACTIVITY ─────────────────────────────────── */}
      {tab === "activity" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Activity by type chart */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Aktivitas per Tipe</h3>
              <p style={{ margin: "0 0 20px", fontSize: 12, color: "#94a3b8" }}>Distribusi jenis aktivitas</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#1a2332", border: "none", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Bar dataKey="value" name="Jumlah" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {activityChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Task completion */}
            <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Task Completion</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-muted)" }}>Progress penyelesaian tugas</p>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ position: "relative", width: 140, height: 140 }}>
                  <PieChart width={140} height={140}>
                    <Pie
                      data={[
                        { name: "Selesai", value: kpi.completedTasks, fill: B.success },
                        { name: "Pending", value: Math.max(kpi.totalTasks - kpi.completedTasks, 0), fill: "var(--bg-card-alt)" },
                      ]}
                      cx={65} cy={65}
                      innerRadius={42} outerRadius={60}
                      dataKey="value" paddingAngle={4}
                      strokeWidth={0}
                      startAngle={90} endAngle={-270}
                    >
                      <Cell fill={B.success} />
                      <Cell fill="var(--bg-card-alt)" />
                    </Pie>
                  </PieChart>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: B.success }}>{kpi.taskCompletionRate}%</div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Selesai</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Total Tugas",  value: kpi.totalTasks,      color: B.primary },
                  { label: "Selesai",      value: kpi.completedTasks,  color: B.success },
                  { label: "Pending",      value: kpi.totalTasks - kpi.completedTasks, color: B.warning },
                  { label: "Total Aktivitas", value: kpi.totalActivities, color: "#0891b2" },
                ].map((s) => (
                  <div key={s.label} style={{
                    background:   "var(--bg-card)", borderRadius: 10,
                    padding:      "12px 14px",
                    border:       "1px solid var(--border)",
                  }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}