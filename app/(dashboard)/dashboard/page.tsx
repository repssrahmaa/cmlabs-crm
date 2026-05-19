"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession }            from "next-auth/react"
import { useRealtimeDashboard }  from "@/hooks/useRealtimeDashboard"
import {
  BarChart, Bar, AreaChart, Area, ComposedChart, Line,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts"
import { STATUS_LABEL, STATUS_COLOR, KANBAN_COLUMNS } from "@/types/lead"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import ThemeToggle from "@/components/layout/ThemeToggle"

const CUR_YEAR = new Date().getFullYear()
const YEARS    = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))
const MONTHS   = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

// ── SVG Icons ──────────────────────────────────────────────────
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
)
const IconLive = () => (
  <svg width="8" height="8" viewBox="0 0 8 8">
    <circle cx="4" cy="4" r="4" fill="currentColor"/>
  </svg>
)
const IconTrendUp = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
)
const IconTrendDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
)

function formatRp(v: number, compact = true) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(v)
}

// ── Custom Tooltip ─────────────────────────────────────────────
function ChartTip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   "var(--bg-card)",
      border:       "1px solid var(--border)",
      borderRadius: 10,
      padding:      "10px 14px",
      boxShadow:    "var(--shadow-lg)",
      minWidth:     140,
    }}>
      <p style={{ margin: "0 0 7px", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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

// ── Section Filter (independen per section) ────────────────────
function SectionFilter({
  year, month, onYear, onMonth, label, showMonth = true,
}: {
  year: string; month: string
  onYear: (v: string) => void; onMonth: (v: string) => void
  label?: string; showMonth?: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      {label && (
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}:
        </span>
      )}
      <select value={year} onChange={(e) => onYear(e.target.value)} style={{
        padding: "4px 9px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, cursor: "pointer",
      }}>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      {showMonth && (
        <select value={month} onChange={(e) => onMonth(e.target.value)} style={{
          padding: "4px 9px", background: "var(--bg-card2)", color: "var(--text-secondary)",
          border: "1px solid var(--border)", borderRadius: 7, fontSize: 11, cursor: "pointer",
        }}>
          <option value="all">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
        </select>
      )}
    </div>
  )
}

// ── Progress Bar ───────────────────────────────────────────────
function ProgressBar({ pct, color, label, value }: {
  pct: number; color: string; label: string; value: string | number
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 7, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          transition: "width 0.9s ease",
          boxShadow: `0 0 6px ${color}50`,
        }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, textAlign: "right" }}>{Math.round(pct)}%</div>
    </div>
  )
}

