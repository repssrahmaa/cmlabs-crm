"use client"

import { useState, useEffect } from "react"
import { useRoleGuard }        from "@/hooks/useRoleGuard"
import { FormField, inputStyle, selectStyle } from "@/components/ui/FormField"
import RichTextEditor          from "@/components/ui/RichTextEditor"

interface User { id: string; name: string; role: string }

interface LeadData {
  id: string
  title: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientCompany?: string
  clientPosition?: string
  value?: number | null
  source?: string
  description?: string
  priority: string
  assignedToId?: string
}

interface Props {
  lead: LeadData
  onClose: () => void
  onUpdate: (id: string, data: any) => Promise<void>
}

// ── Helper Formatter Rupiah ────────────────────────────────────
const formatRupiah = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || value === "") return ""
  // Jika value bertipe number/string, ambil hanya karakter angka
  const rawNumber = String(value).replace(/\D/g, "")
  if (!rawNumber) return ""
  return "Rp " + new Intl.NumberFormat("id-ID").format(Number(rawNumber))
}

const parseRupiahToNumber = (value: string) => {
  const rawNumber = value.replace(/\D/g, "")
  return rawNumber ? Number(rawNumber) : undefined
}

export default function EditLeadModal({ lead, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [errorMsg, setErrorMsg] = useState("")
  const { canAssignLead } = useRoleGuard()

  // Inisialisasi state form dengan memformat 'value' awal ke Rupiah
  const [form, setForm] = useState({
    title: lead.title || "",
    clientName: lead.clientName || "",
    clientEmail: lead.clientEmail || "",
    clientPhone: lead.clientPhone || "",
    clientCompany: lead.clientCompany || "",
    clientPosition: lead.clientPosition || "",
    value: formatRupiah(lead.value), // ← Format nilai awal dari DB
    source: lead.source || "",
    description: lead.description || "",
    priority: lead.priority || "MEDIUM",
    assignedToId: lead.assignedToId || "",
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  // Handler khusus ketik Nilai Deal
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRupiah(e.target.value)
    setForm((f) => ({ ...f, value: formatted }))
  }

  useEffect(() => {
    if (!canAssignLead) return
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setUsers(d)
      })
      .catch(() => {})
  }, [canAssignLead])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.clientName) return
    setLoading(true)
    setErrorMsg("")
    try {
      // Parse string "Rp 10.000.000" kembali ke Number sebelum dikirim ke DB
      const payload = {
        ...form,
        value: parseRupiahToNumber(form.value),
        assignedToId: form.assignedToId || undefined,
      }
      await onUpdate(lead.id, payload)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message ?? "Gagal memperbarui lead")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          borderRadius: 16, padding: 26,
          width: "100%", maxWidth: 560,
          maxHeight: "90vh", overflowY: "auto",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 3px", fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>Edit Lead</h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Perbarui informasi lead dan detail klien</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20, padding: 4 }}>&times;</button>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--danger-pale)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <FormField label="Judul Lead" required>
            <input type="text" required value={form.title} onChange={set("title")} placeholder="Contoh: SEO Package — PT Maju Bersama" style={inputStyle} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Nama Klien" required>
              <input type="text" required value={form.clientName} onChange={set("clientName")} placeholder="Nama lengkap" style={inputStyle} />
            </FormField>
            <FormField label="Jabatan Klien">
              <input type="text" value={form.clientPosition} onChange={set("clientPosition")} placeholder="Jabatan / posisi" style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Email Klien">
              <input type="email" value={form.clientEmail} onChange={set("clientEmail")} placeholder="email@company.com" style={inputStyle} />
            </FormField>
            <FormField label="Telepon Klien">
              <input type="text" value={form.clientPhone} onChange={set("clientPhone")} placeholder="08xx-xxxx-xxxx" style={inputStyle} />
            </FormField>
          </div>

          <FormField label="Perusahaan Klien">
            <input type="text" value={form.clientCompany} onChange={set("clientCompany")} placeholder="Nama perusahaan" style={inputStyle} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* INPUT NILAI DEAL (EDIT FORMAT RUPIAH) */}
            <FormField label="Nilai Deal">
              <input 
                type="text" 
                value={form.value} 
                onChange={handleValueChange} 
                placeholder="Rp 0" 
                style={inputStyle} 
              />
            </FormField>

            <FormField label="Prioritas">
              <select value={form.priority} onChange={set("priority")} style={selectStyle}>
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
              </select>
            </FormField>
          </div>

          <FormField label="Sumber Lead">
            <input type="text" value={form.source} onChange={set("source")} placeholder="Website, Referral, Cold Call..." style={inputStyle} />
          </FormField>

          {/* PIC */}
          {canAssignLead && (
            <FormField label="PIC (Person in Charge)">
              <select value={form.assignedToId} onChange={set("assignedToId")} style={selectStyle}>
                <option value="">-- Pilih PIC --</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </FormField>
          )}

          {/* Deskripsi (Rich Text) */}
          <RichTextEditor label="Deskripsi" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Tambahkan catatan, konteks, atau informasi penting..." minHeight={90} />

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: "11px",
            background: loading ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: loading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "var(--shadow-primary)",
          }}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  )
}