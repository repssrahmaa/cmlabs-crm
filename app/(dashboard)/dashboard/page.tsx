"use client"

import { useDashboard }   from "@/hooks/useDashboard"
import { useSession }     from "next-auth/react"
import { useTheme }       from "@/hooks/useTheme"
import { format }         from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useState, useMemo } from "react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ComposedChart,
} from "recharts"

// ── Helpers ────────────────────────────────────────────────────
function formatRupiah(v: number, compact = true) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(v)
}

const STATUS_LABEL: Record<string, string> = {
  LEAD_IN: "Lead Masuk", CONTACT_MADE: "Dihubungi",
  NEEDS_IDENTIFIED: "Kebutuhan", PROPOSAL_MADE: "Proposal",
  NEGOTIATION: "Negosiasi", CONTRACT_SENT: "Kontrak",
  WON: "Berhasil", LOST: "Gagal",
}
const STATUS_COLOR: Record<string, string> = {
  LEAD_IN: "#6366f1", CONTACT_MADE: "#4B9EF3",
  NEEDS_IDENTIFIED: "#0ea5e9", PROPOSAL_MADE: "#f59e0b",
  NEGOTIATION: "#f97316", CONTRACT_SENT: "#8b5cf6",
  WON: "#10b981", LOST: "#ef4444",
}

