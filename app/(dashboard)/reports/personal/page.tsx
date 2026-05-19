"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession }                       from "next-auth/react"
import { useRealtimeDashboard }             from "@/hooks/useRealtimeDashboard"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"
import { STATUS_LABEL, STATUS_COLOR }       from "@/types/lead"

const MONTHS   = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
const CUR_YEAR = new Date().getFullYear()
const YEARS    = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

// ── SVG Icons ──────────────────────────────────────────────────
const IconFilter = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

// ── Custom Tooltip ─────────────────────────────────────────────
function CTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-lg)", minWidth: 140,
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 3, alignItems: "center" }}>
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

// ── Section Filter Bar ─────────────────────────────────────────
function SectionFilter({
  year, month, onYear, onMonth, label,
}: {
  year: string; month: string
  onYear: (v: string) => void
  onMonth: (v: string) => void
  label?: string
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {label && (
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          <IconFilter /> {label}
        </span>
      )}
      <select value={year} onChange={(e) => onYear(e.target.value)} style={{
        padding: "4px 9px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, cursor: "pointer",
      }}>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => onMonth(e.target.value)} style={{
        padding: "4px 9px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, cursor: "pointer",
      }}>
        <option value="all">Semua Bulan</option>
        {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
      </select>
    </div>
  )
}

// ── Chart Card ─────────────────────────────────────────────────
function ChartCard({ title, sub, action, children }: {
  title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 14,
      border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)", overflow: "hidden",
    }}>
      <div style={{
        padding: "14px 18px 10px", borderBottom: "1px solid var(--border-light)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 10, flexWrap: "wrap",
      }}>
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
          {sub && <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>}
        </div>
        {action}
      </div>
      <div style={{ padding: "14px 18px" }}>{children}</div>
    </div>
  )
}

