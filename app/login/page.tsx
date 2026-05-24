"use client"

import { signIn }               from "next-auth/react"
import { useState, useEffect }  from "react"
import { useRouter }            from "next/navigation"
import { useTheme }             from "@/hooks/useTheme"
import { useUAT }               from "@/lib/uat/uatContext"
import {
  UAT_ACCOUNTS, findAccountByEmail,
  ROLE_COLOR, ROLE_LABEL, ROLE_JABATAN,
  type UATRole,
} from "@/lib/uat/uatSteps"

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
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  ClipBoard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Play: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  User: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Shield: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

// ── Role groups data ───────────────────────────────────────────
type RoleGroup = {
  role:    UATRole
  label:   string
  jabatan: string
  color:   string
  count:   number
  desc:    string
}

const ROLE_GROUPS: RoleGroup[] = [
  { role:"SUPER_ADMIN",       label:"Super Admin",       jabatan:"Developer Tim",   color:"#ef4444", count:2,  desc:"Akses penuh semua fitur" },
  { role:"SALES_MANAGER",     label:"Sales Manager",     jabatan:"Leader Divisi",   color:"#3b82f6", count:5,  desc:"Kelola tim, leads, laporan" },
  { role:"ACCOUNT_EXECUTIVE", label:"Account Executive", jabatan:"Marketing Team",  color:"#10b981", count:20, desc:"Kelola leads sendiri, timeline" },
  { role:"EXECUTIVE",         label:"Executive",         jabatan:"Head / C-Level",  color:"#8b5cf6", count:3,  desc:"Dashboard & monitoring — read-only" },
]

// ── UAT Mode Toggle State ──────────────────────────────────────
// "regular" = login biasa tanpa panduan UAT
// "uat"     = login dengan panduan UAT (bubble aktif)
type LoginMode = "regular" | "uat"