// ── KPI Card — tanpa sparkline, pakai breakdown visual ─────────
function KpiCard({
  label, value, color, icon, breakdown, index = 0,
}: {
  label:     string
  value:     string | number
  color:     string
  icon:      React.ReactNode
  breakdown?: { label: string; value: number; total: number; color: string }[]
  index?:    number
}) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="anim-slide-up"
      style={{
        background:    "var(--bg-card)",
        borderRadius:  14,
        padding:       "18px 18px 16px",
        border:        `1px solid ${hov ? color + "55" : "var(--border)"}`,
        borderTop:     `3px solid ${color}`,
        position:      "relative",
        overflow:      "hidden",
        transition:    "all 0.22s ease",
        transform:     hov ? "translateY(-3px)" : "none",
        boxShadow:     hov ? `var(--shadow-md), 0 0 0 1px ${color}18` : "var(--shadow-xs)",
        cursor:        "default",
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* Background glow */}
      <div style={{
        position:   "absolute", top: -24, right: -24,
        width:      88, height: 88, borderRadius: "50%",
        background: color + (hov ? "16" : "09"),
        transition: "all 0.3s",
        transform:  hov ? "scale(1.6)" : "scale(1)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Icon + Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: color + "18",
            display: "flex", alignItems: "center",
            justifyContent: "center", color, flexShrink: 0,
          }}>
            {icon}
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {label}
          </span>
        </div>

        {/* Value */}
        <div style={{
          fontSize: 28, fontWeight: 900, color: "var(--text-primary)",
          lineHeight: 1, marginBottom: 14, letterSpacing: "-0.02em",
        }}>
          {value}
        </div>

        {/* Breakdown bars */}
        {breakdown && breakdown.map((b, i) => {
          const pct = b.total > 0 ? (b.value / b.total) * 100 : 0
          return (
            <ProgressBar
              key={i}
              label={b.label}
              value={b.value}
              pct={pct}
              color={b.color}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Win Rate Radial Card ───────────────────────────────────────
function WinRateCard({
  winRate, dealLeads, recycleLeads, totalLeads, index,
}: {
  winRate: number; dealLeads: number; recycleLeads: number; totalLeads: number; index?: number
}) {
  const [hov, setHov] = useState(false)
  const radialData    = [{ name: "Win Rate", value: winRate, fill: "#10b981" }]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="anim-slide-up"
      style={{
        background:    "var(--bg-card)",
        borderRadius:  14,
        padding:       "18px 18px 16px",
        border:        `1px solid ${hov ? "#10b98155" : "var(--border)"}`,
        borderTop:     "3px solid #10b981",
        transition:    "all 0.22s ease",
        transform:     hov ? "translateY(-3px)" : "none",
        boxShadow:     hov ? `var(--shadow-md)` : "var(--shadow-xs)",
        animationDelay: `${(index ?? 1) * 0.07}s`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: "#10b98118",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#10b981", flexShrink: 0,
        }}>
          <IconWinRate />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Win Rate
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Radial */}
        <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
          <RadialBarChart
            width={72} height={72} cx={36} cy={36}
            innerRadius={22} outerRadius={34} barSize={8}
            data={radialData} startAngle={90} endAngle={-270}
          >
            <RadialBar
              background={{ fill: "var(--bg-card2)" }}
              dataKey="value" cornerRadius={4} max={100}
            />
          </RadialBarChart>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#10b981", lineHeight: 1 }}>
              {winRate}
            </span>
            <span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 600 }}>%</span>
          </div>
        </div>

        {/* Detail */}
        <div style={{ flex: 1 }}>
          {[
            { l: "Deal",    v: dealLeads,    c: "#10b981" },
            { l: "Recycle", v: recycleLeads, c: "#ef4444" },
            { l: "Aktif",   v: totalLeads - dealLeads - recycleLeads, c: "#3b82f6" },
          ].map((s) => {
            const pct = totalLeads > 0 ? (s.v / totalLeads) * 100 : 0
            return (
              <div key={s.l} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.l}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.c }}>{s.v}</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, background: s.c, borderRadius: 999,
                    transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── SVG Icon components untuk KPI ─────────────────────────────
const IconPipeline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v4H3z"/><path d="M3 11h12v4H3z"/><path d="M3 19h6v2H3z"/>
  </svg>
)
const IconRevenue = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IconWinRate = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const IconRecycle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <polyline points="23 20 23 14 17 14"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
)

// ── Toggle Pills ───────────────────────────────────────────────
function TogglePills({ options, value, onChange }: {
  options: { v: string; l: string }[]
  value:   string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", gap: 3, padding: 3, background: "var(--bg-card2)", borderRadius: 8, border: "1px solid var(--border)" }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          padding: "4px 11px",
          background: value === o.v ? "var(--primary)" : "transparent",
          color:      value === o.v ? "#fff" : "var(--text-muted)",
          border: "none", borderRadius: 5,
          fontSize: 11, fontWeight: 600,
          cursor: "pointer", transition: "all 0.15s",
        }}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

// ── Chart Card ─────────────────────────────────────────────────
function ChartCard({ title, sub, action, children }: {
  title: string; sub?: string
  action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{
      background:   "var(--bg-card)",
      borderRadius: 14,
      border:       "1px solid var(--border)",
      boxShadow:    "var(--shadow-xs)",
      overflow:     "hidden",
    }}>
      <div style={{
        padding:    "14px 18px 12px",
        borderBottom: "1px solid var(--border-light)",
        display:    "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 10, flexWrap: "wrap",
      }}>
        <div>
          <h3 style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
            {title}
          </h3>
          {sub && <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>}
        </div>
        {action}
      </div>
      <div style={{ padding: "14px 18px 18px" }}>
        {children}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()

  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Tiap section punya filter sendiri — TIDAK otomatis
  const [kpiYear,    setKpiYear]    = useState(String(CUR_YEAR))
  const [kpiMonth,   setKpiMonth]   = useState("all")
  const [trendYear,  setTrendYear]  = useState(String(CUR_YEAR))
  const [trendMonth, setTrendMonth] = useState("all")
  const [statusYear, setStatusYear] = useState(String(CUR_YEAR))
  const [statusMonth,setStatusMonth]= useState("all")
  const [salesYear,  setSalesYear]  = useState(String(CUR_YEAR))
  const [salesMonth, setSalesMonth] = useState("all")

  // Chart mode
  const [trendMode, setTrendMode]  = useState<"area"|"bar"|"composed">("area")
  const [trendMetric, setTrendMetric] = useState<"leads"|"revenue">("leads")

  // Connected status
  const [connected, setConnected]  = useState(false)

  // ── Fetch functions — independen ──────────────────────────
  const [kpiData,    setKpiData]    = useState<any>(null)
  const [trendData,  setTrendData]  = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [salesData,  setSalesData]  = useState<any[]>([])
  const [revData,    setRevData]    = useState<any[]>([])

  const fetchKpi = useCallback(async () => {
    const res = await fetch(`/api/dashboard/stats?year=${kpiYear}&month=${kpiMonth}&section=kpi`, { cache: "no-store" })
    const d   = await res.json()
    setKpiData(d.kpi)
    setLastUpdated(new Date())
  }, [kpiYear, kpiMonth])

  const fetchTrend = useCallback(async () => {
    const res = await fetch(`/api/dashboard/stats?year=${trendYear}&month=${trendMonth}&section=trend`, { cache: "no-store" })
    const d   = await res.json()
    setTrendData(d.charts?.monthlyData ?? [])
    setRevData(d.charts?.monthlyRevenue ?? [])
  }, [trendYear, trendMonth])

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`/api/dashboard/stats?year=${statusYear}&month=${statusMonth}&section=status`, { cache: "no-store" })
    const d   = await res.json()
    setStatusData(d.charts?.leadsByStatus ?? [])
  }, [statusYear, statusMonth])

  const fetchSales = useCallback(async () => {
    const res = await fetch(`/api/dashboard/stats?year=${salesYear}&month=${salesMonth}&section=sales`, { cache: "no-store" })
    const d   = await res.json()
    setSalesData(d.charts?.salesPerformance ?? [])
  }, [salesYear, salesMonth])

  // Fetch all on mount
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([fetchKpi(), fetchTrend(), fetchStatus(), fetchSales()])
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [fetchKpi, fetchTrend, fetchStatus, fetchSales])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Each section re-fetches independently
  useEffect(() => { if (!loading) fetchKpi() },    [kpiYear, kpiMonth])
  useEffect(() => { if (!loading) fetchTrend() },  [trendYear, trendMonth])
  useEffect(() => { if (!loading) fetchStatus() }, [statusYear, statusMonth])
  useEffect(() => { if (!loading) fetchSales() },  [salesYear, salesMonth])

  const { connected: sseConnected } = useRealtimeDashboard({
    onDashboardRefresh: fetchAll, onLeadChange: fetchAll,
  })

  // Status chart — sorted by pipeline order
  const ORDER = ["APPROACH","COLD_LEAD","DECK_REQUEST","MEETING","DEAL","RECYCLE"]
  const statusChartData = [...statusData]
    .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status))
    .map((d) => ({
      name:  STATUS_LABEL[d.status as keyof typeof STATUS_LABEL] ?? d.status,
      value: d._count ?? d.count ?? 0,
      color: STATUS_COLOR[d.status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
      status: d.status,
    }))

const kpi = kpiData ?? {
    totalLeads:    0,
    dealLeads:     0,
    recycleLeads:  0,
    activeLeads:   0,
    totalRevenue:  0,
    pipelineValue: 0,
    winRate:       0,
    approachCount: 0,
    coldLeadCount: 0,
    deckCount:     0,
    meetingCount:  0,
  }
 
  if (loading && !kpiData) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Memuat dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const trendChartData = trendMetric === "leads" ? trendData : revData

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{
        background:   `linear-gradient(135deg, var(--hero-a,#0c1220) 0%, var(--hero-b,#112140) 50%, var(--hero-c,#0c2d5e) 100%)`,
        borderRadius: 18, padding: "22px 26px",
        position:     "relative", overflow: "hidden",
        boxShadow:    "var(--shadow-lg)",
      }}>
        {[{ s:200,t:-60,r:-40,o:0.07 },{ s:90,t:20,r:140,o:0.05 },{ s:55,t:-5,r:230,o:0.09 }].map((c,i) => (
          <div key={i} style={{
            position:"absolute", top:c.t, right:c.r,
            width:c.s, height:c.s, borderRadius:"50%",
            background:"#3b82f6", opacity:c.o, pointerEvents:"none",
          }} />
        ))}
        <div style={{
          position:"absolute", inset:0, opacity:0.025,
          backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 28px,#3b82f6 28px,#3b82f6 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,#3b82f6 28px,#3b82f6 29px)",
          pointerEvents:"none",
        }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:18 }}>
            <div>
              <p style={{ margin:"0 0 2px", fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
              </p>
              <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#f0f6fc", letterSpacing:"-0.02em" }}>
                Selamat datang, {session?.user?.name?.split(" ")[0]}
              </h1>
            </div>

            {/* Realtime status */}
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{
                display:"flex", alignItems:"center", gap:7,
                padding:"6px 12px",
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:999, backdropFilter:"blur(10px)",
              }}>
                <span style={{
                  color: sseConnected ? "#6ee7b7" : "#fcd34d",
                  animation: sseConnected ? "livePulse 2s infinite" : "none",
                }}>
                  <IconLive />
                </span>
                <span style={{ fontSize:11, color: sseConnected ? "#6ee7b7" : "#fcd34d", fontWeight:600 }}>
                  {sseConnected ? "Live" : "Offline"}
                </span>
                {lastUpdated && (
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                    {format(lastUpdated, "HH:mm:ss")}
                  </span>
                )}
              </div>
              <button onClick={fetchAll} style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"6px 12px", background:"rgba(59,130,246,0.2)",
                border:"1px solid rgba(59,130,246,0.3)", borderRadius:999,
                color:"#93c5fd", fontSize:11, cursor:"pointer", fontWeight:600,
              }}>
                <IconRefresh /> Refresh
              </button>
            </div>
          </div>

          {/* Quick stats — dengan filter KPI sendiri */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              Ringkasan
            </span>
            <SectionFilter
              year={kpiYear} month={kpiMonth}
              onYear={setKpiYear} onMonth={setKpiMonth}
              label="Filter KPI"
            />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }} className="grid-4">
            {[
              { l:"Total Lead",   v:kpi.totalLeads,              c:"#60a5fa" },
              { l:"Aktif",        v:kpi.activeLeads,             c:"#fbbf24" },
              { l:"Deal",         v:kpi.dealLeads ?? kpi.wonLeads, c:"#34d399" },
              { l:"Revenue",      v:formatRp(kpi.totalRevenue),  c:"#a78bfa" },
            ].map((s) => (
              <div key={s.l} style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.07)",
                borderRadius:10, padding:"12px 14px",
              }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:4, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  {s.l}
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      </div>

      {/* ── KPI Cards — 4 cards dengan breakdown bar ─────── */}
      <div className="grid-4 stagger-children">

        {/* Pipeline Value */}
        <KpiCard
          index={0}
          label="Pipeline Value"
          value={formatRp(kpi.pipelineValue)}
          color="#7c3aed"
          icon={<IconPipeline />}
          breakdown={[
            { label: "Approach",      value: kpi.approachCount  ?? 0, total: kpi.activeLeads, color: "#6366f1" },
            { label: "Cold Lead",     value: kpi.coldLeadCount  ?? 0, total: kpi.activeLeads, color: "#3b82f6" },
            { label: "Deck Request",  value: kpi.deckCount      ?? 0, total: kpi.activeLeads, color: "#f59e0b" },
            { label: "Meeting",       value: kpi.meetingCount   ?? 0, total: kpi.activeLeads, color: "#8b5cf6" },
          ]}
        />

        {/* Win Rate */}
        <WinRateCard
          index={1}
          winRate={kpi.winRate}
          dealLeads={kpi.dealLeads ?? kpi.wonLeads ?? 0}
          recycleLeads={kpi.recycleLeads ?? kpi.lostLeads ?? 0}
          totalLeads={kpi.totalLeads}
        />

        {/* Total Revenue */}
        <KpiCard
          index={2}
          label="Total Revenue"
          value={formatRp(kpi.totalRevenue)}
          color="#3b82f6"
          icon={<IconRevenue />}
          breakdown={[
            {
              label: "Dari Deal",
              value: kpi.dealLeads ?? kpi.wonLeads ?? 0,
              total: kpi.totalLeads,
              color: "#3b82f6",
            },
            {
              label: "Avg per Deal",
              value: (kpi.dealLeads ?? kpi.wonLeads ?? 0) > 0
                ? Math.round(kpi.totalRevenue / (kpi.dealLeads ?? kpi.wonLeads ?? 1))
                : 0,
              total: kpi.totalRevenue || 1,
              color: "#60a5fa",
            },
          ]}
        />

        {/* Recycle */}
        <KpiCard
          index={3}
          label="Recycle"
          value={kpi.recycleLeads ?? kpi.lostLeads ?? 0}
          color="#ef4444"
          icon={<IconRecycle />}
          breakdown={[
            {
              label: "Dari Total Lead",
              value: kpi.recycleLeads ?? kpi.lostLeads ?? 0,
              total: kpi.totalLeads || 1,
              color: "#ef4444",
            },
            {
              label: "Closed (Deal+Recycle)",
              value: (kpi.dealLeads ?? kpi.wonLeads ?? 0) + (kpi.recycleLeads ?? kpi.lostLeads ?? 0),
              total: kpi.totalLeads || 1,
              color: "#f97316",
            },
          ]}
        />
      </div>

      {/* ── Trend Chart — filter sendiri ────────────────────── */}
      <ChartCard
        title="Tren Performa Tim"
        sub="Perbandingan lead, deal, dan revenue berdasarkan periode yang dipilih"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <SectionFilter
              year={trendYear} month={trendMonth}
              onYear={setTrendYear} onMonth={setTrendMonth}
            />
            <TogglePills
  options={[
    { v: "leads", l: "Lead" },
    { v: "revenue", l: "Revenue" },
  ]}
  value={trendMetric}
  onChange={(v) => setTrendMetric(v as "leads" | "revenue")}
/>

<TogglePills
  options={[
    { v: "area", l: "Area" },
    { v: "bar", l: "Bar" },
    { v: "composed", l: "Combo" },
  ]}
  value={trendMode}
  onChange={(v) => setTrendMode(v as "area" | "bar" | "composed")}
/>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={240} className="chart-md">
          {trendMode === "bar" ? (
            <BarChart data={trendChartData} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false}
                tickFormatter={trendMetric === "revenue" ? (v) => formatRp(v) : undefined}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTip fmt={trendMetric === "revenue" ? formatRp : undefined} />} />
              <Legend wrapperStyle={{ fontSize:11, color:"var(--text-secondary)" }} />
              {trendMetric === "leads" ? (
                <>
                  <Bar dataKey="created" name="Lead Masuk" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={26} />
                  <Bar dataKey="won"     name="Deal"       fill="#10b981" radius={[4,4,0,0]} maxBarSize={26} />
                  <Bar dataKey="lost"    name="Recycle"    fill="#ef4444" radius={[4,4,0,0]} maxBarSize={26} />
                </>
              ) : (
                <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]} maxBarSize={32}>
                  {trendChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={`hsl(${210 + i * 10}, 68%, 57%)`} />
                  ))}
                </Bar>
              )}
            </BarChart>
          ) : trendMode === "composed" ? (
            <ComposedChart data={trendData} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="cmpA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize:11, color:"var(--text-secondary)" }} />
              <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cmpA)" dot={{ r:3, fill:"#3b82f6", strokeWidth:0 }} />
              <Bar dataKey="won"  name="Deal"    fill="#10b981" radius={[4,4,0,0]} maxBarSize={22} />
              <Line type="monotone" dataKey="lost" name="Recycle" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" dot={{ r:3, fill:"#ef4444", strokeWidth:0 }} />
            </ComposedChart>
          ) : (
            // Area (default)
            <AreaChart data={trendChartData} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                {trendMetric === "leads" ? (
                  <>
                    <linearGradient id="aLc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="aLd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="aLr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </>
                ) : (
                  <linearGradient id="aRv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false}
                tickFormatter={trendMetric === "revenue" ? (v) => formatRp(v) : undefined}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTip fmt={trendMetric === "revenue" ? formatRp : undefined} />} />
              <Legend wrapperStyle={{ fontSize:11, color:"var(--text-secondary)" }} />
              {trendMetric === "leads" ? (
                <>
                  <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#3b82f6" strokeWidth={2.5} fill="url(#aLc)" dot={{ r:3, fill:"#3b82f6", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
                  <Area type="monotone" dataKey="won"     name="Deal"       stroke="#10b981" strokeWidth={2.5} fill="url(#aLd)" dot={{ r:3, fill:"#10b981", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
                  <Area type="monotone" dataKey="lost"    name="Recycle"    stroke="#ef4444" strokeWidth={2}   fill="url(#aLr)" dot={{ r:3, fill:"#ef4444", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
                </>
              ) : (
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#aRv)" dot={{ r:3, fill:"#7c3aed", strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }} />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Status + Sales Charts ────────────────────────────── */}
      <div className="grid-2" style={{ gap: 16 }}>

        {/* Status Distribution — filter sendiri */}
        <ChartCard
          title="Distribusi Status Lead"
          sub="Jumlah lead di setiap tahap pipeline"
          action={
            <SectionFilter
              year={statusYear} month={statusMonth}
              onYear={setStatusYear} onMonth={setStatusMonth}
            />
          }
        >
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210} className="chart-md">
              <BarChart data={statusChartData} margin={{ top:4, right:4, left:-10, bottom:24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize:9, fill:"var(--chart-text)" }} angle={-20} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="value" name="Lead" radius={[5,5,0,0]} maxBarSize={38}>
                  {statusChartData.map((d: any, i: number) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-muted)", fontSize:12 }}>
              Belum ada data
            </div>
          )}
        </ChartCard>

        {/* Sales Leaderboard — filter sendiri */}
        <ChartCard
          title="Leaderboard Sales"
          sub="Ranking berdasarkan revenue"
          action={
            <SectionFilter
              year={salesYear} month={salesMonth}
              onYear={setSalesYear} onMonth={setSalesMonth}
            />
          }
        >
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {salesData.slice(0, 5).map((s: any, i: number) => {
              const maxRev   = Math.max(...salesData.map((x: any) => x.revenue), 1)
              const barW     = Math.round((s.revenue / maxRev) * 100)
              const rankC    = ["#d97706","#9ca3af","#b45309","#6366f1","#3b82f6"][i] ?? "var(--text-muted)"
              const ranks    = ["1st","2nd","3rd","4th","5th"]

              return (
                <div key={s.name} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"10px 12px",
                  background: i === 0 ? "rgba(217,119,6,0.06)" : "var(--bg-card2)",
                  borderRadius:10,
                  border:`1px solid ${i === 0 ? "rgba(217,119,6,0.2)" : "var(--border)"}`,
                }}>
                  <span style={{ fontSize:11, fontWeight:800, color:rankC, width:28, flexShrink:0 }}>
                    {ranks[i]}
                  </span>
                  <div style={{ width:100, flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</div>
                    <div style={{ fontSize:10, color:"var(--text-muted)" }}>{s.won} deal · {s.winRate}%</div>
                  </div>
                  <div style={{ flex:1, height:5, background:"var(--bg-card)", borderRadius:999, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:999, width:`${barW}%`,
                      background:`linear-gradient(90deg, ${rankC}, ${rankC}aa)`,
                      transition:"width .8s ease",
                    }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:800, color:"var(--success)", flexShrink:0, minWidth:60, textAlign:"right" }}>
                    {formatRp(s.revenue)}
                  </span>
                </div>
              )
            })}
            {salesData.length === 0 && (
              <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text-muted)", fontSize:12 }}>
                Belum ada data sales
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}