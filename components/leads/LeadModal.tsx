"use client"

import LeadTimeline from "./LeadTimeline"
import { useState } from "react"
import { Lead, PRIORITY_COLOR, PRIORITY_LABEL, KANBAN_COLUMNS } from "@/types/lead"

interface Props {
  lead:    Lead | null
  onClose: () => void
  onUpdate: (id: string, data: Partial<Lead>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function LeadModal({ lead, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
const [form, setForm] = useState({
  title:         lead?.title                    ?? "",
  clientName:    lead?.clientName               ?? "",
  clientEmail:   lead?.clientEmail              ?? "",
  clientPhone:   lead?.clientPhone              ?? "",
  clientCompany: lead?.clientCompany            ?? "",
  value:         lead?.value != null
                   ? String(lead.value)         // ← konversi ke string untuk input
                   : "",
  source:        lead?.source                   ?? "",
  description:   lead?.description              ?? "",
  priority:      lead?.priority                 ?? "MEDIUM",
  status:        lead?.status                   ?? "LEAD_IN",
})

  if (!lead) return null

async function handleUpdate() {
  setLoading(true)
  try {
    // Bersihkan data form sebelum dikirim
    const payload: Record<string, any> = {
      title:         form.title         || undefined,
      clientName:    form.clientName    || undefined,
      clientEmail:   form.clientEmail   || null,
      clientPhone:   form.clientPhone   || null,
      clientCompany: form.clientCompany || null,
      source:        form.source        || null,
      description:   form.description  || null,
      priority:      form.priority,
      status:        form.status,
      // Konversi value ke number, null kalau kosong
      value: form.value !== "" && form.value !== undefined
        ? Number(form.value)
        : null,
    }

    // Hapus key yang undefined
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    )

    const res = await fetch(`/api/leads/${lead!.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(cleanPayload),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error("Error detail:", errData)
      throw new Error(errData.error ?? "Gagal update")
    }

    const updated: Lead = await res.json()
    await onUpdate(lead!.id, updated)
    setEditing(false)
  } catch (err: any) {
    alert(err.message ?? "Terjadi kesalahan")
  } finally {
    setLoading(false)
  }
}

  async function handleDelete() {
    if (!confirm("Yakin hapus lead ini?")) return
    setLoading(true)
    await onDelete(lead!.id)
    setLoading(false)
    onClose()
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
          maxWidth:     560,
          maxHeight:    "90vh",
          overflowY:    "auto",
          padding:      28,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {editing ? "Edit Lead" : "Detail Lead"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>
            ✕
          </button>
        </div>

        {editing ? (
          /* ── Form Edit ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Judul Lead *", key: "title",         type: "text"  },
              { label: "Nama Klien *", key: "clientName",    type: "text"  },
              { label: "Email Klien",  key: "clientEmail",   type: "email" },
              { label: "No. Telepon",  key: "clientPhone",   type: "text"  },
              { label: "Perusahaan",   key: "clientCompany", type: "text"  },
              { label: "Nilai (Rp)",   key: "value",         type: "number"},
              { label: "Sumber",       key: "source",        type: "text"  },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width:        "100%",
                    padding:      "8px 12px",
                    border:       "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize:     14,
                    boxSizing:    "border-box",
                  }}
                />
              </div>
            ))}

            {/* Priority Select */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
                Prioritas
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as any }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
              >
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={handleUpdate}
                disabled={loading}
                style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{ flex: 1, padding: "10px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          /* ── Detail View ── */
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                {lead.title}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                background: PRIORITY_COLOR[lead.priority] + "20",
                color: PRIORITY_COLOR[lead.priority],
              }}>
                {PRIORITY_LABEL[lead.priority]}
              </span>
            </div>

            {[
              { label: "Klien",      value: lead.clientName    },
              { label: "Email",      value: lead.clientEmail   },
              { label: "Telepon",    value: lead.clientPhone   },
              { label: "Perusahaan", value: lead.clientCompany },
              { label: "Sumber",     value: lead.source        },
              { label: "PIC",        value: lead.assignedTo?.name },
              { label: "Nilai",      value: lead.value
                ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(lead.value)
                : null },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#64748b", width: 90, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{value}</span>
                </div>
              ) : null
            )}

            {lead.description && (
              <div style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 8, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                {lead.description}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setEditing(true)}
                style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{ padding: "10px 20px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 6, fontSize: 14, cursor: "pointer" }}
              >
                Hapus
              </button>
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 20, paddingTop: 20 }}>
  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
    Timeline Komunikasi
  </h3>
  <LeadTimeline
    leadId={lead.id}
    clientEmail={lead.clientEmail}
  />
</div>
          </div>
        )}
      </div>
    </div>
  )
}