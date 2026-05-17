"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession }                       from "next-auth/react"
import { useRealtimeDashboard }             from "@/hooks/useRealtimeDashboard"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

const MONTHS  = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
const CUR_YEAR = new Date().getFullYear()
const YEARS   = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(v)
}

function CTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-lg)",
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 2 }}>
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

export default function PersonalPerformancePage() {
  const { data: session }         = useSession()
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<"overview"|"pipeline"|"activity">("overview")

  // Filter state
  const [year,  setYear]  = useState(String(CUR_YEAR))
  const [month, setMonth] = useState("all")
  const [view,  setView]  = useState<"monthly"|"yearly">("monthly")

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year, month, view })
      const res = await fetch(`/api/reports/personal?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Gagal memuat data")
      setData(await res.json())
    } catch {}
    finally { setLoading(false) }
  }, [year, month, view])

  useEffect(() => { fetchData() }, [fetchData])
  useRealtimeDashboard({ onDashboardRefresh: fetchData, onLeadChange: fetchData })

  const role = session?.user?.role

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  if (!data) return null

  const { kpi, charts } = data
  const trendData       = view === "yearly" ? charts.yearlyTrend : charts.monthlyPersonal

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Profile Hero ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, var(--hero-from,#0f172a), var(--hero-mid,#1e293b), var(--hero-to,#1e3a5f))",
        borderRadius: 20, padding: "22px 28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"#4B9EF3", opacity:0.07, pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16, flexWrap:"wrap" }}>
            <div style={{
              width:50, height:50, borderRadius:14,
              background: "linear-gradient(135deg, #4B9EF3, #1a6fd4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, fontWeight:900, color:"#fff",
              boxShadow: "0 4px 16px rgba(75,158,243,0.5)",
            }}>
              {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ margin:"0 0 3px", fontSize:18, fontWeight:800, color:"#f8fafc" }}>
                {session?.user?.name}
              </h1>
              <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                {role === "SALES_MANAGER" ? "Sales Manager" : "Account Executive"}
              </p>
            </div>
          </div>

          {/* Quick KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10 }}>
            {[
              { l:"Total Lead",  v:kpi.totalLeads,               c:"#4B9EF3" },
              { l:"Deal",        v:kpi.wonLeads,                 c:"#34d399" },
              { l:"Win Rate",    v:`${kpi.winRate}%`,            c:"#a78bfa" },
              { l:"Revenue",     v:formatRp(kpi.totalRevenue),   c:"#fbbf24" },
              { l:"Tugas Selesai", v:`${kpi.taskCompletionRate}%`, c:"#fb923c" },
            ].map((s) => (
              <div key={s.l} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginBottom:3 }}>{s.l}</div>
                <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Global Filter Bar ─────────────────────────────── */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"12px 16px", background:"var(--bg-card)",
        borderRadius:12, border:"1px solid var(--border)",
        flexWrap:"wrap", gap:10,
      }}>
        <h3 style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>
          Filter Periode
        </h3>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {/* View mode */}
          <div style={{ display:"flex", gap:4, padding:3, background:"var(--bg-card2)", borderRadius:8, border:"1px solid var(--border)" }}>
            {[{ v:"monthly", l:"Bulanan" },{ v:"yearly", l:"Tahunan" }].map((m) => (
              <button key={m.v} onClick={() => setView(m.v as any)} style={{
                padding:"4px 12px",
                background: view === m.v ? "var(--primary)" : "transparent",
                color: view === m.v ? "#fff" : "var(--text-muted)",
                border:"none", borderRadius:5, fontSize:11, fontWeight:600, cursor:"pointer",
              }}>
                {m.l}
              </button>
            ))}
          </div>

          <select value={year} onChange={(e) => setYear(e.target.value)} style={{
            padding:"5px 10px", background:"var(--bg-card2)", color:"var(--text-secondary)",
            border:"1px solid var(--border)", borderRadius:6, fontSize:11, cursor:"pointer",
          }}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          {view === "monthly" && (
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{
              padding:"5px 10px", background:"var(--bg-card2)", color:"var(--text-secondary)",
              border:"1px solid var(--border)", borderRadius:6, fontSize:11, cursor:"pointer",
            }}>
              <option value="all">Semua Bulan</option>
              {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────── */}
      <div style={{ display:"flex", gap:4, padding:4, background:"var(--bg-card2)", borderRadius:12, border:"1px solid var(--border)" }}>
        {[
          { k:"overview",  l:"Overview"      },
          { k:"pipeline",  l:"Pipeline"      },
          { k:"activity",  l:"Aktivitas"     },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as any)} style={{
            flex:1, padding:"9px 14px",
            background: tab === t.k ? "var(--bg-card)" : "transparent",
            border:"none", borderRadius:9,
            fontSize:12, fontWeight: tab === t.k ? 700 : 500,
            color: tab === t.k ? "var(--primary)" : "var(--text-muted)",
            cursor:"pointer", transition:"all 0.15s",
            boxShadow: tab === t.k ? "var(--shadow-xs)" : "none",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ────────────────────────────────── */}
      {tab === "overview" && (
        <>
          {/* KPI Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12 }}>
            {[
              { l:"Total Lead",    v:kpi.totalLeads,               c:"var(--primary)", sub:`${kpi.activeLeads} aktif`  },
              { l:"Deal (Won)",    v:kpi.wonLeads,                 c:"var(--success)", sub:`Win rate ${kpi.winRate}%`  },
              { l:"Total Revenue", v:formatRp(kpi.totalRevenue),   c:"var(--purple)",  sub:`Avg ${formatRp(kpi.avgDealSize)}` },
              { l:"Pipeline",      v:formatRp(kpi.pipelineValue),  c:"var(--warning)", sub:`${kpi.activeLeads} aktif`  },
            ].map((s) => (
              <div key={s.l} style={{
                background:"var(--bg-card)", borderRadius:12, padding:"16px 18px",
                border:"1px solid var(--border)", boxShadow:"var(--shadow-xs)",
                borderTop:`3px solid ${s.c}`,
              }}>
                <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:600 }}>{s.l}</div>
                <div style={{ fontSize:22, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Trend Chart dengan filter */}
          <div style={{ background:"var(--bg-card)", borderRadius:16, padding:20, border:"1px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div>
                <h3 style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>
                  Tren Performa — {view === "yearly" ? "Per Tahun" : `${MONTHS[Number(month)-1] ?? "Semua Bulan"} ${year}`}
                </h3>
                <p style={{ margin:0, fontSize:11, color:"var(--text-muted)" }}>
                  {view === "yearly" ? "Perbandingan antar tahun" : "Lead masuk, deal, dan revenue per bulan"}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData ?? []} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <defs>
                  {[["c","#4B9EF3"],["d","#10b981"],["r","#8b5cf6"]].map(([id,c]) => (
                    <linearGradient key={id} id={`pg${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey={view === "yearly" ? "year" : "month"} tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CTooltip />} />
                <Legend wrapperStyle={{ fontSize:11, color:"var(--text-secondary)" }} />
                <Area type="monotone" dataKey="created" name="Lead Masuk"  stroke="#4B9EF3" strokeWidth={2.5} fill="url(#pgc)" dot={{ r:3, fill:"#4B9EF3", strokeWidth:0 }} />
                <Area type="monotone" dataKey="won"     name="Deal"        stroke="#10b981" strokeWidth={2.5} fill="url(#pgd)" dot={{ r:3, fill:"#10b981", strokeWidth:0 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue"     stroke="#8b5cf6" strokeWidth={2.5} fill="url(#pgr)" dot={{ r:3, fill:"#8b5cf6", strokeWidth:0 }}
                  yAxisId={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue bar per bulan */}
          <div style={{ background:"var(--bg-card)", borderRadius:16, padding:20, border:"1px solid var(--border)" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>Revenue per Bulan</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts.monthlyPersonal ?? []} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatRp(v)} />
                <Tooltip content={<CTooltip fmt={formatRp} />} />
                <Bar dataKey="revenue" name="Revenue" radius={[5,5,0,0]} maxBarSize={32}>
                  {(charts.monthlyPersonal ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={`hsl(${210+i*8}, 70%, 55%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── TAB: PIPELINE ─────────────────────────────────── */}
      {tab === "pipeline" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"var(--bg-card)", borderRadius:16, padding:20, border:"1px solid var(--border)" }}>
            <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>Pipeline per Stage</h3>
            <p style={{ margin:"0 0 20px", fontSize:11, color:"var(--text-muted)" }}>Distribusi nilai dan jumlah lead aktif</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {(charts.pipelineByStatus ?? []).map((stage: any) => {
                const max = Math.max(...(charts.pipelineByStatus ?? []).map((s: any) => s.value), 1)
                const w   = Math.round((stage.value / max) * 100)
                const c   = stage.color ?? "#4B9EF3"
                return (
                  <div key={stage.status}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:c }} />
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{stage.status}</span>
                        <span style={{ fontSize:11, padding:"1px 7px", borderRadius:999, background:c+"18", color:c }}>{stage.count} lead</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:c }}>{formatRp(stage.value)}</span>
                    </div>
                    <div style={{ height:8, background:"var(--bg-card2)", borderRadius:999, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${w}%`, background:c, borderRadius:999, transition:"width .8s ease" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ACTIVITY ─────────────────────────────────── */}
      {tab === "activity" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"var(--bg-card)", borderRadius:16, padding:20, border:"1px solid var(--border)" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>Aktivitas per Tipe</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={Object.entries(charts.activityByType ?? {}).map(([type, count]) => ({ name: type.replace("_"," "), value: count }))}
                margin={{ top:4, right:4, left:-10, bottom:0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" tick={{ fontSize:9, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CTooltip />} />
                <Bar dataKey="value" name="Jumlah" radius={[5,5,0,0]} maxBarSize={36}>
                  {Object.keys(charts.activityByType ?? {}).map((_,i) => (
                    <Cell key={i} fill={["#6366f1","#4B9EF3","#0891b2","#10b981","#f59e0b"][i%5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:"var(--bg-card)", borderRadius:16, padding:20, border:"1px solid var(--border)" }}>
            <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>Task Completion</h3>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <div style={{ position:"relative", width:130, height:130 }}>
                <PieChart width={130} height={130}>
                  <Pie data={[
                    { name:"Selesai", value: kpi.completedTasks, fill:"var(--success)" },
                    { name:"Pending", value: Math.max(kpi.totalTasks-kpi.completedTasks,0), fill:"var(--bg-card2)" },
                  ]} cx={60} cy={60} innerRadius={40} outerRadius={56}
                    dataKey="value" paddingAngle={4} strokeWidth={0}
                    startAngle={90} endAngle={-270}
                  >
                    <Cell fill="var(--success)" />
                    <Cell fill="var(--border)" />
                  </Pie>
                </PieChart>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"var(--success)" }}>{kpi.taskCompletionRate}%</div>
                  <div style={{ fontSize:9, color:"var(--text-muted)" }}>Selesai</div>
                </div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { l:"Total Tugas",  v:kpi.totalTasks,       c:"var(--primary)" },
                { l:"Selesai",      v:kpi.completedTasks,   c:"var(--success)" },
                { l:"Pending",      v:kpi.totalTasks-kpi.completedTasks, c:"var(--warning)" },
                { l:"Semua Aktivitas", v:kpi.totalActivities, c:"var(--purple)" },
              ].map((s) => (
                <div key={s.l} style={{ background:"var(--bg-card2)", borderRadius:8, padding:"10px 12px", border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:3 }}>{s.l}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}