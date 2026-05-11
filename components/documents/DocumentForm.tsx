"use client"

import { useState, useEffect } from "react"
import {
  generateDocumentNumber,
  buildDefaultContent,
} from "@/lib/services/documentGenerator"

interface Lead {
  id:            string
  title:         string
  clientName:    string
  clientEmail?:  string | null
  clientCompany?: string | null
  value?:        number | null
  assignedTo?:   { name: string } | null
}

interface Props {
  onClose:  () => void
  onCreate: (doc: any) => void
  leadId?:  string
}

const DOC_TYPES = [
  { value: "INVOICE", label: "Invoice",         desc: "Tagihan pembayaran ke klien",       color: "#059669" },
  { value: "SPK",     label: "Surat Perintah Kerja", desc: "Dokumen perintah pengerjaan",  color: "#2563eb" },
  { value: "MOU",     label: "MOU",             desc: "Memorandum of Understanding",        color: "#7c3aed" },
  { value: "OTHER",   label: "Dokumen Lain",    desc: "Dokumen bisnis umum",               color: "#64748b" },
]

export default function DocumentForm({ onClose, onCreate, leadId }: Props) {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState("")
  const [form, setForm]         = useState({
    leadId:   leadId ?? "",
    type:     "INVOICE",
    title:    "",
  })

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
  }, [])

  // Auto-generate title saat type atau lead berubah
  useEffect(() => {
    if (!form.leadId || !form.type) return
    const lead = leads.find((l) => l.id === form.leadId)
    if (!lead) return

    const typeLabel = DOC_TYPES.find((t) => t.value === form.type)?.label ?? form.type
    setForm((f) => ({
      ...f,
      title: `${typeLabel} - ${lead.clientName}`,
    }))
  }, [form.leadId, form.type, leads])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.leadId || !form.type) {
      setError("Pilih lead dan tipe dokumen")
      return
    }

    setSaving(true)
    setError("")

    try {
      const lead    = leads.find((l) => l.id === form.leadId)!
      const number  = generateDocumentNumber(form.type)
      const content = buildDefaultContent(form.type, {
        title:         lead.title,
        clientName:    lead.clientName,
        clientEmail:   lead.clientEmail,
        clientCompany: lead.clientCompany,
        clientPhone:   null,
        value:         lead.value,
        assignedTo:    lead.assignedTo,
      }, number)

      const res = await fetch("/api/documents", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          leadId:  form.leadId,
          type:    form.type,
          title:   form.title || `${form.type} - ${lead.clientName}`,
          content,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Gagal membuat dokumen")
      }

      const doc = await res.json()
      onCreate(doc)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:       "fixed",
        inset:          0,
        background:     "rgba(0,0,0,0.5)",
        zIndex:         100,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   "#fff",
          borderRadius: 12,
          width:        "100%",
          maxWidth:     520,
          padding:      28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Buat Dokumen Baru</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pilih Lead */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Lead / Proyek *
            </label>
            <select
              required
              value={form.leadId}
              onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
            >
              <option value="">-- Pilih Lead --</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.title} ({lead.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Tipe */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>
              Tipe Dokumen *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DOC_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: type.value }))}
                  style={{
                    padding:      "12px",
                    borderRadius: 8,
                    border:       `2px solid ${form.type === type.value ? type.color : "#e2e8f0"}`,
                    background:   form.type === type.value ? type.color + "10" : "#fff",
                    cursor:       "pointer",
                    textAlign:    "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.type === type.value ? type.color : "#0f172a" }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Judul */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>
              Judul Dokumen
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Auto-generate dari lead"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding:      "11px",
              background:   saving ? "#93c5fd" : "#2563eb",
              color:        "#fff",
              border:       "none",
              borderRadius: 6,
              fontSize:     14,
              fontWeight:   500,
              cursor:       saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Membuat..." : "Buat Dokumen"}
          </button>
        </form>
      </div>
    </div>
  )
}