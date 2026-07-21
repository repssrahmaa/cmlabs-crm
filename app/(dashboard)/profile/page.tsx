"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/Button"
import {
  Crown, Briefcase, BarChart3, Target, Eye,
  CheckCircle2, TriangleAlert, Pencil, User,
  Smartphone, Mail, Lock, EyeOff, ShieldCheck,
} from "lucide-react"

interface Profile {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  createdAt: string
  _count: { assignedLeads: number; activities: number }
}

const ROLE_CONFIG = {
  ADMIN:       { label: "Admin",       color: "#ef4444", icon: <Crown size={14} /> },
  EXECUTIVE:         { label: "Executive",         color: "#8b5cf6", icon: <Briefcase size={14} /> },
  SALES_MANAGER:     { label: "Sales Manager",     color: "#4B9EF3", icon: <BarChart3 size={14} /> },
  ACCOUNT_EXECUTIVE: { label: "Account Executive", color: "#10b981", icon: <Target size={14} /> },
}

// ── Toast notification ──────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const isSuccess = type === "success"
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 18px", borderRadius: 14, maxWidth: 360,
      background: isSuccess ? "var(--success)" : "var(--danger)",
      color: "#fff", fontSize: 13, fontWeight: 600,
      boxShadow: `0 8px 32px ${isSuccess ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
      animation: "slideUp 0.25s ease",
    }}>
      {isSuccess ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.7, fontSize: 18, lineHeight: 1, padding: "0 2px" }}
      >
        &times;
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Inline field error ──────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      marginTop: 6, fontSize: 11, color: "var(--danger)", fontWeight: 600,
      animation: "fadeIn .15s ease",
    }}>
      <TriangleAlert size={11} />
      <span>{msg}</span>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

// ── Styled input wrapper ────────────────────────────────────────
function FieldInput({
  label, icon, value, onChange, type = "text", disabled = false,
  required = false, error, hint, suffix,
}: {
  label: string; icon: React.ReactNode; value: string
  onChange?: (v: string) => void; type?: string; disabled?: boolean
  required?: boolean; error?: string; hint?: string; suffix?: React.ReactNode
}) {
  const hasError = !!error
  return (
    <div>
      <label style={{
        fontSize: 11, fontWeight: 700, color: hasError ? "var(--danger)" : "var(--text-muted)",
        display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em",
        transition: "color 0.2s",
      }}>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        {hint && <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>{hint}</span>}
      </label>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: disabled ? 0.3 : 0.5, pointerEvents: "none" }}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: `10px ${suffix ? "42px" : "12px"} 10px 38px`,
            background: disabled ? "var(--bg-card2)" : "var(--bg-input)",
            border: `1px solid ${hasError ? "var(--danger)" : "var(--border)"}`,
            borderRadius: 10, fontSize: 14,
            color: disabled ? "var(--text-muted)" : "var(--text-primary)",
            boxSizing: "border-box",
            cursor: disabled ? "not-allowed" : "text",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: hasError ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
          }}
          onFocus={(e) => {
            if (!disabled && !hasError) e.currentTarget.style.borderColor = "var(--primary)"
          }}
          onBlur={(e) => {
            if (!hasError) e.currentTarget.style.borderColor = "var(--border)"
          }}
        />
        {suffix && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
            {suffix}
          </div>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  )
}

export default function ProfilePage() {
  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState<{ msg: string; type: "success" | "error" } | null>(null)

  // info form
  const [infoForm,   setInfoForm]   = useState({ name: "", phone: "" })
  const [infoErrors, setInfoErrors] = useState<{ name?: string; phone?: string }>({})

  // password form
  const [passForm,   setPassForm]   = useState({ oldPassword: "", newPassword: "", confirmPassword: "" })
  const [passErrors, setPassErrors] = useState<{ oldPassword?: string; newPassword?: string; confirmPassword?: string }>({})
  const [showOldPw,  setShowOldPw]  = useState(false)
  const [showNewPw,  setShowNewPw]  = useState(false)
  const [showConPw,  setShowConPw]  = useState(false)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d)
        setInfoForm({ name: d.name, phone: d.phone ?? "" })
        setLoading(false)
      })
  }, [])

  // ── Validate info ─────────────────────────────────────────────
  function validateInfo() {
    const errs: typeof infoErrors = {}
    if (!infoForm.name.trim())           errs.name  = "Nama lengkap tidak boleh kosong"
    else if (infoForm.name.trim().length < 2) errs.name = "Nama minimal 2 karakter"
    if (infoForm.phone && !/^[0-9+\-\s()]{7,20}$/.test(infoForm.phone))
      errs.phone = "Format nomor telepon tidak valid"
    setInfoErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Validate password ─────────────────────────────────────────
  function validatePass() {
    const errs: typeof passErrors = {}
    if (!passForm.oldPassword)           errs.oldPassword    = "Password lama wajib diisi"
    if (!passForm.newPassword)           errs.newPassword    = "Password baru wajib diisi"
    else if (passForm.newPassword.length < 8) errs.newPassword = "Password minimal 8 karakter"
    else if (passForm.newPassword === passForm.oldPassword)
      errs.newPassword = "Password baru tidak boleh sama dengan password lama"
    if (!passForm.confirmPassword)       errs.confirmPassword = "Konfirmasi password wajib diisi"
    else if (passForm.newPassword !== passForm.confirmPassword)
      errs.confirmPassword = "Konfirmasi password tidak cocok dengan password baru"
    setPassErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!validateInfo()) return
    setSaving(true)
    const res  = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(infoForm) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      // Map server error back to field if possible
      const msg: string = data.error ?? "Gagal memperbarui profil"
      if (msg.toLowerCase().includes("nama"))  setInfoErrors({ name: msg })
      else if (msg.toLowerCase().includes("telepon")) setInfoErrors({ phone: msg })
      else setToast({ msg, type: "error" })
    } else {
      setProfile((p) => p ? { ...p, ...data } : p)
      setInfoErrors({})
      setToast({ msg: "Profil berhasil diperbarui!", type: "success" })
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!validatePass()) return
    setSaving(true)
    const res  = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      const msg: string = data.error ?? "Gagal mengganti password"
      // Common server errors → map to field
      if (msg.toLowerCase().includes("lama") || msg.toLowerCase().includes("salah") || msg.toLowerCase().includes("incorrect"))
        setPassErrors({ oldPassword: "Password lama tidak sesuai" })
      else
        setToast({ msg, type: "error" })
    } else {
      setPassErrors({})
      setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setToast({ msg: "Password berhasil diperbarui!", type: "success" })
    }
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
  const roleCfg = ROLE_CONFIG[profile.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.ACCOUNT_EXECUTIVE

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Profile Hero */}
      <div style={{
        background: "var(--hero-bg, linear-gradient(135deg, var(--hero-from,#0f172a), var(--hero-mid,#1e293b), var(--hero-to,#1e3a5f)))",
        borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(75,158,243,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(139,92,246,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, flexShrink: 0,
            background: `linear-gradient(135deg, ${roleCfg.color}, ${roleCfg.color}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 900, color: "#fff",
            boxShadow: `0 8px 24px ${roleCfg.color}50`,
            border: "2px solid rgba(255,255,255,0.15)",
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{profile.name}</h1>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                background: roleCfg.color + "25",
                color: roleCfg.color === "#ef4444" ? "#fca5a5" : roleCfg.color,
                border: `1px solid ${roleCfg.color}30`,
              }}>
                {roleCfg.icon} {roleCfg.label}
              </span>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{profile.email}</p>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { v: profile._count.assignedLeads, l: "Leads",    c: "#4B9EF3" },
                { v: profile._count.activities,    l: "Aktivitas", c: "#10b981" },
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

      {/* ── Info Form ─────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Pencil size={16} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Informasi Akun</h3>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Perbarui nama dan nomor telepon</p>
          </div>
        </div>

        <form onSubmit={handleUpdateInfo} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
          <FieldInput
            label="Nama Lengkap"
            icon={<User size={16} />}
            value={infoForm.name}
            onChange={(v) => { setInfoForm((f) => ({ ...f, name: v })); if (infoErrors.name) setInfoErrors((e) => ({ ...e, name: undefined })) }}
            required
            error={infoErrors.name}
          />
          <FieldInput
            label="No. Telepon"
            icon={<Smartphone size={16} />}
            value={infoForm.phone}
            onChange={(v) => { setInfoForm((f) => ({ ...f, phone: v })); if (infoErrors.phone) setInfoErrors((e) => ({ ...e, phone: undefined })) }}
            error={infoErrors.phone}
          />
          <FieldInput
            label="Email"
            hint="(tidak dapat diubah)"
            icon={<Mail size={16} />}
            value={profile.email}
            disabled
          />
          <Button type="submit" loading={saving} fullWidth>
            Simpan Perubahan
          </Button>
        </form>
      </div>

      {/* ── Password Form ─────────────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--warning-pale)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={16} color="var(--warning)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Ganti Password</h3>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Pastikan gunakan password yang kuat</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
          {([
            { label: "Password Lama",       key: "oldPassword",    show: showOldPw, setShow: setShowOldPw },
            { label: "Password Baru",       key: "newPassword",    show: showNewPw, setShow: setShowNewPw },
            { label: "Konfirmasi Password", key: "confirmPassword", show: showConPw, setShow: setShowConPw },
          ] as const).map(({ label, key, show, setShow }) => (
            <FieldInput
              key={key}
              label={label}
              icon={<Lock size={16} />}
              type={show ? "text" : "password"}
              value={passForm[key]}
              onChange={(v) => { setPassForm((f) => ({ ...f, [key]: v })); if (passErrors[key]) setPassErrors((e) => ({ ...e, [key]: undefined })) }}
              required
              error={passErrors[key]}
              suffix={
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5, transition: "opacity 0.2s", padding: "4px", display: "flex", alignItems: "center" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          ))}

          <Button type="submit" variant="warning" loading={saving} fullWidth>
            <>
              <ShieldCheck size={16} />
              <span>Ganti Password</span>
            </>
          </Button>
        </form>
      </div>
    </div>
  )
}