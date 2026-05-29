"use client"

import { signIn }              from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"
import { useTheme }            from "@/hooks/useTheme"

// ── SVG Icons ──────────────────────────────────────────────────
const Ico = {
  Sun: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Mail: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Lock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Eye: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Building: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 22V12h6v10"/>
      <path d="M9 7h1"/><path d="M14 7h1"/>
      <path d="M9 11h1"/><path d="M14 11h1"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  CheckSmall: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
}

// ── CMLabs wordmark SVG ────────────────────────────────────────
// Representasi wordmark "CM" formal sebagai monogram
function CMLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0052CC"/>
      <text x="20" y="27" textAnchor="middle" fontFamily="'DM Sans', system-ui, sans-serif" fontWeight="800" fontSize="17" fill="#ffffff" letterSpacing="-0.5">CM</text>
    </svg>
  )
}

// ── Demo accounts ──────────────────────────────────────────────
type DemoRole = "SUPER_ADMIN" | "SALES_MANAGER" | "ACCOUNT_EXECUTIVE" | "EXECUTIVE"

const DEMO_ACCOUNTS: {
  role:    DemoRole
  label:   string
  jabatan: string
  email:   string
  color:   string
}[] = [
  { role:"SUPER_ADMIN",       label:"Super Admin",       jabatan:"Developer Tim",  email:"super_admin@cmlabs.co", color:"#c9292b" },
  { role:"SALES_MANAGER",     label:"Sales Manager",     jabatan:"Leader Divisi",  email:"sales_mgr@cmlabs.co",  color:"#0052CC" },
  { role:"ACCOUNT_EXECUTIVE", label:"Account Executive", jabatan:"Marketing Team", email:"ae@cmlabs.co",          color:"#0c7a4b" },
  { role:"EXECUTIVE",         label:"Executive",         jabatan:"Head / C-Level", email:"executive@cmlabs.co",   color:"#5e35b1" },
]

const DEMO_PASSWORD = "Demo123!"

