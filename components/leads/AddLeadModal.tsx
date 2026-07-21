"use client"

import { useState, useEffect } from "react"
import { useRoleGuard }        from "@/hooks/useRoleGuard"
import { FormField, inputStyle, selectStyle } from "@/components/ui/FormField"
import RichTextEditor          from "@/components/ui/RichTextEditor"

interface User { id: string; name: string; role: string }

interface Props {
  onClose:  () => void
  onCreate: (data: any) => Promise<void>
}

export default function AddLeadModal({ onClose, onCreate }: Props) {
  const [loading,   setLoading]   = useState(false)
  const [users,     setUsers]     = useState<User[]>([])
  const [errorMsg,  setErrorMsg]  = useState("")
  const { role, userId, canAssignLead } = useRoleGuard()

  const [form, setForm] = useState({
    title: "", clientName: "", clientEmail: "", clientPhone: "",
    clientCompany: "", clientPosition: "", value: "",
    source: "", description: "", priority: "MEDIUM", assignedToId: "",
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!canAssignLead) return
    fetch("/api/users").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setUsers(Array.isArray(d) ? d : [])
    }).catch(() => {})
  }, [canAssignLead])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.clientName) return
    setLoading(true); setErrorMsg("")
    try {
      await onCreate({ ...form, value: form.value ? Number(form.value) : undefined, assignedToId: form.assignedToId || undefined })
      onClose()
    } catch (err: any) { setErrorMsg(err.message ?? "Gagal membuat lead")
    } finally { setLoading(false) }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   "var(--bg-card)",     // ← CSS var
          borderRadius: 16, padding: 26,
          width: "100%", maxWidth: 560,
          maxHeight: "90vh", overflowY: "auto",
          border: "1px solid var(--border)",  // ← CSS var
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: "0 0 3px", fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>Tambah Lead Baru</h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Isi informasi lead dan detail klien</p>
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
            <FormField label="Nilai Deal (Rp)">
              <input type="number" value={form.value} onChange={set("value")} placeholder="0" min={0} style={inputStyle} />
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
          {canAssignLead ? (
            <FormField label="PIC (Person in Charge)">
              <select value={form.assignedToId} onChange={set("assignedToId")} style={selectStyle}>
                <option value="">-- Pilih PIC --</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </FormField>
          ) : (
            <div style={{ padding: "10px 14px", background: "var(--success-pale)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 8, fontSize: 13, color: "var(--success)" }}>
              <strong>PIC:</strong> Ditugaskan ke Anda secara otomatis
            </div>
          )}

          {/* Deskripsi (Rich Text) */}
          <RichTextEditor label="Deskripsi" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Tambahkan catatan, konteks, atau informasi penting tentang lead ini..." minHeight={90} />

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: "11px",
            background: loading ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: loading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "var(--shadow-primary)",
          }}>
            {loading ? "Menyimpan..." : "Tambah Lead"}
          </button>
        </form>
      </div>
    </div>
  )
}