export default function LoginPage() {
  const router  = useRouter()
  const { isDark, toggle, mounted } = useTheme()
  const { start: startUAT, active: uatActive, role: uatRole, stepIndex } = useUAT()

  const [email,        setEmail]        = useState("")
  const [password,     setPassword]     = useState("")
  const [showPw,       setShowPw]       = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState("")
  const [loginStatus,  setLoginStatus]  = useState<"idle"|"loading"|"success">("idle")
  const [detectedRole, setDetectedRole] = useState<UATRole | null>(null)
  const [loginMode,    setLoginMode]    = useState<LoginMode>("regular")
  const [showUATInfo,  setShowUATInfo]  = useState(false)

  // Auto-detect role when email changes
  useEffect(() => {
    const acc = findAccountByEmail(email.trim())
    setDetectedRole(acc?.role ?? null)
  }, [email])

  // ── Quick-fill untuk login BIASA (tanpa start UAT) ────────────
  function quickFillRegular(role: UATRole) {
    const acc = UAT_ACCOUNTS.find((a) => a.role === role)
    if (!acc) return
    setEmail(acc.email)
    setPassword(acc.password)
    setLoginMode("regular")
    setError("")
  }

  // ── Quick-fill untuk login UAT (dengan start bubble) ──────────
  function quickFillUAT(role: UATRole) {
    const acc = UAT_ACCOUNTS.find((a) => a.role === role)
    if (!acc) return
    setEmail(acc.email)
    setPassword(acc.password)
    setLoginMode("uat")
    startUAT(role)
    setError("")
  }

  // ── Submit login ───────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(""); setLoginStatus("loading")

    // Jika mode UAT dan belum di-start, start sekarang
    if (loginMode === "uat") {
      const acc = findAccountByEmail(email.trim())
      if (acc && !uatActive) startUAT(acc.role)
    }

    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)

    if (res?.error) {
      setLoginStatus("idle")
      setError("Email atau password tidak valid. Periksa kembali kredensial Anda.")
    } else {
      setLoginStatus("success")
      setTimeout(() => router.push("/dashboard"), 800)
    }
  }

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#07111e" }} />

  // ── Computed styles ────────────────────────────────────────────
  const T = {
    pri:       isDark ? "#f0f6fc"                            : "#0d1f2d",
    sec:       isDark ? "#4d6680"                            : "#64748b",
    mut:       isDark ? "rgba(255,255,255,0.22)"             : "rgba(0,0,0,0.28)",
    glassBg:   isDark ? "rgba(14,23,36,0.92)"               : "rgba(255,255,255,0.96)",
    glassBd:   isDark ? "rgba(255,255,255,0.08)"             : "rgba(0,0,0,0.08)",
    inputBg:   isDark ? "rgba(19,31,48,0.85)"               : "#f8fafc",
    inputBd:   isDark ? "#1a2d42"                            : "#dde3ec",
    inputCol:  isDark ? "#e8f0f8"                            : "#0d1f2d",
    divider:   isDark ? "rgba(255,255,255,0.07)"             : "rgba(0,0,0,0.07)",
    cardBg:    isDark ? "rgba(255,255,255,0.04)"             : "rgba(255,255,255,0.7)",
    cardBd:    isDark ? "rgba(255,255,255,0.07)"             : "rgba(0,0,0,0.07)",
    secBg:     isDark ? "rgba(255,255,255,0.03)"             : "rgba(0,0,0,0.02)",
    modePill:  (active: boolean) => active
      ? isDark ? "rgba(59,130,246,0.2)"  : "rgba(59,130,246,0.12)"
      : isDark ? "rgba(255,255,255,0.05)": "rgba(0,0,0,0.05)",
    modePillBd:(active: boolean) => active
      ? "rgba(59,130,246,0.5)"
      : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    modePillColor:(active: boolean) => active ? "#3b82f6" : T.sec,
  }

  return (
    <div style={{
      minHeight:    "100vh",
      display:      "flex",
      position:     "relative",
      overflow:     "hidden",
      background:   isDark
        ? "linear-gradient(135deg,#05090f 0%,#080d18 50%,#050810 100%)"
        : "linear-gradient(135deg,#f0f4fa 0%,#e8f0fe 50%,#f4f0fc 100%)",
    }}>

      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(${isDark?"rgba(59,130,246,0.04)":"rgba(59,130,246,0.05)"} 1px,transparent 1px),
          linear-gradient(90deg,${isDark?"rgba(59,130,246,0.04)":"rgba(59,130,246,0.05)"} 1px,transparent 1px)`,
        backgroundSize: "44px 44px",
      }} />
      <div style={{ position:"absolute",top:"12%",right:"6%",width:380,height:380,borderRadius:"50%",background:isDark?"radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)":"radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)",pointerEvents:"none" }} />
      <div style={{ position:"absolute",bottom:"8%",left:"4%",width:220,height:220,borderRadius:"50%",background:isDark?"radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)":"radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)",pointerEvents:"none" }} />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          position:"fixed",top:18,right:18,zIndex:100,
          display:"flex",alignItems:"center",gap:6,
          padding:"6px 13px",
          background:isDark?"rgba(14,23,36,0.85)":"rgba(255,255,255,0.9)",
          border:`1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,
          borderRadius:999,fontSize:12,fontWeight:600,
          color:isDark?"#8ba3bf":"#3d5166",cursor:"pointer",
          backdropFilter:"blur(10px)",
        }}
      >
        {isDark ? <Ico.Sun /> : <Ico.Moon />}
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* ── Main layout ─────────────────────────────────── */}
      <div style={{
        display:"flex",width:"100%",maxWidth:1100,
        margin:"auto",padding:"24px 20px",
        gap:40,alignItems:"flex-start",justifyContent:"center",
        position:"relative",zIndex:1,flexWrap:"wrap",
        paddingTop:60,
      }}>

        {/* ── LEFT: Brand + Demo accounts ──────────────── */}
        <div style={{ flex:1,minWidth:280,maxWidth:440,display:"flex",flexDirection:"column",gap:24,paddingTop:16 }}>

          {/* Brand */}
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
              <div style={{
                width:40,height:40,borderRadius:11,
                background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 4px 16px rgba(59,130,246,0.4)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5"             stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5"             stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:16,fontWeight:800,color:T.pri,letterSpacing:"-0.02em" }}>CMLabs CRM</div>
                <div style={{ fontSize:10,color:T.sec,letterSpacing:"0.07em",textTransform:"uppercase" }}>Sales Management System</div>
              </div>
            </div>
            <h1 style={{ fontSize:30,fontWeight:800,color:T.pri,lineHeight:1.2,letterSpacing:"-0.03em",marginBottom:10 }}>
              Masuk ke<br />
              <span style={{ background:"linear-gradient(135deg,#3b82f6,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                Dashboard CRM
              </span>
            </h1>
            <p style={{ fontSize:13,color:T.sec,lineHeight:1.7,maxWidth:380 }}>
              Platform CRM terpadu — monitoring leads, forecasting revenue, dan document generator.
            </p>
          </div>

          {/* ── Demo accounts section ─────────────────── */}
          <div style={{
            background:   T.glassBg,
            backdropFilter:"blur(16px)",
            border:       `1px solid ${T.glassBd}`,
            borderRadius: 16,
            overflow:     "hidden",
          }}>
            {/* Section header */}
            <div style={{
              padding:      "14px 16px",
              borderBottom: `1px solid ${T.divider}`,
              background:   T.secBg,
            }}>
              <div style={{ fontSize:12,fontWeight:700,color:T.pri,marginBottom:2 }}>
                Akun Demo
              </div>
              <div style={{ fontSize:11,color:T.sec }}>
                Password semua akun: <span style={{ fontFamily:"monospace",background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)",padding:"1px 5px",borderRadius:4 }}>Test1234!</span>
              </div>
            </div>

            {/* Mode selector */}
            <div style={{ padding:"10px 12px", borderBottom:`1px solid ${T.divider}` }}>
              <div style={{ display:"flex",gap:6,marginBottom:0 }}>
                {/* Regular mode */}
                <button
                  onClick={() => setLoginMode("regular")}
                  style={{
                    flex:1,padding:"8px 10px",
                    background:   loginMode === "regular"
                      ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
                      : "transparent",
                    border:       `1px solid ${loginMode === "regular"
                      ? isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)"
                      : T.cardBd}`,
                    borderRadius: 9,cursor:"pointer",
                    transition:   "all 0.15s",
                    textAlign:    "center",
                  }}
                >
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:2 }}>
                    <Ico.User />
                    <span style={{ fontSize:11,fontWeight:600,color: loginMode === "regular" ? T.pri : T.sec }}>
                      Login Demo
                    </span>
                  </div>
                  <div style={{ fontSize:10,color:T.mut,lineHeight:1.3 }}>Coba sistem tanpa panduan</div>
                </button>

                {/* UAT mode */}
                <button
                  onClick={() => setLoginMode("uat")}
                  style={{
                    flex:1,padding:"8px 10px",
                    background:   loginMode === "uat"
                      ? "rgba(59,130,246,0.12)"
                      : "transparent",
                    border:       `1px solid ${loginMode === "uat"
                      ? "rgba(59,130,246,0.4)"
                      : T.cardBd}`,
                    borderRadius: 9,cursor:"pointer",
                    transition:   "all 0.15s",
                    textAlign:    "center",
                  }}
                >
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:2 }}>
                    <span style={{ color: loginMode === "uat" ? "#3b82f6" : T.sec }}><Ico.ClipBoard /></span>
                    <span style={{ fontSize:11,fontWeight:600,color: loginMode === "uat" ? "#3b82f6" : T.sec }}>
                      Login UAT
                    </span>
                  </div>
                  <div style={{ fontSize:10,color:loginMode==="uat"?"rgba(59,130,246,0.7)":T.mut,lineHeight:1.3 }}>
                    Dengan bubble panduan langkah-demi-langkah
                  </div>
                </button>
              </div>

              {/* UAT mode info */}
              {loginMode === "uat" && (
                <div style={{
                  marginTop:8,padding:"7px 10px",
                  background:"rgba(59,130,246,0.07)",
                  border:"1px solid rgba(59,130,246,0.18)",
                  borderRadius:8,
                  display:"flex",gap:7,alignItems:"flex-start",
                }}>
                  <span style={{ color:"#3b82f6",flexShrink:0,marginTop:1 }}><Ico.Info /></span>
                  <p style={{ margin:0,fontSize:11,color:isDark?"#93c5fd":"#1d4ed8",lineHeight:1.5 }}>
                    Mode UAT: Bubble panduan akan muncul di pojok kanan bawah dan membimbing Anda langkah demi langkah di semua halaman hingga pengisian kuesioner.
                  </p>
                </div>
              )}
              {loginMode === "regular" && (
                <div style={{
                  marginTop:8,padding:"7px 10px",
                  background:isDark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",
                  border:`1px solid ${T.cardBd}`,
                  borderRadius:8,
                  display:"flex",gap:7,alignItems:"flex-start",
                }}>
                  <span style={{ color:T.sec,flexShrink:0,marginTop:1 }}><Ico.Info /></span>
                  <p style={{ margin:0,fontSize:11,color:T.sec,lineHeight:1.5 }}>
                    Mode Demo: Login tanpa panduan UAT. Eksplorasi sistem secara bebas tanpa bubble pengarah.
                  </p>
                </div>
              )}
            </div>

            {/* Role buttons */}
            <div style={{ padding:"10px 12px" }}>
              <div style={{ fontSize:10,fontWeight:700,color:T.mut,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7 }}>
                Pilih role untuk auto-isi form
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                {ROLE_GROUPS.map((rg) => {
                  const isActiveUAT  = uatActive && uatRole === rg.role
                  const firstAcc     = UAT_ACCOUNTS.find((a) => a.role === rg.role)

                  return (
                    <button
                      key={rg.role}
                      type="button"
                      onClick={() =>
                        loginMode === "uat"
                          ? quickFillUAT(rg.role)
                          : quickFillRegular(rg.role)
                      }
                      style={{
                        display:        "flex",
                        alignItems:     "center",
                        gap:            10,
                        padding:        "9px 12px",
                        background:     isActiveUAT
                          ? rg.color + "12"
                          : T.cardBg,
                        border:         `1px solid ${isActiveUAT ? rg.color + "45" : T.cardBd}`,
                        borderRadius:   9,
                        cursor:         "pointer",
                        transition:     "all 0.13s",
                        textAlign:      "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background   = rg.color + "10"
                        e.currentTarget.style.borderColor  = rg.color + "40"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background   = isActiveUAT ? rg.color + "12" : T.cardBg
                        e.currentTarget.style.borderColor  = isActiveUAT ? rg.color + "45" : T.cardBd
                      }}
                    >
                      {/* Color dot */}
                      <div style={{
                        width:10,height:10,borderRadius:"50%",
                        background:rg.color,flexShrink:0,
                      }} />

                      {/* Info */}
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <span style={{ fontSize:12,fontWeight:600,color:T.pri }}>
                            {rg.label}
                          </span>
                          <span style={{
                            fontSize:9,padding:"1px 5px",borderRadius:999,
                            background:rg.color+"15",color:rg.color,fontWeight:700,
                          }}>
                            {rg.jabatan}
                          </span>
                        </div>
                        <div style={{ fontSize:10,color:T.mut,marginTop:1,fontFamily:"monospace" }}>
                          {firstAcc?.email}{rg.count > 1 ? ` (+${rg.count - 1})` : ""}
                        </div>
                      </div>

                      {/* Mode indicator */}
                      {loginMode === "uat" ? (
                        <div style={{
                          display:"flex",alignItems:"center",gap:4,
                          padding:"3px 7px",
                          background:isActiveUAT ? rg.color+"20" : "rgba(59,130,246,0.1)",
                          border:`1px solid ${isActiveUAT ? rg.color+"40" : "rgba(59,130,246,0.25)"}`,
                          borderRadius:999,flexShrink:0,
                        }}>
                          <span style={{ color: isActiveUAT ? rg.color : "#3b82f6" }}>
                            <Ico.Play />
                          </span>
                          <span style={{ fontSize:9,fontWeight:700,color: isActiveUAT ? rg.color : "#3b82f6",whiteSpace:"nowrap" }}>
                            {isActiveUAT ? "Aktif" : "UAT"}
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          fontSize:9,color:T.sec,
                          display:"flex",alignItems:"center",gap:3,
                          padding:"3px 7px",
                          background:isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
                          borderRadius:999,flexShrink:0,
                        }}>
                          <Ico.User />
                          <span style={{ fontWeight:600 }}>Demo</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active UAT indicator */}
            {uatActive && uatRole && loginMode === "uat" && (
              <div style={{
                margin:"0 12px 12px",
                padding:"8px 11px",
                background:ROLE_COLOR[uatRole]+"0d",
                border:`1px solid ${ROLE_COLOR[uatRole]}30`,
                borderRadius:9,
                display:"flex",gap:8,alignItems:"center",
              }}>
                <Ico.Shield />
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:11,color:ROLE_COLOR[uatRole],fontWeight:600 }}>
                    Sesi UAT {ROLE_LABEL[uatRole]} aktif
                  </span>
                  <span style={{ fontSize:10,color:T.sec,marginLeft:6 }}>
                    · Progress langkah {stepIndex + 1} tersimpan
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Login Form ─────────────────────────── */}
        <div style={{ width:"100%",maxWidth:400,flexShrink:0,paddingTop:16 }}>
          <div style={{
            background:     T.glassBg,
            backdropFilter: "blur(20px)",
            borderRadius:   18,
            padding:        "30px 26px",
            border:         `1px solid ${T.glassBd}`,
            boxShadow:      isDark?"0 20px 60px rgba(0,0,0,0.6)":"0 20px 60px rgba(13,31,45,0.1)",
          }}>

            {/* Detected role badge */}
            {detectedRole && (
              <div style={{
                marginBottom:16,padding:"8px 11px",
                background:ROLE_COLOR[detectedRole]+"10",
                border:`1px solid ${ROLE_COLOR[detectedRole]}30`,
                borderRadius:9,
                display:"flex",alignItems:"center",gap:8,
                fontSize:12,color:ROLE_COLOR[detectedRole],fontWeight:500,
              }}>
                <Ico.Shield />
                <span>
                  Akun <strong>{ROLE_LABEL[detectedRole]}</strong> — {ROLE_JABATAN[detectedRole]}
                </span>
                {/* Mode badge */}
                <span style={{
                  marginLeft:"auto",flexShrink:0,
                  fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:999,
                  background: loginMode === "uat"
                    ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.08)",
                  color: loginMode === "uat" ? "#3b82f6" : T.sec,
                  border: `1px solid ${loginMode === "uat" ? "rgba(59,130,246,0.3)" : T.divider}`,
                }}>
                  {loginMode === "uat" ? "Mode UAT" : "Mode Demo"}
                </span>
              </div>
            )}

            <h2 style={{ margin:"0 0 4px",fontSize:20,fontWeight:800,color:T.pri,letterSpacing:"-0.02em" }}>
              Masuk ke Akun
            </h2>
            <p style={{ margin:"0 0 20px",fontSize:13,color:T.sec }}>
              Gunakan kredensial akun yang telah diberikan
            </p>

            {/* Error */}
            {error && (
              <div style={{
                display:"flex",gap:8,alignItems:"center",
                padding:"10px 13px",marginBottom:16,
                background:isDark?"rgba(239,68,68,0.1)":"#fef2f2",
                border:`1px solid ${isDark?"rgba(239,68,68,0.2)":"#fecaca"}`,
                borderRadius:9,fontSize:13,
                color:isDark?"#f87171":"#dc2626",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8"  x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:15 }}>

              {/* Email */}
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:T.sec,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em" }}>
                  Alamat Email
                </label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:isDark?"#2e4560":"#94a3b8",pointerEvents:"none",display:"flex" }}>
                    <Ico.Mail />
                  </div>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@cmlabs.co"
                    style={{
                      width:"100%",padding:"11px 12px 11px 40px",
                      background:T.inputBg,color:T.inputCol,
                      border:`1px solid ${T.inputBd}`,
                      borderRadius:10,fontSize:13,
                      boxSizing:"border-box",outline:"none",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(59,130,246,0.15)" }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor=T.inputBd;  e.currentTarget.style.boxShadow="none" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:T.sec,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em" }}>
                  Kata Sandi
                </label>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:isDark?"#2e4560":"#94a3b8",pointerEvents:"none",display:"flex" }}>
                    <Ico.Lock />
                  </div>
                  <input
                    type={showPw ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    style={{
                      width:"100%",padding:"11px 42px 11px 40px",
                      background:T.inputBg,color:T.inputCol,
                      border:`1px solid ${T.inputBd}`,
                      borderRadius:10,fontSize:13,
                      boxSizing:"border-box",outline:"none",
                      letterSpacing:showPw?"normal":"0.06em",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(59,130,246,0.15)" }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor=T.inputBd;  e.currentTarget.style.boxShadow="none" }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    style={{
                      position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",
                      background:"none",border:"none",cursor:"pointer",
                      color:isDark?"#4d6680":"#94a3b8",
                      display:"flex",alignItems:"center",padding:4,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark?"#4d6680":"#94a3b8"}
                  >
                    {showPw ? <Ico.EyeOff /> : <Ico.Eye />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || loginStatus === "success"}
                style={{
                  marginTop:4,padding:"12px",
                  background: loginStatus === "success"
                    ? "linear-gradient(135deg,#059669,#047857)"
                    : loginMode === "uat"
                    ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                    : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  color:"#fff",border:"none",borderRadius:11,
                  fontSize:14,fontWeight:700,
                  cursor:loading||loginStatus==="success"?"not-allowed":"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  boxShadow:loginStatus==="success"
                    ?"0 4px 16px rgba(5,150,105,0.35)"
                    :"0 4px 16px rgba(59,130,246,0.35)",
                  transition:"all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if(!loading && loginStatus!=="success"){
                    e.currentTarget.style.transform="translateY(-1px)"
                    e.currentTarget.style.boxShadow="0 8px 24px rgba(59,130,246,0.45)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform="none"
                  e.currentTarget.style.boxShadow="0 4px 16px rgba(59,130,246,0.35)"
                }}
              >
                {loginStatus === "loading" ? (
                  <>
                    <div style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite" }} />
                    Memverifikasi...
                  </>
                ) : loginStatus === "success" ? (
                  <><Ico.Check /> Berhasil — Mengalihkan...</>
                ) : loginMode === "uat" ? (
                  <>
                    <Ico.Play /> Masuk + Mulai Panduan UAT
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard <Ico.Arrow />
                  </>
                )}
              </button>
            </form>

            {/* Mode indicator footer */}
            <div style={{
              marginTop:16,padding:"9px 12px",
              background: loginMode === "uat"
                ? "rgba(59,130,246,0.07)"
                : T.secBg,
              border:`1px solid ${loginMode === "uat" ? "rgba(59,130,246,0.2)" : T.divider}`,
              borderRadius:9,
              display:"flex",alignItems:"center",gap:7,
              fontSize:11,
              color: loginMode === "uat" ? (isDark?"#93c5fd":"#1d4ed8") : T.sec,
            }}>
              {loginMode === "uat" ? <Ico.ClipBoard /> : <Ico.User />}
              <span>
                {loginMode === "uat"
                  ? "Mode UAT aktif — bubble panduan akan muncul setelah login dan mengikuti Anda di semua halaman"
                  : "Mode Demo — eksplorasi sistem bebas tanpa panduan UAT"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}