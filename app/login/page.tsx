"use client"

import { signIn }          from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }       from "next/navigation"
import { useTheme }        from "@/hooks/useTheme"
import ThemeToggle         from "@/components/layout/ThemeToggle"

// ── Floating Particle ──────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute",
      borderRadius: "50%",
      background: "rgba(75,158,243,0.15)",
      animation: "float 4s ease-in-out infinite",
      ...style,
    }} />
  )
}

export default function LoginPage() {
  const router                    = useRouter()
  const { isDark, mounted }       = useTheme()
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [focusEmail, setFocusEmail] = useState(false)
  const [focusPw, setFocusPw]     = useState(false)
  const [step, setStep]           = useState<"idle" | "loading" | "success">("idle")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setStep("loading")

    const result = await signIn("credentials", {
      email, password, redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setStep("idle")
      setError("Email atau password salah. Silakan coba lagi.")
    } else {
      setStep("success")
      setTimeout(() => router.push("/dashboard"), 800)
    }
  }

  if (!mounted) return null

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      background:     isDark
        ? "linear-gradient(135deg, #070b14 0%, #0f172a 50%, #0c2136 100%)"
        : "linear-gradient(135deg, #e0f2fe 0%, #f0f4f8 50%, #ede9fe 100%)",
      position:       "relative",
      overflow:       "hidden",
    }}>
      {/* Background particles */}
      <Particle style={{ width: 300, height: 300, top: -80,  left: -80,  opacity: isDark ? 0.4 : 0.3 }} />
      <Particle style={{ width: 200, height: 200, top: "40%", right: -60, opacity: isDark ? 0.3 : 0.2, animationDelay: "1s" }} />
      <Particle style={{ width: 150, height: 150, bottom: -40, left: "30%", opacity: isDark ? 0.2 : 0.15, animationDelay: "2s" }} />
      <Particle style={{ width: 80,  height: 80,  top: "20%", left: "20%", opacity: isDark ? 0.3 : 0.2, animationDelay: "0.5s" }} />

      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: isDark ? 0.04 : 0.06,
        backgroundImage: `
          linear-gradient(rgba(75,158,243,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(75,158,243,0.5) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* Theme toggle */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Split layout */}
      <div style={{
        display:     "flex",
        width:       "100%",
        maxWidth:    1100,
        margin:      "auto",
        padding:     "24px",
        gap:         40,
        alignItems:  "center",
        justifyContent: "center",
        position:    "relative",
        zIndex:      1,
      }}>

        {/* ── Left: Branding ────────────────────────── */}
        <div style={{
          flex:    1,
          display: "flex",
          flexDirection: "column",
          gap:     32,
          maxWidth: 480,
          animation: "slideInUp 0.6s ease both",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width:        52, height: 52,
              borderRadius: 14,
              background:   "linear-gradient(135deg, #4B9EF3, #1a6fd4)",
              display:      "flex", alignItems: "center",
              justifyContent: "center",
              fontSize:     24, fontWeight: 900, color: "#fff",
              boxShadow:    "0 8px 24px rgba(75,158,243,0.45)",
              animation:    "glow 3s ease-in-out infinite",
            }}>
              C
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: isDark ? "#f1f5f9" : "#0f172a", letterSpacing: "-0.03em" }}>
                CMLabs
              </div>
              <div style={{ fontSize: 12, color: isDark ? "#4b5563" : "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                CRM System
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{
              fontSize:    40,
              fontWeight:  900,
              color:       isDark ? "#f1f5f9" : "#0f172a",
              lineHeight:  1.15,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}>
              Kelola Leads
              <br />
              <span style={{
                background:            "linear-gradient(135deg, #4B9EF3, #8b5cf6)",
                WebkitBackgroundClip:  "text",
                WebkitTextFillColor:   "transparent",
                backgroundClip:        "text",
              }}>
                Lebih Cerdas
              </span>
            </h1>
            <p style={{ fontSize: 15, color: isDark ? "#4b5563" : "#64748b", lineHeight: 1.7 }}>
              Platform CRM terpadu untuk memantau leads, menganalisis performa tim, dan mengakselerasi pertumbuhan bisnis Anda.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { icon: "📊", text: "Dashboard Real-time" },
              { icon: "🎯", text: "Kanban Board"        },
              { icon: "📈", text: "Forecasting AI"      },
              { icon: "📄", text: "Auto-generate Dokumen" },
            ].map((f) => (
              <div key={f.text} style={{
                display:      "flex", alignItems: "center", gap: 6,
                padding:      "7px 13px",
                background:   isDark ? "rgba(75,158,243,0.1)" : "rgba(75,158,243,0.08)",
                border:       `1px solid ${isDark ? "rgba(75,158,243,0.2)" : "rgba(75,158,243,0.15)"}`,
                borderRadius: 999,
                fontSize:     12, color: "#4B9EF3", fontWeight: 600,
              }}>
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { v: "5 Role",    l: "RBAC System"     },
              { v: "Real-time", l: "Live Dashboard"  },
              { v: "Auto PDF",  l: "Dokumen Digital" },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#4B9EF3" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: isDark ? "#4b5563" : "#94a3b8" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form ───────────────────────────── */}
        <div style={{
          width:        420,
          flexShrink:   0,
          animation:    "slideInRight 0.6s ease 0.1s both",
        }}>
          <div style={{
            background:   isDark ? "rgba(17,24,39,0.85)" : "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            padding:      36,
            border:       `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)"}`,
            boxShadow:    isDark
              ? "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 24px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)",
          }}>

            {/* Form header */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: isDark ? "#f1f5f9" : "#0f172a", letterSpacing: "-0.02em" }}>
                Selamat datang 👋
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: isDark ? "#4b5563" : "#94a3b8" }}>
                Masuk ke akun CMLabs CRM Anda
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="animate-scaleIn" style={{
                display:      "flex", alignItems: "center", gap: 10,
                marginBottom: 20,
                padding:      "12px 14px",
                background:   isDark ? "rgba(248,113,113,0.1)" : "#fef2f2",
                border:       `1px solid ${isDark ? "rgba(248,113,113,0.2)" : "#fecaca"}`,
                borderRadius: 10,
                fontSize:     13, color: isDark ? "#f87171" : "#dc2626",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#94a3b8" : "#374151", display: "block", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 14, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16, opacity: focusEmail ? 1 : 0.4,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                  }}>
                    ✉️
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusEmail(true)}
                    onBlur={() => setFocusEmail(false)}
                    placeholder="email@cmlabs.co"
                    required
                    style={{
                      width:        "100%",
                      padding:      "13px 14px 13px 42px",
                      background:   isDark ? "rgba(22,29,46,0.8)" : "#f8fafc",
                      border:       `1px solid ${focusEmail ? "#4B9EF3" : isDark ? "#1f2937" : "#e2e8f0"}`,
                      borderRadius: 12,
                      fontSize:     14,
                      color:        isDark ? "#f1f5f9" : "#0f172a",
                      boxSizing:    "border-box",
                      transition:   "all 0.2s",
                      boxShadow:    focusEmail ? "0 0 0 3px rgba(75,158,243,0.15)" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#94a3b8" : "#374151", display: "block", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 14, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16, opacity: focusPw ? 1 : 0.4,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                  }}>
                    🔒
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusPw(true)}
                    onBlur={() => setFocusPw(false)}
                    placeholder="Masukkan password"
                    required
                    style={{
                      width:        "100%",
                      padding:      "13px 44px 13px 42px",
                      background:   isDark ? "rgba(22,29,46,0.8)" : "#f8fafc",
                      border:       `1px solid ${focusPw ? "#4B9EF3" : isDark ? "#1f2937" : "#e2e8f0"}`,
                      borderRadius: 12,
                      fontSize:     14,
                      color:        isDark ? "#f1f5f9" : "#0f172a",
                      boxSizing:    "border-box",
                      transition:   "all 0.2s",
                      boxShadow:    focusPw ? "0 0 0 3px rgba(75,158,243,0.15)" : "none",
                      letterSpacing: showPw ? "normal" : "0.1em",
                    }}
                  />
                  {/* Show/Hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position:   "absolute", right: 12, top: "50%",
                      transform:  "translateY(-50%)",
                      background: "none", border: "none",
                      cursor:     "pointer", fontSize: 16,
                      opacity:    0.5, transition: "opacity 0.2s",
                      padding:    "4px",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0.5"}
                    title={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || step === "success"}
                style={{
                  marginTop:    4,
                  padding:      "14px",
                  background:   step === "success"
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #4B9EF3, #1a6fd4)",
                  color:        "#fff",
                  border:       "none",
                  borderRadius: 12,
                  fontSize:     14, fontWeight: 700,
                  cursor:       loading || step === "success" ? "not-allowed" : "pointer",
                  display:      "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                  transition:   "all 0.3s",
                  boxShadow:    step === "success"
                    ? "0 4px 20px rgba(16,185,129,0.4)"
                    : "0 4px 20px rgba(75,158,243,0.4)",
                  transform:    "scale(1)",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  if (!loading && step !== "success") {
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(75,158,243,0.5)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)"
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(75,158,243,0.4)"
                }}
              >
                {step === "loading" ? (
                  <>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    Memverifikasi...
                  </>
                ) : step === "success" ? (
                  <>✅ Berhasil! Mengalihkan...</>
                ) : (
                  <>🚀 Masuk ke Dashboard</>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{
              marginTop:    24,
              padding:      "16px",
              background:   isDark ? "rgba(75,158,243,0.06)" : "rgba(75,158,243,0.04)",
              border:       `1px solid ${isDark ? "rgba(75,158,243,0.15)" : "rgba(75,158,243,0.1)"}`,
              borderRadius: 12,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#4B9EF3", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🔑 Demo Accounts
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { email: "super_admin@cmlabs.co",  role: "Super Admin",       badge: "#ef4444" },
                  { email: "executive@cmlabs.co",     role: "Executive",         badge: "#8b5cf6" },
                  { email: "sales_mgr@cmlabs.co",    role: "Sales Manager",     badge: "#4B9EF3" },
                  { email: "ae@cmlabs.co",            role: "Account Executive", badge: "#10b981" },
                  { email: "viewer@cmlabs.co",        role: "Viewer",            badge: "#64748b" },
                ].map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => { setEmail(a.email); setPassword("Test1234!") }}
                    style={{
                      display:      "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding:      "7px 10px",
                      background:   "transparent",
                      border:       `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                      borderRadius: 8,
                      cursor:       "pointer",
                      transition:   "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background    = isDark ? "rgba(75,158,243,0.1)" : "rgba(75,158,243,0.06)"
                      e.currentTarget.style.borderColor   = "rgba(75,158,243,0.3)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background  = "transparent"
                      e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
                    }}
                  >
                    <span style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#64748b" }}>{a.email}</span>
                    <span style={{
                      fontSize:     9, fontWeight: 700,
                      padding:      "2px 7px", borderRadius: 999,
                      background:   a.badge + "20", color: a.badge,
                    }}>
                      {a.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}