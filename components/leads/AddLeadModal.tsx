"use client"

import { useState, useEffect } from "react"
import { useRoleGuard }        from "@/hooks/useRoleGuard"

interface User {
  id:   string
  name: string
  role: string
}

interface Props {
  onClose:  () => void
  onCreate: (data: any) => Promise<void>
}

export default function AddLeadModal({ onClose, onCreate }: Props) {
  const [loading, setLoading]   = useState(false)
  const [users, setUsers]       = useState<User[]>([])
  const [errorMsg, setErrorMsg] = useState("")
  const { role, userId, canAssignLead } = useRoleGuard()

  const [form, setForm] = useState({
    title: "", clientName: "", clientEmail: "",
    clientPhone: "", clientCompany: "", value: "",
    source: "", description: "", priority: "MEDIUM",
    assignedToId: "",
  })

  // Fetch users untuk dropdown PIC
  useEffect(() => {
    if (!canAssignLead) return
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data.filter((u: User) => u.role !== "VIEWER"))
        }
      })
      .catch(() => {})
  }, [canAssignLead])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.clientName) return
    setLoading(true)
    setErrorMsg("")

    try {
      await onCreate({
        ...form,
        value:        form.value ? Number(form.value) : undefined,
        assignedToId: form.assignedToId || undefined,
      })
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message ?? "Gagal membuat lead")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 12,
          width: "100%", maxWidth: 540,
          maxHeight: "90vh", overflowY: "auto", padding: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Tambah Lead Baru</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#dc2626", fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Fields */}
          {[
            { label: "Judul Lead *",  key: "title",         type: "text",   required: true  },
            { label: "Nama Klien *",  key: "clientName",    type: "text",   required: true  },
            { label: "Email Klien",   key: "clientEmail",   type: "email",  required: false },
            { label: "No. Telepon",   key: "clientPhone",   type: "text",   required: false },
            { label: "Perusahaan",    key: "clientCompany", type: "text",   required: false },
            { label: "Nilai (Rp)",    key: "value",         type: "number", required: false },
            { label: "Sumber Lead",   key: "source",        type: "text",   required: false },
          ].map(({ label, key, type, required }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
                {label}
              </label>
              <input
                type={type}
                required={required}
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: "100%", padding: "8px 12px",
                  border: "1px solid #d1d5db", borderRadius: 6,
                  fontSize: 14, boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          {/* Prioritas */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
              Prioritas
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </select>
          </div>

          {/* PIC / Assigned To — hanya untuk SUPER_ADMIN & SALES_MANAGER */}
          {canAssignLead ? (
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>
                PIC (Person in Charge)
              </label>
              <select
                value={form.assignedToId}
                onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
              >
                <option value="">-- Pilih PIC --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          ) : (
            // AE — PIC otomatis diri sendiri, tampilkan info saja
            <div style={{
              padding: "10px 14px", background: "#f0fdf4",
              border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 13,
            }}>
              <span style={{ color: "#059669", fontWeight: 500 }}>📌 PIC:</span>
              <span style={{ color: "#374151", marginLeft: 6 }}>Ditugaskan ke Anda secara otomatis</span>
            </div>
          )}

          {/* Deskripsi */}
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

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px", background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 6,
              fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : "Tambah Lead"}
          </button>
        </form>
      </div>
    </div>
  )
}