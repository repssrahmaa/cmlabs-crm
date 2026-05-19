"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession }       from "next-auth/react"
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard"
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts"
import { STATUS_LABEL, STATUS_COLOR, KANBAN_COLUMNS } from "@/types/lead"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { MetricCard } from "@/components/dashboard/MetricCards"

// ── Constants ──────────────────────────────────────────────────
const CUR_YEAR = new Date().getFullYear()
const YEARS    = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))
const MONTHS   = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 }).format(v)
}

// ── SVG Icons ──────────────────────────────────────────────────
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
)

// ── Custom Tooltip ─────────────────────────────────────────────
function ChartTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-lg)", minWidth: 140,
    }}>
      <p style={{ margin: "0 0 7px", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color ?? p.fill, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.name}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Filter Bar Component ───────────────────────────────────────
function FilterBar({
  year, month, onYear, onMonth, showMonth = true, onRefresh,
}: {
  year: string; month: string;
  onYear: (v: string) => void; onMonth: (v: string) => void;
  showMonth?: boolean; onRefresh?: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <select value={year} onChange={(e) => onYear(e.target.value)} style={{
        padding: "5px 10px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, cursor: "pointer",
      }}>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      {showMonth && (
        <select value={month} onChange={(e) => onMonth(e.target.value)} style={{
          padding: "5px 10px", background: "var(--bg-card2)", color: "var(--text-secondary)",
          border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, cursor: "pointer",
        }}>
          <option value="all">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
        </select>
      )}
      {onRefresh && (
        <button onClick={onRefresh} style={{
          padding: "5px 10px", background: "var(--bg-card2)",
          border: "1px solid var(--border)", borderRadius: 7,
          fontSize: 11, color: "var(--text-muted)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4, fontWeight: 600,
        }}>
          <IconRefresh /> Refresh
        </button>
      )}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, sub, color, sparkData }: {
  label: string; value: string|number; sub?: string; color: string; sparkData?: number[]
}) {
  const [hov, setHov] = useState(false)
  const spark = (sparkData ?? [3,5,4,8,6,9,7]).map((v, i) => ({ i, v }))
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--bg-card)", borderRadius: 14, padding: "18px 18px 14px",
        border: `1px solid ${hov ? color + "50" : "var(--border)"}`,
        borderTop: `3px solid ${color}`,
        boxShadow: hov ? `var(--shadow-md), 0 0 0 1px ${color}20` : "var(--shadow-xs)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all 0.2s", cursor: "default", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%",
        background: color + (hov ? "15" : "08"), transition: "all 0.3s",
        transform: hov ? "scale(1.5)" : "scale(1)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>}
        <div style={{ marginTop: 10, height: 32 }}>
          <ResponsiveContainer width="100%" height={32}>
            <AreaChart data={spark} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
                fill={`url(#sg-${label})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ── Chart Card ─────────────────────────────────────────────────
function ChartCard({ title, sub, children, action }: {
  title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", borderBottom: "1px solid var(--border-light)" }}>
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
          {sub && <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>}
        </div>
        {action}
      </div>
      <div style={{ padding: "14px 20px 20px" }}>{children}</div>
    </div>
  )
}

// ── Toggle Pills ───────────────────────────────────────────────
function TogglePills({ options, value, onChange }: {
  options: { v: string; l: string }[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg-card2)", borderRadius: 8, border: "1px solid var(--border)" }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          padding: "4px 12px",
          background: value === o.v ? "var(--primary)" : "transparent",
          color: value === o.v ? "#fff" : "var(--text-muted)",
          border: "none", borderRadius: 5,
          fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
        }}>{o.l}</button>
      ))}
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()

  const [data,     setData]     = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState("")
  const [year,     setYear]     = useState(String(CUR_YEAR))
  const [month,    setMonth]    = useState("all")
  const [chartMode,setChartMode]= useState<"area"|"bar"|"composed">("area")
  const [metric,   setMetric]   = useState<"leads"|"revenue">("leads")
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year, month })
      const res = await fetch(`/api/dashboard/stats?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Gagal memuat data")
      setData(await res.json())
      setLastUpdated(new Date())
      setError("")
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [year, month])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])
  const { connected } = useRealtimeDashboard({
    onDashboardRefresh: fetchDashboard, onLeadChange: fetchDashboard,
  })

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !data) return (
    <div style={{ padding: 24, background: "var(--danger-pale)", borderRadius: 12, color: "var(--danger)", display: "flex", gap: 12, alignItems: "center" }}>
      {error}
      <button onClick={fetchDashboard} style={{ padding: "6px 14px", background: "var(--bg-card)", border: "1px solid var(--danger)", borderRadius: 7, cursor: "pointer", color: "var(--danger)", fontSize: 12 }}>
        Coba lagi
      </button>
    </div>
  )

  const { kpi, charts } = data

  // ── Status chart data — pakai label terbaru ────────────────
  const statusChartData = charts.leadsByStatus
    .map((d: any) => ({
      name:  STATUS_LABEL[d.status as keyof typeof STATUS_LABEL] ?? d.status,
      value: d._count,
      color: STATUS_COLOR[d.status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
    }))
    .sort((a: any, b: any) => {
      const ORDER = ["APPROACH","COLD_LEAD","DECK_REQUEST","MEETING","DEAL","RECYCLE"]
      return ORDER.indexOf(charts.leadsByStatus.find((x: any) => x._count === b.value)?.status ?? "") -
             ORDER.indexOf(charts.leadsByStatus.find((x: any) => x._count === a.value)?.status ?? "")
    })

  const trendData = metric === "leads" ? charts.monthlyData : charts.monthlyRevenue

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, var(--hero-a,#0c1220), var(--hero-b,#112140), var(--hero-c,#0c2d5e))`,
        borderRadius: 18, padding: "22px 26px",
        position: "relative", overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
      }}>
        {[
          { s:200, t:-60, r:-40, o:0.07 },
          { s:90,  t:20,  r:130, o:0.05 },
          { s:55,  t:-5,  r:230, o:0.09 },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute", top: c.t, right: c.r,
            width: c.s, height: c.s, borderRadius: "50%",
            background: "#3b82f6", opacity: c.o, pointerEvents: "none",
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, #3b82f6 28px, #3b82f6 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, #3b82f6 28px, #3b82f6 29px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
              </p>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f0f6fc", letterSpacing: "-0.02em" }}>
                Selamat datang, {session?.user?.name?.split(" ")[0]}
              </h1>
            </div>
            {/* Realtime + Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", background: "var(--hero-glass)", border: "1px solid var(--hero-line)", borderRadius: 999, backdropFilter: "blur(10px)" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#10b981" : "#f59e0b", animation: connected ? "pulse 2s infinite" : "none" }} />
                <span style={{ fontSize: 11, color: connected ? "#6ee7b7" : "#fcd34d", fontWeight: 600 }}>
                  {connected ? "Live" : "Offline"}
                </span>
                {lastUpdated && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{format(lastUpdated, "HH:mm:ss")}</span>}
              </div>
              <FilterBar year={year} month={month} onYear={setYear} onMonth={setMonth} onRefresh={fetchDashboard} />
            </div>
          </div>

          {/* Quick stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="grid-4">
            {[
              { l: "Total Lead",   v: kpi.totalLeads,    c: "#3b82f6" },
              { l: "Aktif",        v: kpi.activeLeads,   c: "#f59e0b" },
              { l: "Deal",         v: kpi.dealLeads,     c: "#10b981" },
              { l: "Revenue",      v: formatRp(kpi.totalRevenue), c: "#a78bfa" },
            ].map((s) => (
              <div key={s.l} style={{ background: "var(--hero-glass)", border: "1px solid var(--hero-line)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
{/* KPI Cards — 4 cards interaktif */}
<div className="grid-4 stagger-children">
  {/* Pipeline Value */}
  <MetricCard
    index={0}
    label="Pipeline Value"
    value={formatRp(kpi.pipelineValue)}
    rawValue={kpi.pipelineValue}
    color="#7c3aed"
    sub={`${kpi.activeLeads} leads aktif`}
    sparkData={[5,8,3,9,6,11,8,12,7,14]}
    trend="up"
    trendValue="+12%"
    details={[
      { label: "Approach",     value: kpi.approachCount  ?? 0, color: "#6366f1" },
      { label: "Cold Lead",    value: kpi.coldLeadCount  ?? 0, color: "#3b82f6" },
      { label: "Deck Request", value: kpi.deckCount      ?? 0, color: "#f59e0b" },
      { label: "Meeting",      value: kpi.meetingCount   ?? 0, color: "#8b5cf6" },
    ]}
  />

  {/* Win Rate */}
  <MetricCard
    index={1}
    label="Win Rate"
    value={`${kpi.winRate}%`}
    rawValue={kpi.winRate}
    color="#10b981"
    variant="winrate"
    sub={`${kpi.dealLeads} deal`}
    details={[
      { label: "Deal",    value: kpi.dealLeads,    color: "#10b981" },
      { label: "Recycle", value: kpi.recycleLeads, color: "#ef4444" },
    ]}
  />

  {/* Total Revenue */}
  <MetricCard
    index={2}
    label="Total Revenue"
    value={formatRp(kpi.totalRevenue)}
    rawValue={kpi.totalRevenue}
    color="#3b82f6"
    sub="Dari deal confirmed"
    sparkData={[2,4,3,7,5,9,6,11,8,13]}
    trend="up"
    trendValue="+8%"
    details={[
      {
        label: "Avg Deal",
        value: kpi.dealLeads > 0 ? Math.round(kpi.totalRevenue / kpi.dealLeads) : 0,
        color: "#3b82f6",
      },
    ]}
  />

  {/* Recycle */}
  <MetricCard
    index={3}
    label="Recycle"
    value={kpi.recycleLeads}
    rawValue={kpi.totalLeads}
    color="#ef4444"
    sub="Lead yang gagal"
    sparkData={[3,2,4,2,3,1,2,1,2,kpi.recycleLeads]}
    trend="down"
    trendValue="-5%"
    details={[
      {
        label: "dari total",
        value: kpi.totalLeads > 0
          ? Math.round((kpi.recycleLeads / kpi.totalLeads) * 100)
          : 0,
        color: "#ef4444",
      },
    ]}
  />
</div>

      {/* ── Trend Chart ─────────────────────────────────── */}
      <ChartCard
        title="Tren Performa Tim"
        sub="Perbandingan lead, deal, dan revenue per periode"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <FilterBar year={year} month={month} onYear={setYear} onMonth={setMonth} showMonth={false} />
            <TogglePills options={[{ v:"leads",l:"Lead"},{v:"revenue",l:"Revenue"}]} value={metric} onChange={(v) => setMetric(v as any)} />
            <TogglePills options={[{v:"area",l:"Area"},{v:"bar",l:"Bar"},{v:"composed",l:"Combo"}]} value={chartMode} onChange={(v) => setChartMode(v as any)} />
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={240} className="chart-height-lg">
          {chartMode === "bar" ? (
            <BarChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} tickFormatter={metric === "revenue" ? formatRp : undefined} />
              <Tooltip content={<ChartTooltip fmt={metric === "revenue" ? formatRp : undefined} />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
              {metric === "leads" ? (
                <>
                  <Bar dataKey="created" name="Lead Masuk" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={28} />
                  <Bar dataKey="won"     name="Deal"       fill="#10b981" radius={[4,4,0,0]} maxBarSize={28} />
                  <Bar dataKey="lost"    name="Recycle"    fill="#ef4444" radius={[4,4,0,0]} maxBarSize={28} />
                </>
              ) : (
                <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]} maxBarSize={32}>
                  {(trendData ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={`hsl(${210 + i * 10}, 70%, 56%)`} />
                  ))}
                </Bar>
              )}
            </BarChart>
          ) : chartMode === "composed" ? (
            <ComposedChart data={charts.monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cmpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
              <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cmpGrad)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
              <Bar dataKey="won" name="Deal" fill="#10b981" radius={[3,3,0,0]} maxBarSize={24} />
              <Line type="monotone" dataKey="lost" name="Recycle" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} />
            </ComposedChart>
          ) : (
            // Area chart (default)
            <AreaChart data={metric === "leads" ? charts.monthlyData : charts.monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                {metric === "leads" ? (
                  <>
                    <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ag3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </>
                ) : (
                  <linearGradient id="agr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} tickFormatter={metric === "revenue" ? formatRp : undefined} />
              <Tooltip content={<ChartTooltip fmt={metric === "revenue" ? formatRp : undefined} />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
              {metric === "leads" ? (
                <>
                  <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#3b82f6" strokeWidth={2.5} fill="url(#ag1)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="won"     name="Deal"       stroke="#10b981" strokeWidth={2.5} fill="url(#ag2)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="lost"    name="Recycle"    stroke="#ef4444" strokeWidth={2}   fill="url(#ag3)" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </>
              ) : (
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#agr)" dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Status + Win/Loss ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="grid-2">

        {/* Status Bar — sinkron dengan enum terbaru */}
        <ChartCard title="Distribusi Status Lead" sub="Jumlah lead di setiap tahap pipeline saat ini">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} margin={{ top: 4, right: 4, left: -10, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--chart-text)" }} angle={-20} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Lead" radius={[5,5,0,0]} maxBarSize={40}>
                {statusChartData.map((d: any, i: number) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut Win/Loss */}
        <ChartCard title="Deal vs Recycle" sub="Rasio keberhasilan">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 130, height: 130 }}>
              <PieChart width={130} height={130}>
                <Pie data={[
                  { name: "Deal",    value: kpi.dealLeads,    fill: "#10b981" },
                  { name: "Aktif",   value: kpi.activeLeads,  fill: "#3b82f6" },
                  { name: "Recycle", value: kpi.recycleLeads, fill: "#ef4444" },
                ]} cx={60} cy={60} innerRadius={38} outerRadius={54}
                  dataKey="value" paddingAngle={3} strokeWidth={0}
                  startAngle={90} endAngle={-270}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{kpi.winRate}%</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Win Rate</div>
              </div>
            </div>
            {[
              { l: "Deal",    v: kpi.dealLeads,    c: "#10b981" },
              { l: "Aktif",   v: kpi.activeLeads,  c: "#3b82f6" },
              { l: "Recycle", v: kpi.recycleLeads, c: "#ef4444" },
            ].map((s) => (
              <div key={s.l} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.l}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                </div>
                <div style={{ height: 5, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999, width: kpi.totalLeads > 0 ? `${Math.round(s.v / kpi.totalLeads * 100)}%` : "0%",
                    background: s.c, transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Sales Leaderboard ────────────────────────────── */}
      <ChartCard title="Leaderboard Sales" sub="Ranking berdasarkan revenue — klik untuk detail lead">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(charts.salesPerformance ?? []).slice(0, 5).map((s: any, i: number) => {
            const ranks = ["1st","2nd","3rd","4th","5th"]
            const rankColors = ["#d97706","#9ca3af","#b45309","#6366f1","#3b82f6"]
            const maxRev = Math.max(...(charts.salesPerformance ?? []).map((x: any) => x.revenue), 1)
            const barW   = Math.round((s.revenue / maxRev) * 100)

            return (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px",
                background: i === 0 ? "rgba(217,119,6,0.06)" : "var(--bg-card2)",
                borderRadius: 10,
                border: `1px solid ${i === 0 ? "rgba(217,119,6,0.2)" : "var(--border)"}`,
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: rankColors[i], width: 28, flexShrink: 0 }}>{ranks[i]}</span>
                <div style={{ width: 110, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.won} deal · {s.winRate}%</div>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ height: 6, background: "var(--bg-card)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999, width: `${barW}%`,
                      background: `linear-gradient(90deg, ${rankColors[i]}, ${rankColors[i]}aa)`,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981", flexShrink: 0 }}>
                  {formatRp(s.revenue)}
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}