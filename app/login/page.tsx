"use client"

import { signIn }          from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }       from "next/navigation"
import { useTheme }        from "@/hooks/useTheme"
import { useUAT }          from "@/lib/uat/uatContext"
import {
  UAT_ACCOUNTS,
  findAccountByEmail,
  ROLE_COLOR, ROLE_LABEL, ROLE_JABATAN,
  UATRole,
} from "@/lib/uat/uatSteps"

// ── SVG Icons ──────────────────────────────────────────────────
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = ({ off }: { off?: boolean }) => off ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

// ── ROLE GROUPS untuk tampilan UAT Quickstart ──────────────────
const ROLE_GROUPS: {
  role:     UATRole
  label:    string
  jabatan:  string
  color:    string
  count:    number
  range:    string
  icon:     React.FC
}[] = [
  {
    role:    "SUPER_ADMIN",
    label:   "Super Admin",
    jabatan: "Developer Tim",
    color:   "#ef4444",
    count:   2,
    range:   "SA-01 s.d SA-02",
    icon:    () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
  {
    role:    "SALES_MANAGER",
    label:   "Sales Manager",
    jabatan: "Leader Divisi",
    color:   "#3b82f6",
    count:   5,
    range:   "SM-01 s.d SM-05",
    icon:    () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    role:    "ACCOUNT_EXECUTIVE",
    label:   "Account Executive",
    jabatan: "Marketing Team",
    color:   "#10b981",
    count:   20,
    range:   "AE-01 s.d AE-20",
    icon:    () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    role:    "EXECUTIVE",
    label:   "Executive",
    jabatan: "Head / C-Level",
    color:   "#8b5cf6",
    count:   3,
    range:   "EX-01 s.d EX-03",
    icon:    () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

export default function LoginPage() {
  const router  = useRouter()
  const { isDark, toggle, mounted } = useTheme()
  const { start: startUAT, active: uatActive, role: uatRole, stepIndex } = useUAT()

  const [email,     setEmail]    = useState("")
  const [password,  setPassword] = useState("")
  const [showPw,    setShowPw]   = useState(false)
  const [loading,   setLoading]  = useState(false)
  const [error,     setError]    = useState("")
  const [status,    setStatus]   = useState<"idle"|"loading"|"success">("idle")
  const [detectedRole, setDetectedRole] = useState<UATRole | null>(null)

  // Detect role when email changes
  useEffect(() => {
    const account = findAccountByEmail(email.trim())
    setDetectedRole(account?.role ?? null)
  }, [email])

  // Quickfill akun
  function quickFill(role: UATRole, index: number) {
    const accounts = UAT_ACCOUNTS.filter((a) => a.role === role)
    const account  = accounts[index] ?? accounts[0]
    if (!account) return
    setEmail(account.email)
    setPassword(account.password)
    setError("")
    // Start UAT bubble
    startUAT(role)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(""); setStatus("loading")

    // Detect UAT account dan start bubble jika belum aktif
    const account = findAccountByEmail(email.trim())
    if (account && !uatActive) {
      startUAT(account.role)
    }

    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)

    if (res?.error) {
      setStatus("idle")
      setError("Email atau password tidak valid. Periksa kembali kredensial Anda.")
    } else {
      setStatus("success")
      setTimeout(() => router.push("/dashboard"), 800)
    }
  }

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#080d14" }} />

  const BG_STYLE = isDark
    ? { background: "linear-gradient(135deg, #05090f 0%, #080d18 50%, #050810 100%)" }
    : { background: "linear-gradient(135deg, #f0f4fa 0%, #e8f0fe 50%, #f4f0fc 100%)" }

  const GLASS_BG   = isDark ? "rgba(14,23,36,0.9)"    : "rgba(255,255,255,0.95)"
  const GLASS_BORDER = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const TEXT_PRI   = isDark ? "#f0f6fc"               : "#0d1f2d"
  const TEXT_SEC   = isDark ? "#4d6680"               : "#64748b"
  const TEXT_MUT   = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"
  const INPUT_BG   = isDark ? "rgba(19,31,48,0.8)"    : "#f8fafc"
  const INPUT_BD   = isDark ? "#1a2d42"               : "#dde3ec"
  const INPUT_COL  = isDark ? "#e8f0f8"               : "#0d1f2d"

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      position: "relative", overflow: "hidden",
      ...BG_STYLE,
    }}>

      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(${isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.05)"} 1px, transparent 1px),
          linear-gradient(90deg, ${isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.05)"} 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
      }} />

      {/* Radial glow */}
      <div style={{ position:"absolute", top:"15%", right:"8%", width:400, height:400, borderRadius:"50%", background: isDark ? "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)" : "radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          position: "fixed", top: 18, right: 18, zIndex: 100,
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px",
          background: isDark ? "rgba(14,23,36,0.85)" : "rgba(255,255,255,0.9)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 999, fontSize: 12, fontWeight: 600,
          color: isDark ? "#8ba3bf" : "#3d5166",
          cursor: "pointer", backdropFilter: "blur(10px)",
        }}
      >
        {isDark ? <IconSun /> : <IconMoon />}
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Layout */}
      <div style={{
        display: "flex", width: "100%", maxWidth: 1100,
        margin: "auto", padding: "24px 20px",
        gap: 48, alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
        flexWrap: "wrap",
      }}>

        {/* ── LEFT: Brand + UAT Quickstart ─────────────── */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 460, display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"   stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5"              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5"              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TEXT_PRI, letterSpacing: "-0.02em" }}>CMLabs CRM</div>
                <div style={{ fontSize: 10, color: TEXT_SEC, letterSpacing: "0.07em", textTransform: "uppercase" }}>Sales Management System</div>
              </div>
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 800, color: TEXT_PRI, lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: 10 }}>
              Masuk ke
              <br />
              <span style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Dashboard CRM
              </span>
            </h1>
            <p style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.7, maxWidth: 380 }}>
              Platform CRM terpadu untuk monitoring leads, forecasting revenue, dan document generator skripsi CMLabs.
            </p>
          </div>

          {/* UAT Quickstart */}
          <div style={{
            background:     isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)",
            border:         `1px solid ${isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.15)"}`,
            borderRadius:   14,
            padding:        "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(59,130,246,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#3b82f6",
              }}>
                <IconPlay />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_PRI }}>UAT Quickstart</div>
                <div style={{ fontSize: 10, color: TEXT_SEC }}>Klik role Anda untuk auto-isi form login + mulai bubble panduan</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {ROLE_GROUPS.map((rg) => {
                const Icon      = rg.icon
                const isActive  = uatActive && uatRole === rg.role
                const isDetected = detectedRole === rg.role

                return (
                  <button
                    key={rg.role}
                    type="button"
                    onClick={() => quickFill(rg.role, 0)}
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      gap:          8,
                      padding:      "9px 11px",
                      background:   isActive
                        ? rg.color + "18"
                        : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
                      border:       `1px solid ${isActive ? rg.color + "45" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                      borderRadius: 9,
                      cursor:       "pointer",
                      transition:   "all 0.15s",
                      textAlign:    "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background   = rg.color + "10"
                        e.currentTarget.style.borderColor  = rg.color + "35"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background   = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)"
                        e.currentTarget.style.borderColor  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
                      }
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      background: rg.color + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: rg.color,
                    }}>
                      <Icon />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: rg.color, lineHeight: 1.2 }}>
                        {rg.label}
                      </div>
                      <div style={{ fontSize: 10, color: TEXT_MUT, lineHeight: 1.3 }}>
                        {rg.jabatan} · {rg.count} akun
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: rg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                        <IconCheck />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* UAT active info */}
            {uatActive && uatRole && (
              <div style={{
                marginTop:    10,
                padding:      "8px 12px",
                background:   ROLE_COLOR[uatRole] + "12",
                border:       `1px solid ${ROLE_COLOR[uatRole]}30`,
                borderRadius: 8,
                display:      "flex",
                alignItems:   "center",
                gap:          7,
                fontSize:     11,
                color:        ROLE_COLOR[uatRole],
              }}>
                <IconPlay />
                <span>
                  <strong>Sesi UAT aktif</strong> — {ROLE_LABEL[uatRole]} ({ROLE_JABATAN[uatRole]}).
                  Bubble panduan akan muncul setelah login.
                  Progress tersimpan di langkah {stepIndex + 1}.
                </span>
              </div>
            )}

            <div style={{ marginTop: 8, padding: "7px 10px", background: isDark ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 7, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }}><IconInfo /></span>
              <p style={{ margin: 0, fontSize: 11, color: isDark ? "#fcd34d" : "#92400e", lineHeight: 1.5 }}>
                Pastikan menggunakan akun yang dikirimkan kepada Anda — jangan berbagi akun dengan responden lain.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "8 product backlog diuji: Login, Dashboard, Leads, Tim, Profil, Timeline, Forecasting, Laporan",
              "34 akun UAT unik — tidak ada konflik data antar responden",
              "Bubble panduan aktif di semua halaman selama sesi UAT",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", flexShrink: 0, marginTop: 1 }}>
                  <IconCheck />
                </div>
                <span style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Login Form ─────────────────────────── */}
        <div style={{ width: "100%", maxWidth: 400, flexShrink: 0 }}>
          <div style={{
            background:     GLASS_BG,
            backdropFilter: "blur(20px)",
            borderRadius:   18,
            padding:        "32px 28px",
            border:         `1px solid ${GLASS_BORDER}`,
            boxShadow:      isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(13,31,45,0.1)",
          }}>

            {/* Detected role badge */}
            {detectedRole && (
              <div style={{
                marginBottom:  16,
                padding:       "8px 12px",
                background:    ROLE_COLOR[detectedRole] + "12",
                border:        `1px solid ${ROLE_COLOR[detectedRole]}30`,
                borderRadius:  9,
                display:       "flex",
                alignItems:    "center",
                gap:           8,
                fontSize:      12, color: ROLE_COLOR[detectedRole], fontWeight: 500,
              }}>
                <IconShield />
                <span>
                  Akun <strong>{ROLE_LABEL[detectedRole]}</strong> terdeteksi — {ROLE_JABATAN[detectedRole]}
                </span>
              </div>
            )}

            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: TEXT_PRI, letterSpacing: "-0.02em" }}>
              Masuk ke Akun
            </h2>
            <p style={{ margin: "0 0 22px", fontSize: 13, color: TEXT_SEC }}>
              Gunakan kredensial akun UAT yang telah diberikan
            </p>

            {error && (
              <div style={{
                display: "flex", gap: 8, alignItems: "center",
                padding: "10px 13px", marginBottom: 16,
                background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "#fecaca"}`,
                borderRadius: 9, fontSize: 13,
                color: isDark ? "#f87171" : "#dc2626",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT_SEC, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Alamat Email
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: isDark ? "#2e4560" : "#94a3b8", pointerEvents: "none", display: "flex" }}>
                    <IconMail />
                  </div>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@cmlabs.co"
                    style={{
                      width: "100%", padding: "11px 12px 11px 40px",
                      background: INPUT_BG, color: INPUT_COL,
                      border: `1px solid ${INPUT_BD}`,
                      borderRadius: 10, fontSize: 13, boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)" }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = INPUT_BD;  e.currentTarget.style.boxShadow = "none" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT_SEC, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Kata Sandi
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: isDark ? "#2e4560" : "#94a3b8", pointerEvents: "none", display: "flex" }}>
                    <IconLock />
                  </div>
                  <input
                    type={showPw ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    style={{
                      width: "100%", padding: "11px 42px 11px 40px",
                      background: INPUT_BG, color: INPUT_COL,
                      border: `1px solid ${INPUT_BD}`,
                      borderRadius: 10, fontSize: 13, boxSizing: "border-box",
                      outline: "none",
                      letterSpacing: showPw ? "normal" : "0.06em",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)" }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = INPUT_BD;  e.currentTarget.style.boxShadow = "none" }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: isDark ? "#4d6680" : "#94a3b8", display: "flex", alignItems: "center", padding: 4 }}
                  >
                    <IconEye off={showPw} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || status === "success"}
                style={{
                  marginTop: 4, padding: "12px",
                  background: status === "success"
                    ? "linear-gradient(135deg,#059669,#047857)"
                    : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  color: "#fff", border: "none", borderRadius: 11,
                  fontSize: 14, fontWeight: 700,
                  cursor: loading || status === "success" ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: status === "success" ? "0 4px 16px rgba(5,150,105,0.35)" : "0 4px 16px rgba(59,130,246,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading && status !== "success") {
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,130,246,0.45)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.35)"
                }}
              >
                {status === "loading" ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />
                    Memverifikasi...
                  </>
                ) : status === "success" ? (
                  <><IconCheck /> Berhasil — Mengalihkan ke Dashboard...</>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <IconArrow />
                  </>
                )}
              </button>
            </form>

            {/* Daftar akun per role */}
            <div style={{ marginTop: 20, borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Akun Demo UAT — Password: Test1234!
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {ROLE_GROUPS.map((rg) => {
                  const firstAccount = UAT_ACCOUNTS.find((a) => a.role === rg.role)
                  const isActive     = uatActive && uatRole === rg.role
                  return (
                    <button
                      key={rg.role}
                      type="button"
                      onClick={() => quickFill(rg.role, 0)}
                      style={{
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "space-between",
                        padding:      "7px 10px",
                        background:   isActive ? rg.color + "12" : "transparent",
                        border:       `1px solid ${isActive ? rg.color + "35" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                        borderRadius: 8, cursor: "pointer", transition: "all 0.13s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background   = rg.color + "08"
                          e.currentTarget.style.borderColor  = rg.color + "25"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background   = "transparent"
                          e.currentTarget.style.borderColor  = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                        }
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: rg.color }}>
                          {rg.label}
                        </div>
                        <div style={{ fontSize: 10, color: TEXT_MUT, fontFamily: "monospace" }}>
                          {firstAccount?.email} {rg.count > 1 ? `(+${rg.count - 1} lainnya)` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {isActive ? (
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: rg.color + "20", color: rg.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Aktif
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, color: rg.color }}>Gunakan</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 10, color: TEXT_MUT, lineHeight: 1.5 }}>
                Klik role di atas untuk mengisi form secara otomatis. Akun Anda sudah didaftarkan sebelumnya di sistem.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}