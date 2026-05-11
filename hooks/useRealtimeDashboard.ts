"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseRealtimeDashboardOptions {
  onLeadChange?:       () => void
  onActivityChange?:   () => void
  onDashboardRefresh?: () => void
  onForecastRefresh?:  () => void
  enabled?:            boolean
}

export function useRealtimeDashboard({
  onLeadChange,
  onActivityChange,
  onDashboardRefresh,
  onForecastRefresh,
  enabled = true,
}: UseRealtimeDashboardOptions = {}) {
  const [connected, setConnected]   = useState(false)
  const [lastEvent, setLastEvent]   = useState<string | null>(null)
  const eventSourceRef              = useRef<EventSource | null>(null)
  const reconnectTimerRef           = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef        = useRef(0)
  const MAX_RECONNECT_ATTEMPTS      = 5

  const connect = useCallback(() => {
    if (!enabled) return
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return

    const es = new EventSource("/api/realtime")
    eventSourceRef.current = es

    es.addEventListener("connected", () => {
      setConnected(true)
      reconnectAttemptsRef.current = 0
    })

    es.addEventListener("lead:created", () => {
      setLastEvent("lead:created")
      onLeadChange?.()
      onDashboardRefresh?.()
      onForecastRefresh?.()
    })

    es.addEventListener("lead:updated", () => {
      setLastEvent("lead:updated")
      onLeadChange?.()
      onDashboardRefresh?.()
      onForecastRefresh?.()
    })

    es.addEventListener("lead:deleted", () => {
      setLastEvent("lead:deleted")
      onLeadChange?.()
      onDashboardRefresh?.()
      onForecastRefresh?.()
    })

    es.addEventListener("activity:created", () => {
      setLastEvent("activity:created")
      onActivityChange?.()
      onDashboardRefresh?.()
    })

    es.addEventListener("activity:updated", () => {
      setLastEvent("activity:updated")
      onActivityChange?.()
    })

    es.addEventListener("activity:deleted", () => {
      setLastEvent("activity:deleted")
      onActivityChange?.()
      onDashboardRefresh?.()
    })

    es.addEventListener("dashboard:refresh", () => {
      setLastEvent("dashboard:refresh")
      onDashboardRefresh?.()
    })

    es.addEventListener("forecast:refresh", () => {
      setLastEvent("forecast:refresh")
      onForecastRefresh?.()
    })

    es.onerror = () => {
      setConnected(false)
      es.close()

      // Reconnect dengan exponential backoff
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30_000
        )
        reconnectAttemptsRef.current++

        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, delay)
      }
    }
  }, [
    enabled,
    onLeadChange,
    onActivityChange,
    onDashboardRefresh,
    onForecastRefresh,
  ])

  useEffect(() => {
    connect()

    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
    }
  }, [connect])

  return { connected, lastEvent }
}

// ── Hook khusus untuk dashboard ───────────────────────────────
export function useRealtimeData<T>(
  fetchFn:  () => Promise<T>,
  options?: UseRealtimeDashboardOptions & {
    refreshOnEvents?: string[]
    pollingInterval?: number   // fallback polling dalam ms
  }
) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn()
      setData(result)
      setLastUpdated(new Date())
      setError(null)
    } catch (err: any) {
      setError(err.message ?? "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Real-time updates
  const { connected, lastEvent } = useRealtimeDashboard({
    ...options,
    onDashboardRefresh: () => {
      fetchData()
      options?.onDashboardRefresh?.()
    },
    onForecastRefresh: () => {
      fetchData()
      options?.onForecastRefresh?.()
    },
    onLeadChange: () => {
      fetchData()
      options?.onLeadChange?.()
    },
  })

  // Polling fallback kalau SSE tidak tersedia
  useEffect(() => {
    if (!options?.pollingInterval) return
    const timer = setInterval(fetchData, options.pollingInterval)
    return () => clearInterval(timer)
  }, [fetchData, options?.pollingInterval])

  return {
    data,
    loading,
    error,
    lastUpdated,
    connected,
    lastEvent,
    refetch: fetchData,
  }
}