export default function LoginPage() {
  const router                      = useRouter()
  const { isDark, toggle, mounted } = useTheme()

  const [email,       setEmail]       = useState("")
  const [password,    setPassword]    = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [error,       setError]       = useState("")
  const [loginStatus, setLoginStatus] = useState<"idle"|"loading"|"success">("idle")
  const [activeRole,  setActiveRole]  = useState<DemoRole | null>(null)

  useEffect(() => {
    const found = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    )
    setActiveRole(found?.role ?? null)
  }, [email])

  function quickFill(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email)
    setPassword(DEMO_PASSWORD)
    setActiveRole(acc.role)
    setError("")
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoginStatus("loading")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      setLoginStatus("idle")
      setError("Email atau password tidak valid.")
    } else {
      setLoginStatus("success")
      setTimeout(() => router.push("/dashboard"), 900)
    }
  }

  if (!mounted) return <div style={{ minHeight:"100vh", background:"#07111e" }} />

  // ── Color tokens ───────────────────────────────────────────────
  const bg         = isDark ? "#060a11"          : "#f2f4f7"
  const panelBg    = isDark ? "#0b1220"          : "#ffffff"
  const panelBd    = isDark ? "#1c2d44"          : "#dde3ec"
  const leftBg     = isDark ? "#08101c"          : "#0a1628"
  const inputBg    = isDark ? "#0f1c2e"          : "#f8fafc"
  const inputBd    = isDark ? "#1e3148"          : "#d4dae4"
  const inputTx    = isDark ? "#ddeaf8"          : "#0d1f2d"
  const labelTx    = isDark ? "#4d6d8a"          : "#56708a"
  const mutedTx    = isDark ? "#3a5470"          : "#8096ac"
  const cardBg     = isDark ? "#0f1d2e"          : "#f6f8fb"
  const cardBd     = isDark ? "#1c2d44"          : "#dde3ec"
  const headingTx  = isDark ? "#e8f2fc"          : "#0d1f2d"
  const subTx      = isDark ? "rgba(200,218,240,0.55)" : "rgba(13,31,45,0.5)"

  const detectedAcc = activeRole
    ? DEMO_ACCOUNTS.find((a) => a.role === activeRole) ?? null
    : null

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:bg, position:"relative" }}>

      {/* Theme toggle — top right */}
      <button
        onClick={toggle}
        style={{
          position:"fixed", top:16, right:16, zIndex:200,
          display:"flex", alignItems:"center", gap:6,
          padding:"6px 12px",
          background:isDark?"#0f1c2e":"#ffffff",
          border:`1px solid ${isDark?"#1e3148":"#d4dae4"}`,
          borderRadius:6, fontSize:12, fontWeight:500,
          color:isDark?"#4d6d8a":"#56708a",
          cursor:"pointer", transition:"all 0.15s",
          letterSpacing:"0.01em",
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0052CC"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark?"#1e3148":"#d4dae4"}
      >
        {isDark ? <Ico.Sun /> : <Ico.Moon />}
        {isDark ? "Light" : "Dark"}
      </button>

      {/* ── Two-column layout ─────────────────────────────────── */}
      <div style={{ display:"flex", width:"100%", minHeight:"100vh" }}>

        {/* ── LEFT PANEL — brand + system info ─────────────────── */}
        <div style={{
          width:            400,
          flexShrink:       0,
          background:       leftBg,
          borderRight:      `1px solid ${isDark?"#1c2d44":"#1a3050"}`,
          display:          "flex",
          flexDirection:    "column",
          padding:          "48px 40px",
          position:         "relative",
          overflow:         "hidden",
        }} className="login-left-panel">

          {/* Subtle top-right orb */}
          <div style={{
            position:"absolute", top:-60, right:-60,
            width:240, height:240, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(0,82,204,0.18) 0%, transparent 70%)",
            pointerEvents:"none",
          }} />

          {/* Top: logo + wordmark */}
          <div style={{ marginBottom:52, position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
              <CMLogo size={36} />
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#ffffff", letterSpacing:"-0.02em", lineHeight:1.1 }}>
                  CMLabs
                </div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:1 }}>
                  Internal System
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width:32, height:2, background:"#0052CC", borderRadius:1, marginBottom:28 }} />

            <h1 style={{ fontSize:26, fontWeight:700, color:"#ffffff", lineHeight:1.3, letterSpacing:"-0.025em", margin:"0 0 14px" }}>
              Sales CRM<br />Management System
            </h1>
            <p style={{ fontSize:13, color:"rgba(180,205,230,0.65)", lineHeight:1.75, margin:0, maxWidth:300 }}>
              Platform manajemen penjualan terpusat untuk tim internal CMLabs — monitoring pipeline, analitik performa, dan pengelolaan dokumen.
            </p>
          </div>

          {/* Module list */}
          <div style={{ flex:1, position:"relative", zIndex:1 }}>
            <div style={{
              fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.25)",
              letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16,
            }}>
              Modul Sistem
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                { label:"Lead Management",       sub:"Kanban board 6 tahap pipeline" },
                { label:"Dashboard Analytics",   sub:"KPI real-time & forecasting revenue" },
                { label:"Team Management",       sub:"Role-based access control" },
                { label:"Document Generator",    sub:"Invoice, SPK, MOU format .docx" },
                { label:"Activity Timeline",     sub:"Komunikasi & aktivitas per lead" },
                { label:"Reporting",             sub:"Laporan performa individu & tim" },
              ].map((m, i) => (
                <div
                  key={m.label}
                  style={{
                    display:"flex", alignItems:"flex-start", gap:12,
                    padding:"11px 0",
                    borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <div style={{
                    width:5, height:5, borderRadius:"50%",
                    background:"#0052CC", flexShrink:0, marginTop:6,
                  }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"rgba(220,235,252,0.9)", lineHeight:1.3 }}>{m.label}</div>
                    <div style={{ fontSize:11, color:"rgba(160,190,220,0.45)", marginTop:2 }}>{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: confidential notice */}
          <div style={{
            marginTop:40, paddingTop:20,
            borderTop:"1px solid rgba(255,255,255,0.07)",
            position:"relative", zIndex:1,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Ico.Building />
              <span style={{ fontSize:11, color:"rgba(160,190,220,0.4)", letterSpacing:"0.01em" }}>
                Akses terbatas — khusus karyawan CMLabs
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ───────────────────────────────── */}
        <div style={{
          flex:           1,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "48px 32px",
          overflowY:      "auto",
        }}>
          <div style={{ width:"100%", maxWidth:420 }}>

            {/* Form card */}
            <div style={{
              background:   panelBg,
              border:       `1px solid ${panelBd}`,
              borderRadius: 12,
              overflow:     "hidden",
              boxShadow:    isDark
                ? "0 4px 24px rgba(0,0,0,0.5)"
                : "0 4px 24px rgba(13,31,45,0.08)",
            }}>

              {/* Card header bar */}
              <div style={{
                padding:      "18px 24px",
                borderBottom: `1px solid ${panelBd}`,
                background:   isDark ? "#0d1826" : "#f6f8fb",
                display:      "flex",
                alignItems:   "center",
                gap:          10,
              }}>
                <CMLogo size={28} />
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:headingTx, letterSpacing:"-0.01em" }}>
                    CMLabs Sales CRM
                  </div>
                  <div style={{ fontSize:11, color:mutedTx }}>Masuk dengan akun internal Anda</div>
                </div>
              </div>

              {/* Form body */}
              <div style={{ padding:"24px" }}>

                {/* Detected role */}
                {detectedAcc && (
                  <div style={{
                    marginBottom:18, padding:"9px 13px",
                    background: detectedAcc.color + "0f",
                    border:`1px solid ${detectedAcc.color}28`,
                    borderLeft:`3px solid ${detectedAcc.color}`,
                    borderRadius:"0 6px 6px 0",
                    display:"flex", alignItems:"center", gap:9,
                  }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:detectedAcc.color, flexShrink:0 }} />
                    <span style={{ fontSize:12, color:detectedAcc.color, fontWeight:600 }}>
                      {detectedAcc.label}
                    </span>
                    <span style={{ fontSize:12, color:labelTx }}>—</span>
                    <span style={{ fontSize:12, color:labelTx }}>{detectedAcc.jabatan}</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    display:"flex", gap:8, alignItems:"flex-start",
                    padding:"10px 13px", marginBottom:18,
                    background: isDark ? "rgba(201,41,43,0.09)" : "#fff0f0",
                    border:`1px solid ${isDark?"rgba(201,41,43,0.22)":"#fbc8c8"}`,
                    borderRadius:6, fontSize:13,
                    color: isDark?"#f87171":"#c9292b",
                  }}>
                    <span style={{ flexShrink:0, marginTop:1 }}><Ico.AlertCircle /></span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>

                  {/* Email */}
                  <div>
                    <label style={{
                      display:"block", fontSize:11, fontWeight:600,
                      color:labelTx, marginBottom:7,
                      textTransform:"uppercase", letterSpacing:"0.07em",
                    }}>
                      Alamat Email
                    </label>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:mutedTx, pointerEvents:"none", display:"flex" }}>
                        <Ico.Mail />
                      </div>
                      <input
                        type="email" required autoComplete="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@cmlabs.co"
                        style={{
                          width:"100%", padding:"10px 12px 10px 38px",
                          background:inputBg, color:inputTx,
                          border:`1px solid ${inputBd}`,
                          borderRadius:7, fontSize:13,
                          boxSizing:"border-box", outline:"none",
                          transition:"border-color 0.15s, box-shadow 0.15s",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#0052CC"
                          e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(0,82,204,0.12)"
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = inputBd
                          e.currentTarget.style.boxShadow  = "none"
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{
                      display:"block", fontSize:11, fontWeight:600,
                      color:labelTx, marginBottom:7,
                      textTransform:"uppercase", letterSpacing:"0.07em",
                    }}>
                      Kata Sandi
                    </label>
                    <div style={{ position:"relative" }}>
                      <div style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:mutedTx, pointerEvents:"none", display:"flex" }}>
                        <Ico.Lock />
                      </div>
                      <input
                        type={showPw?"text":"password"} required autoComplete="current-password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi"
                        style={{
                          width:"100%", padding:"10px 40px 10px 38px",
                          background:inputBg, color:inputTx,
                          border:`1px solid ${inputBd}`,
                          borderRadius:7, fontSize:13,
                          boxSizing:"border-box", outline:"none",
                          letterSpacing:showPw?"normal":"0.06em",
                          transition:"border-color 0.15s, box-shadow 0.15s",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#0052CC"
                          e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(0,82,204,0.12)"
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = inputBd
                          e.currentTarget.style.boxShadow  = "none"
                        }}
                      />
                      <button
                        type="button" onClick={() => setShowPw(!showPw)}
                        style={{
                          position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                          background:"none", border:"none", cursor:"pointer",
                          color:mutedTx, display:"flex", alignItems:"center", padding:4,
                          transition:"color 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#0052CC"}
                        onMouseLeave={(e) => e.currentTarget.style.color = mutedTx}
                      >
                        {showPw ? <Ico.EyeOff /> : <Ico.Eye />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginStatus !== "idle"}
                    style={{
                      marginTop:4, padding:"11px 16px",
                      background: loginStatus === "success"
                        ? "#0c7a4b"
                        : loginStatus === "loading"
                        ? (isDark?"#0a1f38":"#e8f0fc")
                        : "#0052CC",
                      color: loginStatus === "loading"
                        ? (isDark?"#4d6d8a":"#0052CC")
                        : "#ffffff",
                      border:       "none",
                      borderRadius: 7,
                      fontSize:     14,
                      fontWeight:   600,
                      letterSpacing:"-0.01em",
                      cursor:   loginStatus !== "idle" ? "not-allowed" : "pointer",
                      display:  "flex", alignItems:"center", justifyContent:"center", gap:8,
                      transition:"all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (loginStatus === "idle") {
                        e.currentTarget.style.background = "#0041a8"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (loginStatus === "idle") {
                        e.currentTarget.style.background = "#0052CC"
                      }
                    }}
                  >
                    {loginStatus === "loading" ? (
                      <>
                        <div style={{
                          width:15, height:15, borderRadius:"50%",
                          border:`2px solid ${isDark?"#1e3148":"#b8d0f5"}`,
                          borderTopColor: "#0052CC",
                          animation:"spin .7s linear infinite",
                        }} />
                        Memverifikasi...
                      </>
                    ) : loginStatus === "success" ? (
                      <><Ico.Check /> Berhasil — Mengalihkan...</>
                    ) : (
                      <>Masuk ke Sistem <Ico.ArrowRight /></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Demo Accounts ───────────────────────────────── */}
            <div style={{
              marginTop:   16,
              background:  panelBg,
              border:      `1px solid ${panelBd}`,
              borderRadius:12,
              overflow:    "hidden",
              boxShadow:   isDark
                ? "0 2px 12px rgba(0,0,0,0.35)"
                : "0 2px 12px rgba(13,31,45,0.06)",
            }}>
              {/* Header */}
              <div style={{
                padding:      "13px 18px",
                borderBottom: `1px solid ${panelBd}`,
                background:   isDark ? "#0d1826" : "#f6f8fb",
                display:      "flex",
                justifyContent:"space-between",
                alignItems:   "center",
              }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:headingTx, letterSpacing:"-0.01em" }}>
                    Akun Demo
                  </div>
                  <div style={{ fontSize:11, color:mutedTx, marginTop:1 }}>
                    Klik untuk mengisi formulir secara otomatis
                  </div>
                </div>
                <code style={{
                  fontSize:11, fontWeight:600,
                  padding:"3px 8px", borderRadius:4,
                  background: isDark?"#0a1626":"#edf2fb",
                  border:`1px solid ${isDark?"#1e3148":"#c5d5f0"}`,
                  color: isDark?"#4d89d4":"#0052CC",
                  letterSpacing:"0.02em",
                }}>
                  {DEMO_PASSWORD}
                </code>
              </div>

              {/* Role rows */}
              <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:4 }}>
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSel = activeRole === acc.role
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => quickFill(acc)}
                      style={{
                        display:      "flex",
                        alignItems:   "center",
                        gap:          12,
                        padding:      "9px 12px",
                        background:   isSel ? acc.color + "0d" : "transparent",
                        border:       `1px solid ${isSel ? acc.color + "35" : "transparent"}`,
                        borderRadius: 7,
                        cursor:       "pointer",
                        transition:   "all 0.12s",
                        textAlign:    "left",
                        width:        "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background   = acc.color + "0a"
                        e.currentTarget.style.borderColor  = acc.color + "30"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background   = isSel ? acc.color + "0d" : "transparent"
                        e.currentTarget.style.borderColor  = isSel ? acc.color + "35" : "transparent"
                      }}
                    >
                      {/* Role color strip */}
                      <div style={{
                        width:3, height:32, borderRadius:2,
                        background:acc.color, flexShrink:0,
                      }} />

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:headingTx }}>
                            {acc.label}
                          </span>
                          <span style={{
                            fontSize:9, fontWeight:700, padding:"1px 5px",
                            borderRadius:3,
                            background:acc.color+"14",
                            color:acc.color,
                            textTransform:"uppercase",
                            letterSpacing:"0.04em",
                          }}>
                            {acc.jabatan}
                          </span>
                        </div>
                        <div style={{ fontSize:11, color:mutedTx, marginTop:2, fontFamily:"'DM Mono', monospace" }}>
                          {acc.email}
                        </div>
                      </div>

                      {/* Right: check or chevron */}
                      {isSel ? (
                        <div style={{
                          width:18, height:18, borderRadius:"50%",
                          background:acc.color,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0, color:"#fff",
                        }}>
                          <Ico.CheckSmall />
                        </div>
                      ) : (
                        <span style={{ color:mutedTx, flexShrink:0, opacity:0.5 }}>
                          <Ico.ChevronRight />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding:   "10px 18px",
                borderTop: `1px solid ${panelBd}`,
                background:isDark?"#0d1826":"#f6f8fb",
                fontSize:  11,
                color:     mutedTx,
                lineHeight:1.6,
              }}>
                Sistem ini hanya dapat diakses oleh personel yang telah mendapatkan otorisasi dari administrator CMLabs.
              </div>
            </div>

            {/* Bottom copyright */}
            <div style={{
              marginTop:  24,
              textAlign:  "center",
              fontSize:   11,
              color:      mutedTx,
              letterSpacing:"0.01em",
            }}>
              &copy; {new Date().getFullYear()} CMLabs &mdash; Confidential Internal System
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          .login-left-panel { display: none !important; }
        }

        @media (max-width: 480px) {
          div[style*="padding: 48px 32px"] {
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  )
}