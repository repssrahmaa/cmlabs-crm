"use client"

import { useState, useEffect, useCallback } from "react"
import { Lead, LeadStatus } from "@/types/lead"

export function useLeads() {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/leads")
      if (!res.ok) throw new Error("Gagal mengambil data leads")
      const data = await res.json()
      setLeads(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const updateLeadStatus = useCallback(async (
    leadId: string,
    newStatus: LeadStatus
  ) => {
    // Optimistic update — langsung update UI dulu
    setLeads((prev) =>
      prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l)
    )

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Gagal update status")
    } catch (err) {
      // Rollback kalau gagal
      fetchLeads()
    }
  }, [fetchLeads])

  const createLead = useCallback(async (data: Partial<Lead>) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Gagal membuat lead")
    const newLead = await res.json()
    setLeads((prev) => [newLead, ...prev])
    return newLead
  }, [])

  const deleteLead = useCallback(async (leadId: string) => {
    const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Gagal menghapus lead")
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
  }, [])

  return { leads, loading, error, fetchLeads, updateLeadStatus, createLead, deleteLead }
//      
}