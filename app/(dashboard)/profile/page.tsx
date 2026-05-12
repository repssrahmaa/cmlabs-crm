"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"

interface Profile {
id: string
name: string
email: string
role: string
phone: string | null
createdAt: string
_count: { assignedLeads: number; activities: number }
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
SUPER_ADMIN: { label: "Super Admin", color: "#ef4444", icon: "👑" },
EXECUTIVE: { label: "Executive", color: "#8b5cf6", icon: "💼" },
SALES_MANAGER: { label: "Sales Manager", color: "#4B9EF3", icon: "📊" },
ACCOUNT_EXECUTIVE: { label: "Account Executive", color: "#10b981", icon: "🎯" },
VIEWER: { label: "Viewer", color: "#64748b", icon: "👁️" },
}

export default function ProfilePage() {
const [profile, setProfile] = useState<Profile | null>(null)
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [success, setSuccess] = useState("")
const [error, setError] = useState("")
const [showOldPw, setShowOldPw] = useState(false)
const [showNewPw, setShowNewPw] = useState(false)
const [showConPw, setShowConPw] = useState(false)
const [infoForm, setInfoForm] = useState({ name: "", phone: "" })
const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" })

useEffect(() => {
fetch("/api/profile")
.then((r) => r.json())
.then((d) => {
setProfile(d)
setInfoForm({ name: d.name, phone: d.phone ?? "" })
setLoading(false)
})
}, [])

async function handleUpdateInfo(e: React.FormEvent) {
e.preventDefault()
setSaving(true); setError(""); setSuccess("")
const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(infoForm) })
const data = await res.json()
setSaving(false)
if (!res.ok) { setError(data.error) }
else { setProfile((p) => p ? { ...p, ...data } : p); setSuccess("Profil berhasil diperbarui!"); setTimeout(() => setSuccess(""), 3000) }
}

async function handleUpdatePassword(e: React.FormEvent) {
e.preventDefault()
if (passForm.newPassword !== passForm.confirmPassword) { setError("Konfirmasi password tidak cocok"); return }
setSaving(true); setError(""); setSuccess("")
const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }) })
const data = await res.json()
setSaving(false)
if (!res.ok) { setError(data.error) }
else { setSuccess("Password berhasil diperbarui!"); setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); setTimeout(() => setSuccess(""), 3000) }
}

if (loading) return (
<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
<div style={{ textAlign: "center" }}>
<div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
<p style={{ color: "var(--text-muted)", fontSize: 13 }}>Memuat profil...</p>
</div>
</div>
)

if (!profile) return null
const roleCfg = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.VIEWER

