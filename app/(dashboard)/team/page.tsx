"use client"

import { useState, useEffect }   from "react"
import { useRoleGuard }          from "@/hooks/useRoleGuard"
import { useAccessNotice, AccessToast, AccessBanner } from "@/components/ui/AccessNotice"

interface User {
  id:       string
  name:     string
  email:    string
  role:     string
  phone:    string | null
  isActive: boolean
  createdAt: string
  _count:   { assignedLeads: number }
}

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  SUPER_ADMIN:       { bg: "#fef3c7", color: "#d97706" },
  EXECUTIVE:         { bg: "#ede9fe", color: "#7c3aed" },
  SALES_MANAGER:     { bg: "#dbeafe", color: "#2563eb" },
  ACCOUNT_EXECUTIVE: { bg: "#d1fae5", color: "#059669" },
  VIEWER:            { bg: "#f1f5f9", color: "#64748b" },
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:       "Super Admin",
  EXECUTIVE:         "Executive",
  SALES_MANAGER:     "Sales Manager",
  ACCOUNT_EXECUTIVE: "Account Executive",
  VIEWER:            "Viewer",
}

export default function TeamPage() {
  const { role, is }              = useRoleGuard()
  const { notice, showNotice, hideNotice } = useAccessNotice()

  const [users, setUsers]         = useState<User[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser]   = useState<User | null>(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState("")
  const [form, setForm]           = useState({
    name: "", email: "", password: "",
    role: "ACCOUNT_EXECUTIVE", phone: "",
  })

  const isReadOnly = is("EXECUTIVE")
  const canDelete  = is("SUPER_ADMIN")
  const canEdit    = is("SUPER_ADMIN", "SALES_MANAGER")

  async function fetchUsers() {
    try {
      const res  = await fetch("/api/users")
      if (!res.ok) throw new Error("Gagal")
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  function openAdd() {
    if (isReadOnly) {
      showNotice("readonly", "Anda tidak dapat menambah anggota tim dalam mode lihat saja.")
      return
    }
    setEditUser(null)
    setForm({ name: "", email: "", password: "", role: "ACCOUNT_EXECUTIVE", phone: "" })
    setError("")
    setShowModal(true)
  }

  function openEdit(user: User) {
    if (isReadOnly) {
      showNotice("readonly", "Anda tidak dapat mengedit anggota tim dalam mode lihat saja.")
      return
    }
    setEditUser(user)
    setForm({ name: user.name, email: user.email, password: "", role: user.role, phone: user.phone ?? "" })
    setError("")
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isReadOnly) return
    setSaving(true)
    setError("")

    try {
      const url    = editUser ? `/api/users/${editUser.id}` : "/api/users"
      const method = editUser ? "PUT" : "POST"
      const body: any = { ...form }
      if (editUser && !body.password) delete body.password

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan")
        return
      }

      await fetchUsers()
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(user: User) {
    if (isReadOnly) {
      showNotice("readonly")
      return
    }
    await fetch(`/api/users/${user.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: !user.isActive }),
    })
    fetchUsers()
  }

  async function handleDelete(userId: string) {
    if (!canDelete) {
      showNotice("no_access", "Hanya Super Admin yang dapat menghapus user.")
      return
    }
    if (!confirm("Yakin hapus user ini?")) return
    await fetch(`/api/users/${userId}`, { method: "DELETE" })
    fetchUsers()
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#64748b" }}>
        Memuat data tim...
      </div>
    )
  }

  return (
    <div>
      {/* Access Banner untuk Executive */}
      {isReadOnly && (
        <AccessBanner
          type="readonly"
          role="Executive"
          message="Anda dapat melihat data tim namun tidak dapat melakukan perubahan."
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Total {users.length} anggota tim
        </p>
        {!isReadOnly && (
          <button
            onClick={openAdd}
            style={{
                padding: "9px 18px", background: "#2563eb",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
          >
            + Tambah Anggota
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {Object.entries(ROLE_LABEL).map(([roleKey, label]) => {
          const count = users.filter((u) => u.role === roleKey).length
          const cfg   = ROLE_COLOR[roleKey]
          return (
            <div key={roleKey} style={{ background: "var(--bg-card)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: cfg.color }}>{count}</div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-header)" }}>
              {["Nama", "Email", "Role", "Telepon", "Leads", "Status", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const cfg = ROLE_COLOR[user.role] ?? { bg: "var(--bg-card)", color: "var(--text-muted)" }
              return (
                <tr key={user.id} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-alt)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: cfg.bg, color: cfg.color,
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 14, fontWeight: 700,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text)" }}>{user.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: cfg.bg, color: cfg.color }}>
                      {ROLE_LABEL[user.role] ?? user.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text)" }}>{user.phone ?? "-"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text) " }}>{user._count.assignedLeads}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                      background: user.isActive ? "var(--bg-card)" : "var(--bg-card)",
                      color:      user.isActive ? "#16a34a" : "#dc2626",
                    }}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {isReadOnly ? (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Hanya lihat</span>
                    ) : (
                      <div style={{ display: "flex", gap: 6 }}>
                        {canEdit && (
                          <button
                            onClick={() => openEdit(user)}
                            style={{ padding: "5px 12px", background: "var(--bg-card)", color: "#2563eb", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500 }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(user)}
                          style={{
                            padding: "5px 12px", border: "none", borderRadius: 6,
                            fontSize: 12, cursor: "pointer", fontWeight: 500,
                            background: user.isActive ? "var(--bg-card)" : "var(--bg-card)",
                            color:      user.isActive ? "#ea580c" : "#16a34a",
                          }}
                        >
                          {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            style={{ padding: "5px 12px", background: "var(--bg-card)", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && !isReadOnly && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-card)", borderRadius: 12, width: "100%", maxWidth: 480, padding: 28 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {editUser ? "Edit Anggota" : "Tambah Anggota"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Nama Lengkap *", key: "name",  type: "text"     },
                { label: "Email *",        key: "email", type: "email"    },
                { label: editUser ? "Password Baru (kosongkan jika tidak diubah)" : "Password *", key: "password", type: "password" },
                { label: "No. Telepon",    key: "phone", type: "text"     },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type={type}
                    required={key !== "phone" && !(editUser && key === "password")}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              ))}

              {/* Role — hanya Super Admin yang bisa ganti role */}
              {is("SUPER_ADMIN") && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="SALES_MANAGER">Sales Manager</option>
                    <option value="ACCOUNT_EXECUTIVE">Account Executive</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{ padding: "11px", background: saving ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                {saving ? "Menyimpan..." : editUser ? "Simpan Perubahan" : "Tambah Anggota"}
              </button>
            </form>
          </div>
        </div>
      )}

      <AccessToast
        type={notice.type}
        message={notice.message}
        show={notice.show}
        onClose={hideNotice}
      />
    </div>
  )
}