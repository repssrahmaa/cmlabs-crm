"use client"

import { useState, useEffect } from "react"

interface Profile {
  id:        string
  name:      string
  email:     string
  role:      string
  phone:     string | null
  createdAt: string
  _count:    { assignedLeads: number; activities: number }
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN:     "Admin",
  MANAGER:   "Manajer",
  SALES:     "Sales",
  MARKETING: "Marketing",
}

export default function ProfilePage() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState("")
  const [error, setError]       = useState("")

  const [infoForm, setInfoForm] = useState({ name: "", phone: "" })
  const [passForm, setPassForm] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  })

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data)
        setInfoForm({ name: data.name, phone: data.phone ?? "" })
        setLoading(false)
      })
  }, [])

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    const res = await fetch("/api/profile", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(infoForm),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error)
    } else {
      setProfile((p) => p ? { ...p, ...data } : p)
      setSuccess("Profil berhasil diperbarui!")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (passForm.newPassword !== passForm.confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }

    setSaving(true)
    const res = await fetch("/api/profile", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword,
      }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess("Password berhasil diperbarui!")
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  if (loading || !profile) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#64748b" }}>
        Memuat profil...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Alert */}
      {success && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#16a34a", fontSize: 14 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#2563eb", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700,
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{profile.name}</div>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{profile.email}</div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "#dbeafe", color: "#2563eb", marginTop: 6, display: "inline-block" }}>
              {ROLE_LABEL[profile.role]}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[
            { label: "Leads Ditangani", value: profile._count.assignedLeads },
            { label: "Total Aktivitas", value: profile._count.activities    },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#f8fafc", borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#2563eb" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Info */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Informasi Akun</h3>
        <form onSubmit={handleUpdateInfo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Nama Lengkap</label>
            <input
              type="text"
              value={infoForm.name}
              onChange={(e) => setInfoForm((f) => ({ ...f, name: e.target.value }))}
              required
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, boxSizing: "border-box", background: "#f8fafc", color: "#94a3b8" }}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>Email tidak dapat diubah</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>No. Telepon</label>
            <input
              type="text"
              value={infoForm.phone}
              onChange={(e) => setInfoForm((f) => ({ ...f, phone: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px", background: saving ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* Ganti Password */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 28 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Ganti Password</h3>
        <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Password Lama",       key: "oldPassword"     },
            { label: "Password Baru",       key: "newPassword"     },
            { label: "Konfirmasi Password", key: "confirmPassword" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>{label}</label>
              <input
                type="password"
                required
                value={(passForm as any)[key]}
                onChange={(e) => setPassForm((f) => ({ ...f, [key]: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px", background: saving ? "#93c5fd" : "#0f172a", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            {saving ? "Menyimpan..." : "Ganti Password"}
          </button>
        </form>
      </div>
    </div>
  )
}