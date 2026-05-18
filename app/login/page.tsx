"use client"

import { signIn }    from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme }  from "@/hooks/useTheme"

// ── SVG Icons (no emoji) ───────────────────────────────────────
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function LoginPage() {
  const router               = useRouter()
  const { isDark, toggle, mounted } = useTheme()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [status,   setStatus]   = useState<"idle"|"loading"|"success">("idle")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(""); setStatus("loading")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) { setStatus("idle"); setError("Email atau password tidak valid.") }
    else { setStatus("success"); setTimeout(() => router.push("/dashboard"), 900) }
  }

  const DEMO_ACCOUNTS = [
    { email: "super_admin@cmlabs.co", role: "Super Admin",       color: "#dc2626" },
    { email: "executive@cmlabs.co",   role: "Executive",         color: "#7c3aed" },
    { email: "sales_mgr@cmlabs.co",  role: "Sales Manager",     color: "#2563eb" },
    { email: "ae@cmlabs.co",         role: "Account Executive", color: "#059669" },
  ]

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#080d14" }} />

  return (
    <div style={{
      minHeight:  "100vh",
      display:    "flex",
      background: isDark
        ? "linear-gradient(135deg, #060a12 0%, #0a1628 40%, #070d1e 100%)"
        : "linear-gradient(135deg, #f0f4fa 0%, #e8f0fe 50%, #f4f0fc 100%)",
      position:   "relative",
      overflow:   "hidden",
    }}>

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(${isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.05)"} 1px, transparent 1px),
          linear-gradient(90deg, ${isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.05)"} 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "15%", right: "10%",
        width: 500, height: 500, borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", left: "5%",
        width: 300, height: 300, borderRadius: "50%",
        background: isDark
          ? "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          position: "fixed", top: 20, right: 20, zIndex: 100,
          display: "flex", alignItems: "center", gap: 7,
          padding: "7px 14px",
          background: isDark ? "rgba(14,23,36,0.8)" : "rgba(255,255,255,0.85)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 999,
          color: isDark ? "#8ba3bf" : "#3d5166",
          fontSize: 12, fontWeight: 600,
          cursor: "pointer", backdropFilter: "blur(12px)",
          boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.08)",
          transition: "all 0.2s",
        }}
      >
        {isDark ? <IconSun /> : <IconMoon />}
        {isDark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Layout */}
      <div style={{
        display:        "flex",
        width:          "100%",
        maxWidth:       1100,
        margin:         "auto",
        padding:        "24px",
        gap:            48,
        alignItems:     "center",
        justifyContent: "center",
        position:       "relative",
        zIndex:         1,
      }}>

        {/* ── Left Panel ──────────────────────────────── */}
        <div style={{
          flex:      1, maxWidth: 460,
          display:   "flex", flexDirection: "column",
          gap:       32,
          animation: "slideInUp 0.5s ease both",
        }} className="hide-mobile">

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(59,130,246,0.4)",
              }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "DM Mono, monospace" }}>C</span>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#e8f0f8" : "#0d1f2d", letterSpacing: "-0.03em" }}>
                  CMLabs CRM
                </div>
                <div style={{ fontSize: 11, color: isDark ? "#4d6680" : "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Sales Management System
                </div>
              </div>
            </div>

            <h1 style={{
              fontSize: 38, fontWeight: 800,
              color: isDark ? "#e8f0f8" : "#0d1f2d",
              lineHeight: 1.2, letterSpacing: "-0.03em",
              marginBottom: 16,
            }}>
              Kelola Pipeline
              <br />
              <span style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Sales Anda
              </span>
            </h1>

            <p style={{
              fontSize: 14, color: isDark ? "#4d6680" : "#64748b",
              lineHeight: 1.75, maxWidth: 400,
            }}>
              Platform CRM terpadu untuk monitoring leads, analisis performa tim,
              forecasting revenue, dan pengelolaan dokumen bisnis secara efisien.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Kanban Board dengan 6 tahap pipeline leads" },
              { label: "Dashboard analitik real-time dengan SSE" },
              { label: "Forecasting revenue dengan weighted probability" },
              { label: "Generate dokumen Invoice, SPK, dan MOU otomatis" },
              { label: "Manajemen tim dengan 4 level role akses" },
            ].map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(59,130,246,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#3b82f6",
                }}>
                  <IconCheck />
                </div>
                <span style={{ fontSize: 13, color: isDark ? "#8ba3bf" : "#3d5166" }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { v: "4 Role",  l: "Akses Terstruktur" },
              { v: "Live",    l: "Update Real-time"  },
              { v: ".docx",   l: "Export Dokumen"    },
            ].map((s) => (
              <div key={s.l} style={{
                padding: "12px 16px",
                background: isDark ? "rgba(14,23,36,0.6)" : "rgba(255,255,255,0.7)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                borderRadius: 10, backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>{s.v}</div>
                <div style={{ fontSize: 10, color: isDark ? "#4d6680" : "#64748b", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel — Form ───────────────────────── */}
        <div style={{ width: "100%", maxWidth: 420, flexShrink: 0, animation: "slideInUp 0.5s ease 0.1s both" }}>
          <div style={{
            background:     isDark ? "rgba(14,23,36,0.85)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            borderRadius:   20,
            padding:        "36px 32px",
            border:         `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
            boxShadow:      isDark
              ? "0 24px 64px rgba(0,0,0,0.6)"
              : "0 24px 64px rgba(13,31,45,0.1)",
          }}>

            {/* Form header */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: isDark ? "#e8f0f8" : "#0d1f2d", letterSpacing: "-0.02em" }}>
                Masuk ke Akun
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: isDark ? "#4d6680" : "#64748b" }}>
                Gunakan kredensial yang telah ditetapkan administrator
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="scale-in" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 14px", marginBottom: 20,
                background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
                border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "#fecaca"}`,
                borderRadius: 9, fontSize: 13,
                color: isDark ? "#f87171" : "#dc2626",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 700,
                  color: isDark ? "#4d6680" : "#64748b",
                  marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  Alamat Email
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 13, top: "50%",
                    transform: "translateY(-50%)",
                    color: isDark ? "#2e4560" : "#94a3b8",
                    pointerEvents: "none",
                    display: "flex", alignItems: "center",
                  }}>
                    <IconMail />
                  </div>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@cmlabs.co"
                    style={{
                      width: "100%", padding: "11px 12px 11px 40px",
                      background: isDark ? "rgba(19,31,48,0.8)" : "#f8fafc",
                      border: `1px solid ${isDark ? "#1a2d42" : "#dde3ec"}`,
                      borderRadius: 10, fontSize: 13,
                      color: isDark ? "#e8f0f8" : "#0d1f2d",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 700,
                  color: isDark ? "#4d6680" : "#64748b",
                  marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  Kata Sandi
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 13, top: "50%",
                    transform: "translateY(-50%)",
                    color: isDark ? "#2e4560" : "#94a3b8",
                    pointerEvents: "none",
                    display: "flex", alignItems: "center",
                  }}>
                    <IconLock />
                  </div>
                  <input
                    type={showPw ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    style={{
                      width: "100%", padding: "11px 42px 11px 40px",
                      background: isDark ? "rgba(19,31,48,0.8)" : "#f8fafc",
                      border: `1px solid ${isDark ? "#1a2d42" : "#dde3ec"}`,
                      borderRadius: 10, fontSize: 13,
                      color: isDark ? "#e8f0f8" : "#0d1f2d",
                      boxSizing: "border-box",
                      letterSpacing: showPw ? "normal" : "0.08em",
                    }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: isDark ? "#4d6680" : "#94a3b8",
                      display: "flex", alignItems: "center",
                      padding: 4, transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"}
                    onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#4d6680" : "#94a3b8"}
                  >
                    <IconEye off={showPw} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading || status === "success"}
                style={{
                  marginTop: 4, padding: "12px",
                  background: status === "success"
                    ? "linear-gradient(135deg, #059669, #047857)"
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#fff", border: "none", borderRadius: 11,
                  fontSize: 14, fontWeight: 700, letterSpacing: "0.01em",
                  cursor: loading || status === "success" ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: status === "success"
                    ? "0 4px 18px rgba(5,150,105,0.4)"
                    : "0 4px 18px rgba(59,130,246,0.4)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  if (!loading && status !== "success") {
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(59,130,246,0.5)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none"
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(59,130,246,0.4)"
                }}
              >
                {status === "loading" ? (
                  <>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    Memverifikasi...
                  </>
                ) : status === "success" ? (
                  <><IconCheck /> Loading... </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <IconChevron />
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{
              marginTop: 24, padding: "16px",
              background: isDark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.03)",
              border: `1px solid ${isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.1)"}`,
              borderRadius: 12,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Akun Demo — Password: Test1234!
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email} type="button"
                    onClick={() => { setEmail(a.email); setPassword("Test1234!") }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "7px 10px",
                      background: "transparent",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                      borderRadius: 7, cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background    = isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)"
                      e.currentTarget.style.borderColor   = "rgba(59,130,246,0.25)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background  = "transparent"
                      e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                    }}
                  >
                    <span style={{ fontSize: 11, color: isDark ? "#8ba3bf" : "#3d5166", fontFamily: "DM Mono, monospace" }}>{a.email}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: a.color + "18", color: a.color }}>
                      {a.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
        @keyframes slideInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes scaleIn { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  )
}