// ── Metric Tile ────────────────────────────────────────────────
function MetricTile({ label, value, sub, color }: {
  label: string; value: string|number; sub?: string; color: string
}) {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 12, padding: "16px 18px",
      border: "1px solid var(--border)", borderTop: `3px solid ${color}`,
      boxShadow: "var(--shadow-xs)",
    }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function PersonalPerformancePage() {
  const { data: session } = useSession()

  // ── 1. Semua useState dideklarasi di atas ─────────────────────
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<"overview"|"pipeline"|"activity">("overview")
  const [revData, setRevData] = useState<any[]>([])

  // Filter state — tiap section independen
  const [leadYear,  setLeadYear]  = useState(String(CUR_YEAR))
  const [leadMonth, setLeadMonth] = useState("all")
  const [revYear,   setRevYear]   = useState(String(CUR_YEAR))
  const [revMonth,  setRevMonth]  = useState("all")
  const [actYear,   setActYear]   = useState(String(CUR_YEAR))
  const [actMonth,  setActMonth]  = useState("all")

  // ── 2. useCallback setelah semua useState ─────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({
        year:     leadYear,
        month:    leadMonth,
        actYear,
        actMonth,
      })
      const res = await fetch(`/api/reports/personal?${p}`)
      if (!res.ok) throw new Error("Gagal mengambil data")
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Personal fetch error:", err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [leadYear, leadMonth, actYear, actMonth])

  // ── 3. useEffect setelah useCallback ──────────────────────────
  useEffect(() => { fetchData() }, [fetchData])

  useRealtimeDashboard({ onDashboardRefresh: fetchData, onLeadChange: fetchData })

  // Revenue chart data — filter client-side dari monthlyPersonal
  useEffect(() => {
    if (!data) return
    const monthly: any[] = data.charts?.monthlyPersonal ?? []
    if (revMonth === "all") {
      setRevData(monthly.filter((d: any) => String(d.year) === revYear))
    } else {
      const filtered = monthly.filter((d: any) =>
        String(d.year) === revYear &&
        MONTHS.indexOf(d.month) === Number(revMonth) - 1
      )
      setRevData(filtered.length ? filtered : monthly)
    }
  }, [data, revYear, revMonth])

  const role = session?.user?.role

  // ── Loading state ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Memuat performa...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Error / no data ────────────────────────────────────────────
  if (!data) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Gagal memuat data. Coba refresh halaman.</p>
    </div>
  )

  const { kpi, charts, recentWon } = data

  // Activity by type chart data
  const actTypeData = Object.entries(charts.activityByType ?? {}).map(([type, count]) => ({
    name:  type.replace(/_/g, " "),
    value: count as number,
    color: ({
      INTERNAL_NOTE:  "#6366f1",
      EMAIL_SENT:     "#3b82f6",
      EMAIL_RECEIVED: "#0891b2",
      CALL:           "#10b981",
      MEETING:        "#8b5cf6",
      TASK:           "#f59e0b",
      NOTE:           "#94a3b8",
    } as Record<string, string>)[type] ?? "#94a3b8",
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Profile Hero ─────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, var(--hero-a,#0c1220) 0%, var(--hero-b,#112140) 50%, var(--hero-c,#0c2d5e) 100%)`,
        borderRadius: 18, padding: "22px 26px",
        position: "relative", overflow: "hidden", boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"#3b82f6", opacity:0.07, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-20, left:60, width:80, height:80, borderRadius:"50%", background:"#7c3aed", opacity:0.06, pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{
                width:48, height:48, borderRadius:13,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:900, color:"#fff",
                boxShadow:"0 4px 16px rgba(59,130,246,0.45)",
                flexShrink:0,
              }}>
                {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ margin:"0 0 3px", fontSize:18, fontWeight:800, color:"#f0f6fc", letterSpacing:"-0.02em" }}>
                  {session?.user?.name}
                </h1>
                <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                  {role === "SALES_MANAGER" ? "Sales Manager" : "Account Executive"}
                </p>
              </div>
            </div>
            <SectionFilter
              year={leadYear} month={leadMonth}
              onYear={setLeadYear} onMonth={setLeadMonth}
              label="Filter Lead"
            />
          </div>

          {/* Quick KPI strip */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10 }} className="grid-4">
            {[
              { l:"Total Lead",   v:kpi.totalLeads,              c:"#60a5fa" },
              { l:"Deal",         v:kpi.wonLeads,                c:"#34d399" },
              { l:"Win Rate",     v:`${kpi.winRate}%`,           c:"#a78bfa" },
              { l:"Revenue",      v:formatRp(kpi.totalRevenue),  c:"#fbbf24" },
              { l:"Task Selesai", v:`${kpi.taskCompletionRate}%`,c:"#fb923c" },
            ].map((s) => (
              <div key={s.l} style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:10, padding:"10px 12px",
              }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:3, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>{s.l}</div>
                <div style={{ fontSize:17, fontWeight:800, color:s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────── */}
      <div style={{
        display:"flex", gap:4, padding:4,
        background:"var(--bg-card2)", borderRadius:12,
        border:"1px solid var(--border)",
      }}>
        {[
          { k:"overview", l:"Overview"  },
          { k:"pipeline", l:"Pipeline"  },
          { k:"activity", l:"Aktivitas" },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as any)} style={{
            flex:1, padding:"9px 12px",
            background: tab === t.k ? "var(--bg-card)" : "transparent",
            border: "none", borderRadius: 9,
            fontSize: 12, fontWeight: tab === t.k ? 700 : 500,
            color: tab === t.k ? "var(--primary)" : "var(--text-muted)",
            cursor: "pointer", transition: "all 0.15s",
            boxShadow: tab === t.k ? "var(--shadow-xs)" : "none",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────── */}
      {/* TAB: OVERVIEW                                       */}
      {/* ──────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <>
          {/* KPI Tiles */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }} className="grid-4">
            <MetricTile label="Total Lead"    value={kpi.totalLeads}              color="var(--primary)" sub={`${kpi.activeLeads} aktif`} />
            <MetricTile label="Deal"          value={kpi.wonLeads}                color="var(--success)" sub={`Win rate ${kpi.winRate}%`} />
            <MetricTile label="Total Revenue" value={formatRp(kpi.totalRevenue)}  color="var(--purple)"  sub={`Avg ${formatRp(kpi.avgDealSize ?? 0)}`} />
            <MetricTile label="Pipeline"      value={formatRp(kpi.pipelineValue)} color="var(--warning)" sub={`${kpi.activeLeads} lead aktif`} />
          </div>

          {/* Revenue Chart */}
          <ChartCard
            title="Revenue & Lead Trend"
            sub="Performa lead dan revenue berdasarkan periode yang dipilih"
            action={
              <SectionFilter
                year={revYear} month={revMonth}
                onYear={setRevYear} onMonth={setRevMonth}
                label="Filter"
              />
            }
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revData} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="rpC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rpW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CTooltip />} />
                <Legend wrapperStyle={{ fontSize:11, color:"var(--text-secondary)" }} />
                <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#3b82f6" strokeWidth={2.5} fill="url(#rpC)" dot={{ r:3, fill:"#3b82f6", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
                <Area type="monotone" dataKey="won"     name="Deal"       stroke="#10b981" strokeWidth={2.5} fill="url(#rpW)" dot={{ r:3, fill:"#10b981", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border-light)" }}>
              <p style={{ margin:"0 0 12px", fontSize:12, fontWeight:600, color:"var(--text-secondary)" }}>Revenue per Bulan</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revData} margin={{ top:2, right:4, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
                  <Tooltip content={<CTooltip fmt={formatRp} />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[5,5,0,0]} maxBarSize={32}>
                    {revData.map((_: any, i: number) => (
                      <Cell key={i} fill={`hsl(${220 + i * 12}, 70%, 58%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Donut + Recent Won */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="grid-2">
            <ChartCard title="Komposisi Lead" sub="Distribusi semua lead berdasarkan status">
              <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                <div style={{ position:"relative", width:130, height:130, flexShrink:0 }}>
                  <PieChart width={130} height={130}>
                    <Pie
                      data={Object.entries(charts.statusBreakdown ?? {}).map(([status, count]) => ({
                        name:  STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status,
                        value: count as number,
                        fill:  STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
                      }))}
                      cx={60} cy={60} innerRadius={36} outerRadius={54}
                      dataKey="value" paddingAngle={3} strokeWidth={0}
                    >
                      {Object.entries(charts.statusBreakdown ?? {}).map(([status], i) => (
                        <Cell key={i} fill={STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)" }}>{kpi.totalLeads}</div>
                    <div style={{ fontSize:9, color:"var(--text-muted)" }}>Total</div>
                  </div>
                </div>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                  {Object.entries(charts.statusBreakdown ?? {}).map(([status, count]) => {
                    const c = STATUS_COLOR[status as keyof typeof STATUS_COLOR] ?? "#94a3b8"
                    const l = STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status
                    return (
                      <div key={status} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                          <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{l}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color:c }}>{count as number}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Deal Terbaru" sub="Lead yang berhasil closing">
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {(recentWon ?? []).length === 0 ? (
                  <p style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"20px 0" }}>Belum ada deal</p>
                ) : (recentWon ?? []).map((lead: any) => (
                  <div key={lead.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--success)", flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {lead.title}
                      </div>
                      <div style={{ fontSize:10, color:"var(--text-muted)" }}>{lead.clientName}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:"var(--success)", flexShrink:0 }}>
                      {lead.value ? formatRp(Number(lead.value)) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}

      {/* ──────────────────────────────────────────────────── */}
      {/* TAB: PIPELINE                                       */}
      {/* ──────────────────────────────────────────────────── */}
      {tab === "pipeline" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }} className="grid-3">
            <MetricTile label="Deal (Berhasil)" value={kpi.wonLeads}                 color="var(--success)" sub={`Win rate ${kpi.winRate}%`} />
            <MetricTile label="Recycle (Gagal)" value={kpi.lostLeads ?? kpi.recycleLeads ?? 0} color="var(--danger)"  sub="Bisa di-approach ulang" />
            <MetricTile label="Pipeline Value"  value={formatRp(kpi.pipelineValue)}  color="var(--warning)" sub={`${kpi.activeLeads} lead aktif`} />
          </div>

          <ChartCard
            title="Pipeline per Stage"
            sub="Distribusi nilai dan jumlah lead di setiap tahap"
            action={
              <SectionFilter
                year={leadYear} month={leadMonth}
                onYear={setLeadYear} onMonth={setLeadMonth}
                label="Filter"
              />
            }
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={(charts.pipelineByStatus ?? []).map((s: any) => ({
                  name:  STATUS_LABEL[s.status as keyof typeof STATUS_LABEL] ?? s.status,
                  count: s.count,
                  value: s.value,
                  color: STATUS_COLOR[s.status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
                }))}
                margin={{ top:4, right:4, left:0, bottom:0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CTooltip />} />
                <Bar dataKey="count" name="Jumlah Lead" radius={[5,5,0,0]} maxBarSize={40}>
                  {(charts.pipelineByStatus ?? []).map((s: any, i: number) => (
                    <Cell key={i} fill={STATUS_COLOR[s.status as keyof typeof STATUS_COLOR] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:10 }}>
              {(charts.pipelineByStatus ?? []).map((stage: any) => {
                const c      = STATUS_COLOR[stage.status as keyof typeof STATUS_COLOR] ?? "#94a3b8"
                const label  = STATUS_LABEL[stage.status as keyof typeof STATUS_LABEL] ?? stage.status
                const maxVal = Math.max(...(charts.pipelineByStatus ?? []).map((s: any) => s.value), 1)
                const pct    = Math.round((stage.value / maxVal) * 100)

                return (
                  <div key={stage.status}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)" }}>{label}</span>
                        <span style={{ fontSize:10, padding:"1px 7px", borderRadius:999, background:c+"18", color:c }}>
                          {stage.count} lead
                        </span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:c }}>{formatRp(stage.value)}</span>
                    </div>
                    <div style={{ height:7, background:"var(--bg-card2)", borderRadius:999, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:999, width:`${pct}%`, background:c, transition:"width .8s ease" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        </>
      )}

      {/* ──────────────────────────────────────────────────── */}
      {/* TAB: ACTIVITY                                       */}
      {/* ──────────────────────────────────────────────────── */}
      {tab === "activity" && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }} className="grid-4">
            <MetricTile label="Total Aktivitas" value={kpi.totalActivities}           color="var(--primary)" />
            <MetricTile label="Total Tugas"     value={kpi.totalTasks}                color="var(--warning)" />
            <MetricTile label="Tugas Selesai"   value={kpi.completedTasks}            color="var(--success)" />
            <MetricTile label="Completion Rate" value={`${kpi.taskCompletionRate}%`}  color="var(--purple)"  />
          </div>

          <ChartCard
            title="Aktivitas per Tipe"
            sub="Distribusi jenis aktivitas yang telah dilakukan"
            action={
              <SectionFilter
                year={actYear} month={actMonth}
                onYear={setActYear} onMonth={setActMonth}
                label="Filter Aktivitas"
              />
            }
          >
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={actTypeData} margin={{ top:4, right:4, left:-10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fontSize:9, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CTooltip />} />
                  <Bar dataKey="value" name="Jumlah" radius={[5,5,0,0]} maxBarSize={36}>
                    {actTypeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {actTypeData.map((d) => {
                  const total = actTypeData.reduce((s, x) => s + x.value, 0)
                  const pct   = total > 0 ? Math.round((d.value / total) * 100) : 0
                  return (
                    <div key={d.name}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                          <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{d.name}</span>
                        </div>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <span style={{ fontSize:11, fontWeight:700, color:d.color }}>{d.value}</span>
                          <span style={{ fontSize:10, color:"var(--text-muted)" }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height:5, background:"var(--bg-card2)", borderRadius:999, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:d.color, borderRadius:999, transition:"width .8s ease" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Tren Aktivitas Bulanan" sub="Jumlah aktivitas yang dilakukan per bulan">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts.activityMonthly ?? []} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CTooltip />} />
                <Area type="monotone" dataKey="count" name="Aktivitas" stroke="#6366f1" strokeWidth={2.5} fill="url(#actGrad)" dot={{ r:3, fill:"#6366f1", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  )
}