// ── Custom Tooltip ─────────────────────────────────────────────
function DarkTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:   "var(--bg-card)",
      border:       "1px solid var(--border)",
      borderRadius: 12,
      padding:      "12px 16px",
      boxShadow:    "var(--shadow-lg)",
      minWidth:     140,
    }}>
      <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color ?? p.fill, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.name}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, trend, sparkData }: {
  icon:      string
  label:     string
  value:     string | number
  sub?:      string
  color:     string
  trend?:    "up" | "down" | "neutral"
  sparkData?: number[]
}) {
  const [hov, setHov] = useState(false)
  const spark = (sparkData ?? [3,5,2,8,4,9,6]).map((v, i) => ({ i, v }))

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   "var(--bg-card)",
        borderRadius: 16,
        padding:      "20px 20px 14px",
        border:       `1px solid ${hov ? color + "50" : "var(--border)"}`,
        position:     "relative",
        overflow:     "hidden",
        cursor:       "default",
        transition:   "all 0.25s ease",
        transform:    hov ? "translateY(-3px)" : "none",
        boxShadow:    hov ? `var(--shadow-md), 0 0 0 1px ${color}20` : "var(--shadow-sm)",
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        position:   "absolute", top: 0, left: 0, right: 0,
        height:     3, borderRadius: "16px 16px 0 0",
        background: `linear-gradient(90deg, ${color}, ${color}50)`,
      }} />

      {/* Glow bg */}
      <div style={{
        position:   "absolute", top: -30, right: -30,
        width:      90, height: 90,
        borderRadius: "50%",
        background: color + (hov ? "18" : "0c"),
        transition: "all 0.3s",
        transform:  hov ? "scale(1.4)" : "scale(1)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Icon + Trend */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: color + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            {icon}
          </div>
          {trend && (
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 700,
              color: trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "var(--text-muted)",
              background: (trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "#94a3b8") + "15",
              padding: "3px 8px", borderRadius: 999,
            }}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
              <span>{trend === "up" ? "Naik" : trend === "down" ? "Turun" : "Stabil"}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div style={{
          fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
          color: "var(--text-primary)", lineHeight: 1, marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 2 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>{sub}</div>
        )}

        {/* Sparkline */}
        <div style={{ height: 36, marginTop: 4 }}>
          <ResponsiveContainer width="100%" height={36}>
            <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
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
function ChartCard({ title, sub, action, children, minH = 280 }: {
  title: string; sub?: string; action?: React.ReactNode
  children: React.ReactNode; minH?: number
}) {
  return (
    <div style={{
      background:   "var(--bg-card)",
      borderRadius: 16,
      border:       "1px solid var(--border)",
      boxShadow:    "var(--shadow-sm)",
      overflow:     "hidden",
    }}>
      <div style={{
        padding:        "18px 20px 14px",
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "flex-start",
        borderBottom:   "1px solid var(--border)",
      }}>
        <div>
          <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            {title}
          </h3>
          {sub && <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>}
        </div>
        {action}
      </div>
      <div style={{ padding: "16px 20px", minHeight: minH }}>
        {children}
      </div>
    </div>
  )
}

// ── Pill Button ────────────────────────────────────────────────
function PillBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      padding:    "4px 12px",
      background: active ? "var(--primary)" : "var(--bg-card2)",
      color:      active ? "#fff" : "var(--text-secondary)",
      border:     `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
      borderRadius: 999,
      fontSize:   11, fontWeight: 600,
      cursor:     "pointer", transition: "all 0.15s",
    }}>
      {children}
    </button>
  )
}

// ── Donut with label ───────────────────────────────────────────
function DonutChart({ data, size = 140 }: {
  data: { name: string; value: number; color: string }[]
  size?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data} cx={size/2 - 2} cy={size/2 - 2}
          innerRadius={size * 0.28} outerRadius={size * 0.42}
          dataKey="value" paddingAngle={3} strokeWidth={0}
          startAngle={90} endAngle={-270}
        >
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
      <div style={{
        position: "absolute", inset: 0,
        display:  "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.16, fontWeight: 800, color: "var(--text-primary)" }}>
          {total}
        </span>
        <span style={{ fontSize: size * 0.075, color: "var(--text-muted)" }}>Total</span>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session }  = useSession()
  const { isDark }         = useTheme()
  const { data, loading, error, lastUpdated, connected, refetch } = useDashboard()

  const [chartMode, setChartMode]   = useState<"area"|"bar"|"composed">("area")
  const [metric, setMetric]         = useState<"leads"|"revenue">("leads")
  const [hoveredSales, setHoveredSales] = useState<number | null>(null)

  const statusDonutData = useMemo(() => {
    if (!data) return []
    return data.charts.leadsByStatus.map((d) => ({
      name:  STATUS_LABEL[d.status] ?? d.status,
      value: d._count,
      color: STATUS_COLOR[d.status] ?? "#94a3b8",
    }))
  }, [data])

  const radarData = useMemo(() => {
    if (!data) return []
    return data.charts.salesPerformance.slice(0, 5).map((s) => ({
      name:    s.name.split(" ")[0],
      won:     s.won,
      total:   s.total,
      winRate: s.winRate,
    }))
  }, [data])

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 16 }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "var(--primary)",
        animation: "spin 0.7s linear infinite",
      }} />
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Memuat dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !data) return (
    <div style={{
      padding: 24, background: "var(--bg-card)", borderRadius: 16,
      border: "1px solid var(--danger)", color: "var(--danger)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <span style={{ flex: 1 }}>Gagal memuat: {error}</span>
      <button onClick={refetch} style={{
        padding: "8px 16px", background: "transparent",
        border: "1px solid var(--danger)", borderRadius: 8,
        cursor: "pointer", color: "var(--danger)", fontWeight: 500, fontSize: 13,
      }}>Coba lagi</button>
    </div>
  )

  const { kpi, charts } = data

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ────────────────────────────────────────── */}
      <div style={{
        background:   "var(--hero-bg)",
        borderRadius: 20,
        padding:      "24px 28px",
        position:     "relative",
        overflow:     "hidden",
        boxShadow:    "var(--shadow-lg)",
      }}>
        {/* Decorative */}
        {[
          { s: 220, t: -60, r: -40, o: 0.07 },
          { s: 100, t: 20,  r: 140, o: 0.06 },
          { s: 60,  t: -10, r: 230, o: 0.09 },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute", top: c.t, right: c.r,
            width: c.s, height: c.s, borderRadius: "50%",
            background: "var(--primary)", opacity: c.o, pointerEvents: "none",
          }} />
        ))}

        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 28px, #4B9EF3 28px, #4B9EF3 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, #4B9EF3 28px, #4B9EF3 29px)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
              </p>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
                Halo, {session?.user?.name?.split(" ")[0]} 👋
              </h1>
            </div>

            {/* Realtime badge */}
            <div style={{
              display:      "flex", alignItems: "center", gap: 8,
              padding:      "8px 14px",
              background:   "var(--hero-glass)",
              border:       "1px solid var(--hero-border)",
              borderRadius: 999,
              backdropFilter: "blur(12px)",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: connected ? "#10b981" : "#f59e0b",
                animation:  connected ? "pulse 2s infinite" : "none",
                boxShadow:  connected ? "0 0 0 3px rgba(16,185,129,0.3)" : "none",
              }} />
              <span style={{ fontSize: 12, color: connected ? "#6ee7b7" : "#fcd34d", fontWeight: 600 }}>
                {connected ? "Live" : "Offline"}
              </span>
              {lastUpdated && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  {format(lastUpdated, "HH:mm:ss")}
                </span>
              )}
              <button onClick={refetch} style={{
                padding: "3px 10px",
                background: "rgba(75,158,243,0.2)",
                border: "1px solid rgba(75,158,243,0.3)",
                borderRadius: 6, color: "#93c5fd",
                fontSize: 11, cursor: "pointer", fontWeight: 600,
              }}>
                ↻
              </button>
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
            </div>
          </div>

          {/* Quick stat strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { l: "Total Leads",   v: kpi.totalLeads,              c: "#4B9EF3", i: "📋" },
              { l: "Leads Aktif",   v: kpi.activeLeads,             c: "#f59e0b", i: "🔥" },
              { l: "Won",           v: kpi.wonLeads,                c: "#10b981", i: "🏆" },
              { l: "Revenue",       v: formatRupiah(kpi.totalRevenue), c: "#a78bfa", i: "💰" },
            ].map((s) => (
              <div key={s.l} style={{
                background:   "var(--hero-glass)",
                border:       "1px solid var(--hero-border)",
                borderRadius: 12,
                padding:      "14px 16px",
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{s.i}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {s.l}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard icon="📊" label="Pipeline Value"  value={formatRupiah(kpi.pipelineValue)} color="#8b5cf6" sub="Potensi aktif"    trend="up"      sparkData={[5,8,3,9,6,11,8]}        />
        <StatCard icon="🎯" label="Win Rate"        value={`${kpi.winRate}%`}               color="#10b981" sub={`${kpi.wonLeads} won / ${kpi.wonLeads + kpi.lostLeads} closed`} trend="up" sparkData={[40,45,38,52,48,55,kpi.winRate]} />
        <StatCard icon="💵" label="Total Revenue"   value={formatRupiah(kpi.totalRevenue)}  color="#4B9EF3" sub="Dari leads won"   trend="up"      sparkData={[2,5,3,8,5,9,7]}        />
        <StatCard icon="📉" label="Leads Lost"      value={kpi.lostLeads}                   color="#ef4444" sub="Perlu evaluasi"  trend="down"    sparkData={[3,2,4,1,3,2,kpi.lostLeads]} />
      </div>

      {/* ── Main Chart ──────────────────────────────────── */}
      <ChartCard
        title="Tren Performa Tim"
        sub="Analisis leads dan revenue bulanan secara komprehensif"
        minH={320}
        action={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4 }}>
              <PillBtn active={metric === "leads"}   onClick={() => setMetric("leads")}>Leads</PillBtn>
              <PillBtn active={metric === "revenue"} onClick={() => setMetric("revenue")}>Revenue</PillBtn>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <PillBtn active={chartMode === "area"}     onClick={() => setChartMode("area")}>Area</PillBtn>
              <PillBtn active={chartMode === "bar"}      onClick={() => setChartMode("bar")}>Bar</PillBtn>
              <PillBtn active={chartMode === "composed"} onClick={() => setChartMode("composed")}>Combo</PillBtn>
            </div>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={280}>
          {chartMode === "composed" ? (
            <ComposedChart data={
    (metric === "leads"
      ? charts.monthlyData
      : charts.monthlyRevenue) as any
  } margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4B9EF3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4B9EF3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false}
                tickFormatter={metric === "revenue" ? (v) => formatRupiah(v) : undefined}
              />
              <Tooltip content={<DarkTooltip formatter={metric === "revenue" ? formatRupiah : undefined} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 12 }} />
              <Bar dataKey={metric === "leads" ? "created" : "revenue"} name={metric === "leads" ? "Dibuat" : "Revenue"}
                fill="#4B9EF3" radius={[4, 4, 0, 0]} fillOpacity={0.8} maxBarSize={32} />
              {metric === "leads" && (
                <Line type="monotone" dataKey="won" name="Won" stroke="#10b981" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10b981" }} />
              )}
            </ComposedChart>
          ) : chartMode === "bar" ? (
            <BarChart data={(metric === "leads" ? charts.monthlyData : charts.monthlyRevenue) as any } margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false}
                tickFormatter={metric === "revenue" ? (v) => formatRupiah(v) : undefined}
              />
              <Tooltip content={<DarkTooltip formatter={metric === "revenue" ? formatRupiah : undefined} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 12 }} />
              {metric === "leads" ? (
                <>
                  <Bar dataKey="created" name="Dibuat" fill="#4B9EF3" radius={[4,4,0,0]} maxBarSize={28} />
                  <Bar dataKey="won"     name="Won"    fill="#10b981" radius={[4,4,0,0]} maxBarSize={28} />
                </>
              ) : (
                <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]} maxBarSize={32}>
                  {charts.monthlyRevenue.map((_, i) => (
                    <Cell key={i} fill={`hsl(${210 + i * 8}, 80%, ${50 + i * 3}%)`} />
                  ))}
                </Bar>
              )}
            </BarChart>
          ) : (
            // Area chart
            <AreaChart data={(metric === "leads" ? charts.monthlyData : charts.monthlyRevenue) as any} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4B9EF3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4B9EF3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="agr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false}
                tickFormatter={metric === "revenue" ? (v) => formatRupiah(v) : undefined}
              />
              <Tooltip content={<DarkTooltip formatter={metric === "revenue" ? formatRupiah : undefined} />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 12 }} />
              {metric === "leads" ? (
                <>
                  <Area type="monotone" dataKey="created" name="Dibuat" stroke="#4B9EF3" strokeWidth={2.5} fill="url(#ag1)" dot={{ r: 4, fill: "#4B9EF3", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="won"     name="Won"    stroke="#10b981" strokeWidth={2.5} fill="url(#ag2)" dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </>
              ) : (
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#agr)" dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Second Row ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

        {/* Status Donut */}
        <ChartCard title="Status Leads" sub="Distribusi per tahap pipeline" minH={240}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <DonutChart data={statusDonutData} size={150} />
            <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {statusDonutData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Win/Loss breakdown */}
        <ChartCard title="Win vs Loss" sub="Rasio keberhasilan closing" minH={240}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { l: "Won",    v: kpi.wonLeads,    c: "#10b981", pct: kpi.totalLeads > 0 ? Math.round(kpi.wonLeads / kpi.totalLeads * 100) : 0 },
              { l: "Aktif",  v: kpi.activeLeads, c: "#4B9EF3", pct: kpi.totalLeads > 0 ? Math.round(kpi.activeLeads / kpi.totalLeads * 100) : 0 },
              { l: "Lost",   v: kpi.lostLeads,   c: "#ef4444", pct: kpi.totalLeads > 0 ? Math.round(kpi.lostLeads / kpi.totalLeads * 100) : 0 },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: s.c }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.l}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: s.c }}>{s.v}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-card2)", padding: "1px 6px", borderRadius: 999 }}>
                      {s.pct}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 8, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    width:  `${s.pct}%`, background: s.c,
                    transition: "width 1s ease",
                    boxShadow: `0 0 8px ${s.c}60`,
                  }} />
                </div>
              </div>
            ))}

            <div style={{
              marginTop:    8, padding:      "12px 14px",
              background:   "var(--bg-card2)",
              borderRadius: 10,
              border:       "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Win Rate Keseluruhan</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.winRate >= 50 ? "#10b981" : "#f59e0b" }}>
                {kpi.winRate}%
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {kpi.wonLeads} won dari {kpi.wonLeads + kpi.lostLeads} closed
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Radar Chart */}
        <ChartCard title="Radar Performa" sub="Top 5 sales comparison" minH={240}>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                <PolarGrid stroke="var(--chart-grid)" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--chart-text)" }} />
                <Radar name="Won"   dataKey="won"     stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Total" dataKey="total"   stroke="#4B9EF3" fill="#4B9EF3" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)", fontSize: 13 }}>
              Belum ada data performa
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Sales Performance ────────────────────────────── */}
      <ChartCard title="Leaderboard Sales" sub="Ranking performa tim berdasarkan revenue" minH={200}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {charts.salesPerformance.slice(0, 5).map((s, i) => {
            const isHov = hoveredSales === i
            const maxRev = Math.max(...charts.salesPerformance.map((x) => x.revenue), 1)
            const barW   = Math.round((s.revenue / maxRev) * 100)
            const medal  = ["🥇","🥈","🥉","4️⃣","5️⃣"][i]

            return (
              <div
                key={s.name}
                onMouseEnter={() => setHoveredSales(i)}
                onMouseLeave={() => setHoveredSales(null)}
                style={{
                  display:      "flex", alignItems: "center",
                  gap:          14, padding:    "12px 16px",
                  background:   isHov ? "var(--bg-hover)" : "var(--bg-card2)",
                  borderRadius: 12,
                  border:       `1px solid ${isHov ? "var(--primary)" : "var(--border)"}`,
                  cursor:       "default",
                  transition:   "all 0.2s",
                }}
              >
                {/* Medal */}
                <span style={{ fontSize: 20, flexShrink: 0 }}>{medal}</span>

                {/* Name */}
                <div style={{ width: 110, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {s.won} won · {s.total} total
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ height: 8, background: "var(--bg-card)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      width: `${barW}%`,
                      background: i === 0
                        ? "linear-gradient(90deg, #f59e0b, #f97316)"
                        : i === 1
                        ? "linear-gradient(90deg, #94a3b8, #64748b)"
                        : i === 2
                        ? "linear-gradient(90deg, #b45309, #92400e)"
                        : "linear-gradient(90deg, #4B9EF3, #1a6fd4)",
                      transition: "width 0.8s ease",
                      boxShadow: i === 0 ? "0 0 8px rgba(245,158,11,0.5)" : "none",
                    }} />
                  </div>
                  {/* Win rate dot */}
                  <div style={{ position: "absolute", right: 0, top: -18, fontSize: 10, color: "var(--text-muted)" }}>
                    {s.winRate}% win
                  </div>
                </div>

                {/* Revenue */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>
                    {formatRupiah(s.revenue)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}