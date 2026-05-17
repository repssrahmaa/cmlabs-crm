"use client"

import { useState, useEffect, useCallback } from "react"
import { useRealtimeDashboard } from "./useRealtimeDashboard"

export interface DashboardData {
  kpi: {
    totalLeads:    number
    DEALLeads:      number
    RECYCLELeads:     number
    activeLeads:   number
    totalRevenue:  number
    pipelineValue: number
    winRate:       number
  }
  charts: {
    leadsByStatus:    { status: string; _count: number }[]
    monthlyData:      { month: string; created: number; DEAL: number }[]
    monthlyRevenue:   { month: string; revenue: number }[]
    salesPerformance: {
      name:    string
      role:    string
      total:   number
      DEAL:     number
      winRate: number
      revenue: number
    }[]
    leadsByPriority: { priority: string; _count: number }[]
  }
}

export function useDashboard() {
  const [data, setData]               = useState<DashboardData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      // ✅ Tidak kirim filter — API sudah handle semua role lihat semua data
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error ?? "Gagal ambil data")
      }
      const d = await res.json()
      setData(d)
      setLastUpdated(new Date())
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const { connected } = useRealtimeDashboard({
    onDashboardRefresh: fetchDashboard,
    onLeadChange:       fetchDashboard,
  })

  // Polling fallback
  useEffect(() => {
    const timer = setInterval(() => {
      if (!connected) fetchDashboard()
    }, 60_000)
    return () => clearInterval(timer)
  }, [connected, fetchDashboard])

  return { data, loading, error, lastUpdated, connected, refetch: fetchDashboard }
}