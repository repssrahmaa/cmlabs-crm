"use client"

import { useState, useEffect, useCallback } from "react"

export interface Mail {
  id:        string
  subject:   string
  body:      string
  status:    string
  sentAt:    string | null
  createdAt: string
  sender:    { id: string; name: string; avatar: string | null; role: string }
  receiver:  { id: string; name: string; avatar: string | null; role: string }
  lead:      { id: string; title: string; status: string } | null
}

export function useMails(folder: "inbox" | "sent" | "all" = "inbox") {
  const [mails, setMails]     = useState<Mail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [search, setSearch]   = useState("")

  const fetchMails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ folder, search })
      const res    = await fetch(`/api/mails?${params}`)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error ?? "Gagal ambil data mails")
      }

      const data = await res.json()

      // Pastikan data adalah array sebelum set state
      if (Array.isArray(data)) {
        setMails(data)
      } else {
        console.error("API mails tidak mengembalikan array:", data)
        setMails([])
      }
    } catch (err: any) {
      console.error("Error fetch mails:", err)
      setError(err.message)
      setMails([])   // ← set array kosong kalau error
    } finally {
      setLoading(false)
    }
  }, [folder, search])

  useEffect(() => {
    fetchMails()
  }, [fetchMails])

  const sendMail = useCallback(async (data: {
    subject:    string
    body:       string
    receiverId: string
    leadId?:    string | null
  }) => {
    const res = await fetch("/api/mails", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? "Gagal kirim mail")
    }
    const newMail = await res.json()
    await fetchMails()
    return newMail
  }, [fetchMails])

  const deleteMail = useCallback(async (mailId: string) => {
    await fetch(`/api/mails/${mailId}`, { method: "DELETE" })
    setMails((prev) => prev.filter((m) => m.id !== mailId))
  }, [])

  return {
    mails,
    loading,
    error,
    search,
    setSearch,
    fetchMails,
    sendMail,
    deleteMail,
  }
}