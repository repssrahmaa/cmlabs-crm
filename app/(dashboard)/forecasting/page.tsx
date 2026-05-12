"use client"

import { useState, useEffect, useCallback } from "react"
import { useRealtimeDashboard }             from "@/hooks/useRealtimeDashboard"
import ForecastChart                        from "@/components/dashboard/ForecastChart"
import ForecastPipeline                     from "@/components/dashboard/ForecastPipeline"
import { format }                           from "date-fns"
import { id as localeId }                   from "date-fns/locale"

interface ForecastData {
  summary: {
    totalForecast:    number
    totalPipeline:    number
    bestCase:         number
    worstCase:        number
    activeLeadsCount: number
  }
  forecastLeads:     any[]
  historicalRevenue: { month: string; revenue: number; type: "actual" }[]
  projections:       { month: string; revenue: number; type: "projected" }[]
  forecastByStatus:  {
    status:        string
    totalValue:    number
    weightedValue: number
    count:         number
    probability:   number
  }[]
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value)
}

const STATUS_LABEL: Record<string, string> = {
  LEAD_IN:          "Lead Masuk",
  CONTACT_MADE:     "Dihubungi",
  NEEDS_IDENTIFIED: "Kebutuhan",
  PROPOSAL_MADE:    "Proposal",
  NEGOTIATION:      "Negosiasi",
  CONTRACT_SENT:    "Kontrak",
}

export default function ForecastingPage() {
  const [data, setData]           = useState<ForecastData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchForecast = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/forecast", {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Gagal memuat data")
      const d = await res.json()
      setData(d)
      setLastUpdated(new Date())
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchForecast()
  }, [fetchForecast])

  // Real-time via SSE
  const { connected } = useRealtimeDashboard({
    onForecastRefresh: fetchForecast,
    onLeadChange:      fetchForecast,
  })

  // Polling fallback setiap 60 detik
  useEffect(() => {
    const timer = setInterval(() => {
      if (!connected) fetchForecast()
    }, 60_000)
    return () => clearInterval(timer)
  }, [connected, fetchForecast])

  if (loading) {
    return (
      <div style={{
        display:        "flex",
        justifyContent: "center",
        alignItems:     "center",
        height:         "60vh",
        color:          "#64748b",
      }}>
        Memuat data forecasting...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{
        padding:      20,
        background:   "#fef2f2",
        borderRadius: 8,
        color:        "#dc2626",
        display:      "flex",
        gap:          12,
        alignItems:   "center",
      }}>
        {error || "Gagal memuat data"}
        <button
          onClick={fetchForecast}
          style={{
            padding:      "5px 12px",
            background:   "#fff",
            border:       "1px solid #fecaca",
            borderRadius: 6,
            cursor:       "pointer",
            fontSize:     13,
            color:        "#dc2626",
          }}
        >
          Coba lagi
        </button>
      </div>
    )
  }

  const { summary, forecastLeads, historicalRevenue, projections, forecastByStatus } = data

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{
        background:   "linear-gradient(135deg, #1e293b, #334155)",
        borderRadius: 12,
        padding:      24,
        color:        "#fff",
        display:      "flex",
        justifyContent: "space-between",
        alignItems:   "flex-start",
        flexWrap:     "wrap",
        gap:          12,
      }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
            Dashboard Forecasting
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
            Proyeksi revenue berdasarkan pipeline aktif
          </p>
        </div>

        {/* Realtime status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width:        8,
            height:       8,
            borderRadius: "50%",
            background:   connected ? "#10b981" : "#f59e0b",
            animation:    connected ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ fontSize: 12, color: connected ? "#10b981" : "#f59e0b" }}>
            {connected ? "Live" : "Offline"}
          </span>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "#64748b" }}>
              · {format(lastUpdated, "HH:mm:ss", { locale: localeId })}
            </span>
          )}
          <button
            onClick={fetchForecast}
            style={{
              padding:      "4px 10px",
              background:   "rgba(255,255,255,0.1)",
              border:       "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              color:        "#fff",
              fontSize:     11,
              cursor:       "pointer",
            }}
          >
            ↻
          </button>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap:                 16,
      }}>
        {[
          {
            label: "Weighted Forecast",
            value: formatRupiah(summary.totalForecast),
            sub:   "Estimasi realistis",
            color: "#2563eb",
          },
          {
            label: "Best Case",
            value: formatRupiah(summary.bestCase),
            sub:   "Jika semua leads win",
            color: "#059669",
          },
          {
            label: "Worst Case",
            value: formatRupiah(summary.worstCase),
            sub:   "Leads prob ≥ 65%",
            color: "#7c3aed",
          },
          {
            label: "Total Pipeline",
            value: formatRupiah(summary.totalPipeline),
            sub:   `${summary.activeLeadsCount} leads aktif`,
            color: "#0891b2",
          },
        ].map((card) => (
          <div key={card.label} style={{
background: "var(--bg-card)", // ← BUKAN #fff
borderRadius: 12,
padding: 20,
border: "1px solid var(--border)",
borderTop: `3px solid ${card.color}`,
}}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>
              {card.value}
            </div> 
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Forecast Chart ────────────────────────────────── */}
      <ForecastChart
        historical={historicalRevenue}
        projections={projections}
      />

      {/* ── Forecast by Status ───────────────────────────── */}
      <div style={{
        background:   "var(--bg-card)",
        borderRadius: 12,
        padding:      24,
        border:       "1px solid var(--border)",
      }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
          Weighted Forecast per Stage
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {forecastByStatus
            .sort((a, b) => b.weightedValue - a.weightedValue)
            .map((stage) => {
              const maxVal   = Math.max(...forecastByStatus.map((s) => s.weightedValue), 1)
              const barWidth = Math.round((stage.weightedValue / maxVal) * 100)

              return (
                <div key={stage.status}>
                  <div style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    marginBottom:   4,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                        {STATUS_LABEL[stage.status] ?? stage.status}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {stage.count} leads · {stage.probability}%
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>
                        {formatRupiah(stage.weightedValue)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>
                        dari {formatRupiah(stage.totalValue)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "var(--bg-card2)", borderRadius: 999 }}>
                    <div style={{
                      height:       "100%",
                      borderRadius: 999,
                      width:        `${barWidth}%`,
                      background:   "linear-gradient(90deg, #2563eb, #7c3aed)",
                      transition:   "width 0.5s ease",
                    }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* ── Pipeline Forecast Table ───────────────────────── */}
      <ForecastPipeline leads={forecastLeads} />
    </div>
  )
}