return (
<div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

{/* Alert */}
{(success || error) && (
<div className="animate-scaleIn" style={{
display: "flex", alignItems: "center", gap: 10,
padding: "12px 16px", borderRadius: 12,
background: success ? "var(--success-pale)" : "var(--danger-pale)",
border: `1px solid ${success ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
color: success ? "var(--success)" : "var(--danger)",
fontSize: 13, fontWeight: 500,
}}>
<span style={{ fontSize: 18 }}>{success ? "✅" : "⚠️"}</span>
<span>{success || error}</span>
</div>
)}

{/* Profile Hero */}
<div style={{
background: "var(--hero-bg, linear-gradient(135deg, var(--hero-from,#0f172a), var(--hero-mid,#1e293b), var(--hero-to,#1e3a5f)))",
borderRadius: 20,
padding: "28px 32px",
position: "relative",
overflow: "hidden",
}}>
<div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(75,158,243,0.08)", pointerEvents:"none" }} />
<div style={{ position:"absolute", bottom:-20, left:40, width:80, height:80, borderRadius:"50%", background:"rgba(139,92,246,0.08)", pointerEvents:"none" }} />

<div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
{/* Avatar */}
<div style={{
width: 72, height: 72,
borderRadius: 18,
background: `linear-gradient(135deg, ${roleCfg.color}, ${roleCfg.color}88)`,
display: "flex", alignItems: "center",
justifyContent: "center",
fontSize: 28, fontWeight: 900, color: "#fff",
boxShadow: `0 8px 24px ${roleCfg.color}50`,
border: "2px solid rgba(255,255,255,0.15)",
flexShrink: 0,
}}>
{profile.name.charAt(0).toUpperCase()}
</div>

<div style={{ flex: 1 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
<h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>
{profile.name}
</h1>
<span style={{
display: "flex", alignItems: "center", gap: 4,
fontSize: 11, fontWeight: 700, padding: "3px 10px",
borderRadius: 999, background: roleCfg.color + "25",
color: roleCfg.color === "#ef4444" ? "#fca5a5" : roleCfg.color,
border: `1px solid ${roleCfg.color}30`,
}}>
{roleCfg.icon} {roleCfg.label}
</span>
</div>
<p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
{profile.email}
</p>
<div style={{ display: "flex", gap: 16 }}>
{[
{ v: profile._count.assignedLeads, l: "Leads", c: "#4B9EF3" },
{ v: profile._count.activities, l: "Aktivitas", c: "#10b981" },
].map((s) => (
<div key={s.l}>
<div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
<div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
</div>
))}
</div>
</div>
</div>
</div>

{/* Info Form */}
<div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
<div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
✏️
</div>
<div>
<h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Informasi Akun</h3>
<p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Perbarui nama dan nomor telepon</p>
</div>
</div>

<form onSubmit={handleUpdateInfo} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
{[
{ label: "Nama Lengkap", key: "name", type: "text", required: true, icon: "👤" },
{ label: "No. Telepon", key: "phone", type: "text", required: false, icon: "📱" },
].map(({ label, key, type, required, icon }) => (
<div key={key}>
<label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
{label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
</label>
<div style={{ position: "relative" }}>
<span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", opacity: 0.5 }}>{icon}</span>
<input
type={type}
value={(infoForm as any)[key]}
onChange={(e) => setInfoForm((f) => ({ ...f, [key]: e.target.value }))}
required={required}
style={{
width: "100%",
padding: "10px 12px 10px 38px",
background: "var(--bg-input)",
border: "1px solid var(--border)",
borderRadius: 10,
fontSize: 14,
color: "var(--text-primary)",
boxSizing: "border-box",
}}
/>
</div>
</div>
))}

{/* Email (disabled) */}
<div>
<label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
Email <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(tidak dapat diubah)</span>
</label>
<div style={{ position: "relative" }}>
<span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.3, pointerEvents: "none" }}>✉️</span>
<input
type="email"
value={profile.email}
disabled
style={{ width: "100%", padding: "10px 12px 10px 38px", background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, color: "var(--text-muted)", boxSizing: "border-box", cursor: "not-allowed" }}
/>
</div>
</div>

<Button type="submit" loading={saving} fullWidth>
Simpan Perubahan
</Button>
</form>
</div>

{/* Password Form */}
<div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
<div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--warning-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
🔐
</div>
<div>
<h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Ganti Password</h3>
<p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Pastikan gunakan password yang kuat</p>
</div>
</div>

<form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
{[
{ label: "Password Lama", key: "oldPassword", show: showOldPw, setShow: setShowOldPw },
{ label: "Password Baru", key: "newPassword", show: showNewPw, setShow: setShowNewPw },
{ label: "Konfirmasi Password", key: "confirmPassword", show: showConPw, setShow: setShowConPw },
].map(({ label, key, show, setShow }) => (
<div key={key}>
<label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
{label} *
</label>
<div style={{ position: "relative" }}>
<span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.4, pointerEvents: "none" }}>🔒</span>
<input
type={show ? "text" : "password"}
required
value={(passForm as any)[key]}
onChange={(e) => setPassForm((f) => ({ ...f, [key]: e.target.value }))}
style={{
width: "100%",
padding: "10px 42px 10px 38px",
background: "var(--bg-input)",
border: "1px solid var(--border)",
borderRadius: 10,
fontSize: 14,
color: "var(--text-primary)",
boxSizing: "border-box",
letterSpacing: show ? "normal" : "0.1em",
}}
/>
<button
type="button"
onClick={() => setShow(!show)}
style={{
position: "absolute", right: 10, top: "50%",
transform: "translateY(-50%)",
background: "none", border: "none",
cursor: "pointer", fontSize: 15,
opacity: 0.5, transition: "opacity 0.2s",
padding: "4px",
}}
onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
>
{show ? "🙈" : "👁️"}
</button>
</div>
</div>
))}

<Button type="submit" variant="warning" loading={saving} fullWidth>
🔐 Ganti Password
</Button>
</form>
</div>
</div>
)
}