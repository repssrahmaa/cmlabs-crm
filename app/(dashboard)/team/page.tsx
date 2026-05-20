"use client"

import { useState, useEffect, useCallback } from "react"
import { useRoleGuard }                     from "@/hooks/useRoleGuard"
import { useAccessNotice, AccessToast, AccessBanner } from "@/components/ui/AccessNotice"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { STATUS_LABEL, STATUS_COLOR }       from "@/types/lead"

const MONTHS   = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
const CUR_YEAR = new Date().getFullYear()
const YEARS    = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact" }).format(v)
}

// ── SVG Icons ──────────────────────────────────────────────────
const IconChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

function CTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:"var(--bg-card)", border:"1px solid var(--border)",
      borderRadius:10, padding:"10px 14px", boxShadow:"var(--shadow-lg)", minWidth:130,
    }}>
      <p style={{ margin:"0 0 6px", fontSize:10, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:3 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:p.color??p.fill }} />
            <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{p.name}</span>
          </div>
          <span style={{ fontSize:11, fontWeight:700, color:"var(--text-primary)" }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Sales Detail Modal ─────────────────────────────────────────
function SalesDetailModal({ userId, userName, userRole, onClose }: {
  userId:   string
  userName: string
  userRole: string
  onClose:  () => void
}) {
  const [year,     setYear]     = useState(String(new Date().getFullYear()))
  const [month,    setMonth]    = useState("all")
  const [data,     setData]     = useState<any>(null)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<"all"|"deal"|"recycle">("all")

  const YEARS  = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

  const STATUS_COLOR: Record<string, string> = {
    APPROACH:"#6366f1", COLD_LEAD:"#3b82f6", DECK_REQUEST:"#f59e0b",
    MEETING:"#8b5cf6", DEAL:"#10b981", RECYCLE:"#ef4444",
  }
  const STATUS_LABEL: Record<string, string> = {
    APPROACH:"Approach", COLD_LEAD:"Cold Lead", DECK_REQUEST:"Deck Request",
    MEETING:"Meeting", DEAL:"Deal", RECYCLE:"Recycle",
  }

  // ── Fetch dari endpoint sales detail ─────────────────────────
  useEffect(() => {
    setLoading(true)
    // Ambil dari dashboard stats dengan filter sales ID
    const params = new URLSearchParams({
      year, month, section: "sales",
    })
    fetch(`/api/dashboard/stats?${params}`)
      .then((r) => r.json())
      .then((d) => {
        const allSales = d.charts?.salesPerformance ?? []
        const found    = allSales.find((s: any) => s.id === userId)
        setData(found ?? null)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [userId, year, month])

  function formatRp(v: number) {
    return new Intl.NumberFormat("id-ID", {
      style:"currency", currency:"IDR", notation:"compact",
    }).format(v)
  }

  const leads        = data?.leads ?? []
  const wonLeads     = leads.filter((l: any) => l.status === "DEAL")
  const recycleLeads = leads.filter((l: any) => l.status === "RECYCLE")
  const revenue      = wonLeads.reduce((s: number, l: any) => s + Number(l.value ?? 0), 0)
  const winRate      = (wonLeads.length + recycleLeads.length) > 0
    ? Math.round((wonLeads.length / (wonLeads.length + recycleLeads.length)) * 100) : 0

  const byStatus = leads.reduce((acc: any, l: any) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1; return acc
  }, {} as Record<string, number>)

  const filteredLeads = tab === "all"     ? leads
    : tab === "deal"    ? wonLeads
    : recycleLeads

  const ROLE_LABEL: Record<string, string> = {
    SALES_MANAGER:"Sales Manager", ACCOUNT_EXECUTIVE:"Account Executive",
  }

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background:"var(--bg-card)", borderRadius:16, padding:0,
        width:"100%", maxWidth:680, maxHeight:"90vh",
        border:"1px solid var(--border)", boxShadow:"var(--shadow-xl)",
        display:"flex", flexDirection:"column",
        animation:"scaleIn .22s ease",
      }}>

        {/* Modal Header */}
        <div style={{
          padding:"18px 22px 14px",
          borderBottom:"1px solid var(--border)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexShrink:0,
        }}>
          <div>
            <h3 style={{ margin:"0 0 3px", fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>
              Detail Performa — {userName}
            </h3>
            <p style={{ margin:0, fontSize:12, color:"var(--text-muted)" }}>
              {ROLE_LABEL[userRole] ?? userRole}
            </p>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Filter */}
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{
              padding:"5px 9px", background:"var(--bg-card2)", color:"var(--text-secondary)",
              border:"1px solid var(--border)", borderRadius:7, fontSize:11, cursor:"pointer",
            }}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{
              padding:"5px 9px", background:"var(--bg-card2)", color:"var(--text-secondary)",
              border:"1px solid var(--border)", borderRadius:7, fontSize:11, cursor:"pointer",
            }}>
              <option value="all">Semua Bulan</option>
              {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
            </select>
            <button onClick={onClose} style={{
              width:32, height:32, borderRadius:8,
              background:"var(--bg-card2)", border:"1px solid var(--border)",
              cursor:"pointer", color:"var(--text-muted)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            }}>
              &times;
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>
          {loading ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text-muted)" }}>
              Memuat data...
            </div>
          ) : !data ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text-muted)" }}>
              Tidak ada data untuk periode ini
            </div>
          ) : (
            <>
              {/* KPI strip — semua dari data.leads yang sudah difilter API */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginBottom:18 }} className="grid-4">
                {[
                  { l:"Total Lead", v:leads.length,   c:"var(--primary)" },
                  { l:"Deal",       v:wonLeads.length, c:"var(--success)" },
                  { l:"Recycle",    v:recycleLeads.length, c:"var(--danger)" },
                  { l:"Revenue",    v:formatRp(revenue), c:"var(--purple)" },
                ].map((s) => (
                  <div key={s.l} style={{
                    background:"var(--bg-card2)", borderRadius:10,
                    padding:"12px 14px", border:"1px solid var(--border)",
                    borderTop:`2px solid ${s.c}`,
                  }}>
                    <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:3, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.l}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Win rate + Status distribusi */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }} className="grid-2">

                {/* Win Rate visual */}
                <div style={{ background:"var(--bg-card2)", borderRadius:12, padding:16, border:"1px solid var(--border)" }}>
                  <p style={{ margin:"0 0 12px", fontSize:12, fontWeight:600, color:"var(--text-secondary)" }}>Win Rate</p>
                  {[
                    { l:"Deal",    v:wonLeads.length,    c:"var(--success)", total:leads.length },
                    { l:"Aktif",   v:leads.length - wonLeads.length - recycleLeads.length, c:"var(--primary)", total:leads.length },
                    { l:"Recycle", v:recycleLeads.length, c:"var(--danger)", total:leads.length },
                  ].map((s) => {
                    const pct = s.total > 0 ? Math.round((s.v / s.total) * 100) : 0
                    return (
                      <div key={s.l} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{s.l}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:s.c }}>{s.v} ({pct}%)</span>
                        </div>
                        <div style={{ height:6, background:"var(--bg-card)", borderRadius:999, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:s.c, borderRadius:999, transition:"width .8s ease" }} />
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ textAlign:"center", marginTop:12, paddingTop:10, borderTop:"1px solid var(--border-light)" }}>
                    <span style={{ fontSize:24, fontWeight:900, color:"var(--success)" }}>{winRate}%</span>
                    <span style={{ fontSize:11, color:"var(--text-muted)", marginLeft:5 }}>Win Rate</span>
                  </div>
                </div>

                {/* Status distribusi */}
                <div style={{ background:"var(--bg-card2)", borderRadius:12, padding:16, border:"1px solid var(--border)" }}>
                  <p style={{ margin:"0 0 12px", fontSize:12, fontWeight:600, color:"var(--text-secondary)" }}>Distribusi Status</p>
                  {Object.entries(byStatus).length === 0 ? (
                    <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", paddingTop:20 }}>Tidak ada lead</p>
                  ) : (
                    Object.entries(byStatus)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([status, count]) => {
                        const c   = STATUS_COLOR[status] ?? "#94a3b8"
                        const l   = STATUS_LABEL[status] ?? status
                        const pct = leads.length > 0 ? Math.round(((count as number) / leads.length) * 100) : 0
                        return (
                          <div key={status} style={{ marginBottom:8 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                <div style={{ width:7, height:7, borderRadius:2, background:c }} />
                                <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{l}</span>
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, color:c }}>{count as number}</span>
                            </div>
                            <div style={{ height:5, background:"var(--bg-card)", borderRadius:999, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:c, borderRadius:999 }} />
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              </div>

              {/* Tab filter leads */}
              <div style={{ display:"flex", gap:4, padding:4, background:"var(--bg-card2)", borderRadius:10, border:"1px solid var(--border)", marginBottom:12 }}>
                {([
                  { k:"all"    as const, l:`Semua (${leads.length})`        },
                  { k:"deal"   as const, l:`Deal (${wonLeads.length})`      },
                  { k:"recycle"as const, l:`Recycle (${recycleLeads.length})` },
                ]).map((t) => (
                  <button key={t.k} onClick={() => setTab(t.k)} style={{
                    flex:1, padding:"7px 10px",
                    background: tab === t.k ? "var(--bg-card)" : "transparent",
                    border:"none", borderRadius:7,
                    fontSize:12, fontWeight: tab === t.k ? 700 : 500,
                    color: tab === t.k
                      ? t.k === "deal" ? "var(--success)" : t.k === "recycle" ? "var(--danger)" : "var(--primary)"
                      : "var(--text-muted)",
                    cursor:"pointer", transition:"all .15s",
                    boxShadow: tab === t.k ? "var(--shadow-xs)" : "none",
                  }}>
                    {t.l}
                  </button>
                ))}
              </div>

              {/* Lead list */}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {filteredLeads.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"24px 0", color:"var(--text-muted)", fontSize:13 }}>
                    Tidak ada data
                  </div>
                ) : filteredLeads.map((lead: any) => {
                  const sc     = STATUS_COLOR[lead.status] ?? "#94a3b8"
                  const sl     = STATUS_LABEL[lead.status] ?? lead.status
                  const isDeal = lead.status === "DEAL"
                  return (
                    <div key={lead.id} style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"11px 14px",
                      background: isDeal ? "rgba(16,185,129,0.05)" : "var(--bg-card2)",
                      borderRadius:10,
                      border:`1px solid ${isDeal ? "rgba(16,185,129,0.15)" : "var(--border)"}`,
                    }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:sc, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {lead.title}
                        </div>
                        <div style={{ fontSize:10, color:"var(--text-muted)" }}>
                          {lead.clientName}{lead.clientCompany ? ` — ${lead.clientCompany}` : ""}
                        </div>
                      </div>
                      <span style={{
                        fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:999,
                        background:sc+"18", color:sc, flexShrink:0,
                      }}>
                        {sl}
                      </span>
                      {lead.value && (
                        <span style={{ fontSize:11, fontWeight:700, color: isDeal ? "var(--success)" : "var(--text-muted)", flexShrink:0 }}>
                          {formatRp(Number(lead.value))}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes scaleIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

// ── Main Team Page ─────────────────────────────────────────────
export default function TeamPage() {
  const { role, is }               = useRoleGuard()
  const { notice, showNotice, hideNotice } = useAccessNotice()
  const isReadOnly = is("EXECUTIVE")
  const canDelete  = is("SUPER_ADMIN")
  const canEdit    = is("SUPER_ADMIN", "SALES_MANAGER")

  const [users,       setUsers]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  const [selectedUser, setSelectedUser] = useState<{ id:string; name:string; role:string } | null>(null)
  const [showModal,   setShowModal]   = useState(false)
  const [editUser,    setEditUser]    = useState<any>(null)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState("")
  const [year,        setYear]        = useState(String(CUR_YEAR))
  const [month,       setMonth]       = useState("all")
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"ACCOUNT_EXECUTIVE", phone:"" })

  async function fetchUsers() {
    try {
      const res  = await fetch("/api/users")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  // Build chart data
  const roleDistrib = Object.entries(
    users.reduce((acc: any, u) => { acc[u.role]=(acc[u.role]??0)+1; return acc }, {})
  ).map(([role, count]) => ({
    name: role === "SUPER_ADMIN" ? "Super Admin" : role === "EXECUTIVE" ? "Executive" : role === "SALES_MANAGER" ? "Sales Manager" : role === "ACCOUNT_EXECUTIVE" ? "AE" : "Viewer",
    value: count as number,
    color: { SUPER_ADMIN:"#dc2626", EXECUTIVE:"#7c3aed", SALES_MANAGER:"#3b82f6", ACCOUNT_EXECUTIVE:"#10b981", VIEWER:"#94a3b8" }[role] ?? "#94a3b8",
  }))

  const [salesChartData, setSalesChartData] = useState<any[]>([])
  const [chartLoading,   setChartLoading]   = useState(false)

  const salesBarData = salesChartData.map((u: any) => ({
    name:    u.name.split(" ")[0],
    leads:   u.total,
    deal:    u.won,
    recycle: u.lost,
  }))

  const fetchSalesChart = useCallback(async () => {
    setChartLoading(true)
    try {
      const res = await fetch(
        `/api/dashboard/stats?year=${year}&month=${month}&section=sales`,
        { cache: "no-store" }
      )
      const d = await res.json()
      setSalesChartData(d.charts?.salesPerformance ?? [])
    } catch {}
    finally { setChartLoading(false) }
  }, [year, month])

  // Fetch saat filter berubah
  useEffect(() => {
    fetchSalesChart()
  }, [year, month, fetchSalesChart])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isReadOnly) return
    setSaving(true); setError("")
    try {
      const url    = editUser ? `/api/users/${editUser.id}` : "/api/users"
      const method = editUser ? "PUT" : "POST"
      const body: any = { ...form }
      if (editUser && !body.password) delete body.password
      const res  = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Gagal"); return }
      await fetchUsers()
      setShowModal(false)
    } finally { setSaving(false) }
  }

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN:"Super Admin", EXECUTIVE:"Executive",
    SALES_MANAGER:"Sales Manager", ACCOUNT_EXECUTIVE:"Account Executive", VIEWER:"Viewer",
  }
  const ROLE_COLOR: Record<string, string> = {
    SUPER_ADMIN:"#dc2626", EXECUTIVE:"#7c3aed", SALES_MANAGER:"#3b82f6",
    ACCOUNT_EXECUTIVE:"#10b981", VIEWER:"#94a3b8",
  }

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
      <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:"var(--primary)", animation:"spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {isReadOnly && (
        <AccessBanner type="readonly" role="Executive" message="Anda dapat melihat semua data tim dan visualisasi performa, namun tidak dapat melakukan perubahan." />
      )}

      {/* ── Header Stats ────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:12 }} className="grid-4">
        {["SUPER_ADMIN","EXECUTIVE","SALES_MANAGER","ACCOUNT_EXECUTIVE","VIEWER"].map((r) => {
          const count = users.filter((u) => u.role === r).length
          const c     = ROLE_COLOR[r]
          return (
            <div key={r} style={{
              background:"var(--bg-card)", borderRadius:12, padding:"14px 16px",
              border:"1px solid var(--border)", borderTop:`3px solid ${c}`,
              boxShadow:"var(--shadow-xs)",
            }}>
              <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                {ROLE_LABEL[r]}
              </div>
              <div style={{ fontSize:24, fontWeight:800, color:c }}>{count}</div>
            </div>
          )
        })}
      </div>

      {/* ── Visualisasi Charts — visible untuk Executive ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="grid-2">

        {/* Distribusi Role */}
        <div style={{ background:"var(--bg-card)", borderRadius:14, padding:"16px 18px", border:"1px solid var(--border)", boxShadow:"var(--shadow-xs)" }}>
          <h3 style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>Distribusi Role Tim</h3>
          <p style={{ margin:"0 0 14px", fontSize:11, color:"var(--text-muted)" }}>Komposisi anggota berdasarkan role</p>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <PieChart width={120} height={120}>
              <Pie data={roleDistrib} cx={55} cy={55} innerRadius={32} outerRadius={50} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {roleDistrib.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
              {roleDistrib.map((d) => (
                <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                    <span style={{ fontSize:11, color:"var(--text-secondary)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Lead per Sales */}
        <div style={{ background:"var(--bg-card)", borderRadius:14, padding:"16px 18px", border:"1px solid var(--border)", boxShadow:"var(--shadow-xs)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:8 }}>
            <div>
              <h3 style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>Lead per Sales</h3>
              <p style={{ margin:0, fontSize:11, color:"var(--text-muted)" }}>Jumlah lead yang ditangani</p>
            </div>
            <div style={{ display:"flex", gap:5 }}>
              <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding:"4px 8px", background:"var(--bg-card2)", color:"var(--text-secondary)", border:"1px solid var(--border)", borderRadius:6, fontSize:10, cursor:"pointer" }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding:"4px 8px", background:"var(--bg-card2)", color:"var(--text-secondary)", border:"1px solid var(--border)", borderRadius:6, fontSize:10, cursor:"pointer" }}>
                <option value="all">Semua</option>
                {MONTHS.map((m,i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={chartLoading ? [] : salesBarData}
              margin={{ top:2, right:4, left:-10, bottom:0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CTooltip />} />
              <Legend wrapperStyle={{ fontSize:11, color:"var(--text-secondary)" }} />
              <Bar dataKey="leads"   name="Total Lead" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={26} />
              <Bar dataKey="deal"    name="Deal"       fill="#10b981" radius={[4,4,0,0]} maxBarSize={26} />
              <Bar dataKey="recycle" name="Recycle"    fill="#ef4444" radius={[4,4,0,0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Table Header ────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>
          Daftar Anggota Tim ({users.length})
        </h3>
        {!isReadOnly && (
          <button
            onClick={() => { setEditUser(null); setForm({ name:"", email:"", password:"", role:"ACCOUNT_EXECUTIVE", phone:"" }); setShowModal(true) }}
            style={{
              padding:"9px 18px",
              background:"linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color:"#fff", border:"none", borderRadius:9,
              fontSize:12, fontWeight:600, cursor:"pointer",
              boxShadow:"var(--shadow-primary)",
            }}
          >
            + Tambah Anggota
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────── */}
      <div style={{ background:"var(--bg-card)", borderRadius:14, border:"1px solid var(--border)", overflow:"hidden", boxShadow:"var(--shadow-xs)" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Nama","Role","Email","Telepon","Lead","Status","Aksi"].map((h) => (
                  <th key={h} style={{ padding:"11px 16px", textAlign:"left", background:"var(--table-head)", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const c = ROLE_COLOR[user.role] ?? "#94a3b8"
                return (
                  <tr key={user.id} style={{ borderTop:"1px solid var(--table-border)", background: i%2===0 ? "var(--table-odd)" : "var(--table-even)", transition:"background .1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background="var(--table-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = i%2===0 ? "var(--table-odd)" : "var(--table-even)"}
                  >
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{
                          width:34, height:34, borderRadius:10,
                          background:c+"20", color:c,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:13, fontWeight:700, flexShrink:0,
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:999, background:c+"18", color:c }}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-secondary)" }}>{user.email}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-secondary)" }}>{user.phone ?? "-"}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"var(--primary)" }}>
                      {user._count?.assignedLeads ?? 0}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{
                        fontSize:11, fontWeight:600, padding:"2px 9px", borderRadius:999,
                        background: user.isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                        color: user.isActive ? "var(--success)" : "var(--danger)",
                      }}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        {/* Tombol detail — visible untuk semua termasuk executive */}
                        {["SALES_MANAGER","ACCOUNT_EXECUTIVE"].includes(user.role) && (
  <button
    onClick={() => setSelectedUser({ id: user.id, name: user.name, role: user.role })}
    style={{
      padding:"5px 12px",
      background:"var(--primary-pale)", color:"var(--primary)",
      border:"1px solid var(--primary-glow)",
      borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer",
      display:"flex", alignItems:"center", gap:4,
    }}
  >
    Performa
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </button>
)}

{selectedUser && (
  <SalesDetailModal
    userId={selectedUser.id}
    userName={selectedUser.name}
    userRole={selectedUser.role}
    onClose={() => setSelectedUser(null)}
  />
                        )}
                        {!isReadOnly && canEdit && (
                          <button
                            onClick={() => { setEditUser(user); setForm({ name:user.name, email:user.email, password:"", role:user.role, phone:user.phone??""  }); setError(""); setShowModal(true) }}
                            style={{ padding:"5px 10px", background:"var(--bg-card2)", color:"var(--text-secondary)", border:"1px solid var(--border)", borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer" }}
                          >
                            Edit
                          </button>
                        )}
                        {!isReadOnly && (
                          <button
                            onClick={async () => { if(!confirm("Nonaktifkan?")) return; await fetch(`/api/users/${user.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ isActive:!user.isActive }) }); fetchUsers() }}
                            style={{
                              padding:"5px 10px",
                              background: user.isActive ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                              color: user.isActive ? "var(--warning)" : "var(--success)",
                              border:`1px solid ${user.isActive ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
                              borderRadius:7, fontSize:11, fontWeight:600, cursor:"pointer",
                            }}
                          >
                            {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        )}
                        {!isReadOnly && canDelete && (
                          <button
                            onClick={async () => { if(!confirm("Hapus?")) return; await fetch(`/api/users/${user.id}`, { method:"DELETE" }); fetchUsers() }}
                            style={{ padding:"5px 10px", background:"var(--danger-pale)", color:"var(--danger)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:7, fontSize:11, cursor:"pointer" }}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add/Edit Modal ───────────────────────────────── */}
      {showModal && !isReadOnly && (
        <div onClick={() => setShowModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:"var(--bg-card)", borderRadius:16, padding:26, width:"100%", maxWidth:460, border:"1px solid var(--border)", boxShadow:"var(--shadow-xl)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>
                {editUser ? "Edit Anggota" : "Tambah Anggota"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:20 }}>&times;</button>
            </div>
            {error && <div style={{ marginBottom:14, padding:"10px 14px", background:"var(--danger-pale)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:"var(--danger)" }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Nama Lengkap", key:"name",  type:"text"    },
                { label:"Email",        key:"email", type:"email"   },
                { label: editUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password", key:"password", type:"password" },
                { label:"No. Telepon",  key:"phone", type:"text"    },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--text-muted)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</label>
                  <input
                    type={type}
                    required={key !== "phone" && !(editUser && key === "password")}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]:e.target.value }))}
                    style={{ width:"100%", padding:"9px 12px", background:"var(--input-bg)", color:"var(--input-text)", border:"1px solid var(--input-border)", borderRadius:9, fontSize:13, boxSizing:"border-box" }}
                  />
                </div>
              ))}
              {is("SUPER_ADMIN") && (
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--text-muted)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role:e.target.value }))} style={{ width:"100%", padding:"9px 12px", background:"var(--input-bg)", color:"var(--input-text)", border:"1px solid var(--input-border)", borderRadius:9, fontSize:13 }}>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="SALES_MANAGER">Sales Manager</option>
                    <option value="ACCOUNT_EXECUTIVE">Account Executive</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
              )}
              <button type="submit" disabled={saving} style={{ padding:"11px", background: saving ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: saving ? "var(--text-muted)" : "#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:600, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Menyimpan..." : editUser ? "Simpan Perubahan" : "Tambah Anggota"}
              </button>
            </form>
          </div>
        </div>
      )}

{selectedUser && (
  <SalesDetailModal
    userId={selectedUser.id}
    userName={selectedUser.name}
    userRole={selectedUser.role}
    onClose={() => setSelectedUser(null)}
  />
)}

      <AccessToast type={notice.type} message={notice.message} show={notice.show} onClose={hideNotice} />
    </div>
  )
}