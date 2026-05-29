"use client"

import { signIn }              from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type DemoRole = "SUPER_ADMIN" | "SALES_MANAGER" | "ACCOUNT_EXEC" | "EXECUTIVE"
type LoginStatus = "idle" | "loading" | "success"

const DEMO_ACCOUNTS: {
  role:    DemoRole
  label:   string
  pos:     string
  email:   string
  color:   string
  bg:      string
}[] = [
  { role: "SUPER_ADMIN",    label: "Super Admin",   pos: "Developer Tim",  email: "super_admin@cmlabs.co", color: "#C0292B", bg: "rgba(192,41,43,0.07)"  },
  { role: "SALES_MANAGER",  label: "Sales Manager", pos: "Leader Divisi",  email: "sales_mgr@cmlabs.co",  color: "#0047B3", bg: "rgba(0,71,179,0.07)"   },
  { role: "ACCOUNT_EXEC",   label: "Account Exec",  pos: "Marketing Team", email: "ae@cmlabs.co",          color: "#0C7A4B", bg: "rgba(12,122,75,0.07)"  },
  { role: "EXECUTIVE",      label: "Executive",     pos: "Head / C-Level", email: "executive@cmlabs.co",  color: "#5E35B1", bg: "rgba(94,53,177,0.07)"   },
]
const DEMO_PASSWORD = "Demo123!"

// ─────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

// ─────────────────────────────────────────────
// CMLabs Logo
// ─────────────────────────────────────────────
function CMLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0047B3"/>
      <text
        x="20" y="27"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="17"
        fill="#ffffff"
        letterSpacing="-0.5"
      >
        CM
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Illustration (left panel)
// ─────────────────────────────────────────────
function Illustration() {
  return (
    <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="160" cy="245" rx="130" ry="10" fill="rgba(255,255,255,0.07)"/>
      {/* Decorative dashed circles */}
      <circle cx="48" cy="60" r="28" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="5 4"/>
      <circle cx="272" cy="50" r="20" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" strokeDasharray="4 4"/>
      {/* Monitor desk */}
      <rect x="78" y="160" width="164" height="8" rx="3" fill="rgba(255,255,255,0.18)"/>
      <rect x="148" y="168" width="24" height="16" rx="2" fill="rgba(255,255,255,0.15)"/>
      {/* Monitor screen */}
      <rect x="85" y="90" width="150" height="72" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5"/>
      <rect x="96" y="102" width="80" height="7" rx="3" fill="rgba(255,255,255,0.50)"/>
      <rect x="96" y="115" width="128" height="5" rx="2.5" fill="rgba(255,255,255,0.25)"/>
      <rect x="96" y="125" width="100" height="5" rx="2.5" fill="rgba(255,255,255,0.20)"/>
      <rect x="96" y="135" width="60" height="14" rx="4" fill="rgba(255,255,255,0.35)"/>
      {/* Lock icon on screen */}
      <circle cx="218" cy="126" r="14" fill="rgba(255,255,255,0.20)" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5"/>
      <rect x="213" y="124" width="10" height="8" rx="2" fill="rgba(255,255,255,0.70)"/>
      <path d="M214 124v-3a4 4 0 0 1 8 0v3" stroke="rgba(255,255,255,0.70)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Person legs */}
      <ellipse cx="56" cy="243" rx="22" ry="5" fill="rgba(0,0,0,0.15)"/>
      <rect x="44" y="200" width="10" height="42" rx="4" fill="#1A3F6F"/>
      <rect x="57" y="200" width="10" height="42" rx="4" fill="#1A3F6F"/>
      <rect x="40" y="236" width="16" height="8" rx="4" fill="#0D2548"/>
      <rect x="55" y="236" width="14" height="8" rx="4" fill="#0D2548"/>
      {/* Person body */}
      <rect x="36" y="158" width="42" height="48" rx="14" fill="#1A3F6F"/>
      <rect x="53" y="160" width="2" height="46" rx="1" fill="rgba(255,255,255,0.15)"/>
      {/* Arms */}
      <path d="M36 175 Q18 178 20 192" stroke="#1A3F6F" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <rect x="12" y="186" width="14" height="10" rx="5" fill="#F4C49E" transform="rotate(-20 12 186)"/>
      <path d="M78 175 Q88 185 85 200" stroke="#1A3F6F" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <circle cx="57" cy="148" r="18" fill="#F4C49E"/>
      <path d="M40 144 Q42 128 57 126 Q72 128 74 144" fill="#1A2E52"/>
      <circle cx="51" cy="148" r="2" fill="#8B6A50"/>
      <circle cx="63" cy="148" r="2" fill="#8B6A50"/>
      <path d="M52 155 Q57 159 62 155" stroke="#C0876A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M46 145 Q47 142 52 142 Q57 142 57 145 Q57 142 62 142 Q67 142 68 145" stroke="#2A1A0A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Floating form card */}
      <rect x="95" y="185" width="140" height="44" rx="8" fill="rgba(255,255,255,0.92)" stroke="rgba(0,71,179,0.15)" strokeWidth="1"/>
      <rect x="106" y="196" width="50" height="6" rx="3" fill="#C5D8F5"/>
      <rect x="106" y="208" width="118" height="10" rx="4" fill="#EDF3FC" stroke="#C5D8F5" strokeWidth="0.8"/>
      <rect x="108" y="211" width="60" height="4" rx="2" fill="#B0C8E8"/>
      {/* Blue login button */}
      <rect x="95" y="235" width="140" height="32" rx="8" fill="#0047B3"/>
      <text x="165" y="255" textAnchor="middle" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700" fontSize="11" fill="white">Masuk ke Sistem</text>
      {/* Gear icon */}
      <g transform="translate(268,44)">
        <circle cx="0" cy="0" r="12" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" fill="rgba(255,255,255,0.08)"/>
        <circle cx="0" cy="0" r="5" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" fill="none"/>
        <line x1="0" y1="-12" x2="0" y2="-8" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="0" y1="8"   x2="0" y2="12"  stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="-12" y1="0" x2="-8" y2="0"  stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8"   y1="0" x2="12" y2="0"  stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      {/* Key icon */}
      <g transform="translate(44,62)">
        <circle cx="0" cy="0" r="8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="rgba(255,255,255,0.10)"/>
        <line x1="6" y1="4" x2="14" y2="12" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="10" x2="10" y2="14" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      {/* Plant */}
      <g transform="translate(246,195)">
        <ellipse cx="0" cy="0" rx="14" ry="5" fill="rgba(255,255,255,0.15)"/>
        <path d="M-10 0 L-8 28 L8 28 L10 0 Z" fill="rgba(255,255,255,0.20)"/>
        <ellipse cx="0" cy="28" rx="8" ry="3" fill="rgba(255,255,255,0.10)"/>
        <line x1="0" y1="-2" x2="0" y2="-20" stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M0 -12 Q-12 -18 -8 -28 Q-2 -20 0 -12" fill="rgba(255,255,255,0.30)"/>
        <path d="M0 -16 Q12 -22 8 -32 Q2 -24 0 -16" fill="rgba(255,255,255,0.25)"/>
      </g>
      {/* Car */}
      <g transform="translate(88,224)">
        <rect x="-22" y="-8" width="44" height="14" rx="5" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <rect x="-14" y="-14" width="28" height="8" rx="4" fill="rgba(255,255,255,0.12)"/>
        <circle cx="-12" cy="6" r="5" fill="rgba(0,30,80,0.5)" stroke="rgba(255,255,255,0.30)" strokeWidth="1"/>
        <circle cx="12"  cy="6" r="5" fill="rgba(0,30,80,0.5)" stroke="rgba(255,255,255,0.30)" strokeWidth="1"/>
        <circle cx="-12" cy="6" r="2" fill="rgba(255,255,255,0.30)"/>
        <circle cx="12"  cy="6" r="2" fill="rgba(255,255,255,0.30)"/>
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()

  const [email,       setEmail]       = useState("")
  const [password,    setPassword]    = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [remembered,  setRemembered]  = useState(false)
  const [error,       setError]       = useState("")
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle")
  const [activeRole,  setActiveRole]  = useState<DemoRole | null>(null)

  // Auto-detect role from email
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError("Harap isi email dan kata sandi."); return }
    setError(""); setLoginStatus("loading")

    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      setLoginStatus("idle")
      setError("Email atau password tidak valid.")
    } else {
      setLoginStatus("success")
      setTimeout(() => router.push("/dashboard"), 1000)
    }
  }

  const detectedAcc = activeRole
    ? DEMO_ACCOUNTS.find((a) => a.role === activeRole) ?? null
    : null

  // ── Inline style helpers ──────────────────────────────────────
  const s = {
    // root
    root: {
      minHeight: "100vh",
      display: "flex",
      background: "#EDF3FC",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    } as React.CSSProperties,

    // LEFT PANEL
    left: {
      width: 420,
      flexShrink: 0,
      background: "#0047B3",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center" as const,
      justifyContent: "center",
      padding: "48px 36px 40px",
      position: "relative" as const,
      overflow: "hidden",
    },
    leftOrb1: {
      position: "absolute" as const,
      top: -80, right: -80,
      width: 300, height: 300, borderRadius: "50%",
      background: "rgba(255,255,255,0.05)",
      pointerEvents: "none" as const,
    },
    leftOrb2: {
      position: "absolute" as const,
      bottom: -60, left: -60,
      width: 240, height: 240, borderRadius: "50%",
      background: "rgba(255,255,255,0.04)",
      pointerEvents: "none" as const,
    },
    brandRow: {
      position: "absolute" as const,
      top: 28, left: 32,
      display: "flex", alignItems: "center", gap: 10,
      zIndex: 2,
    },
    brandWhiteBox: {
      width: 34, height: 34,
      background: "#fff",
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    brandName: {
      fontSize: 17, fontWeight: 800, color: "#fff",
      letterSpacing: "-0.02em", lineHeight: "1.1",
    },
    brandSub: {
      display: "block",
      fontSize: 9, fontWeight: 500,
      color: "rgba(255,255,255,0.50)",
      letterSpacing: "0.10em",
      textTransform: "uppercase" as const,
      marginTop: 1,
    },
    illustWrap: { position: "relative" as const, zIndex: 2, marginTop: 16 },
    tagline: {
      position: "relative" as const, zIndex: 2,
      textAlign: "center" as const, marginTop: 24,
    },
    taglineH: {
      fontSize: 22, fontWeight: 800, color: "#fff",
      letterSpacing: "-0.03em", lineHeight: 1.25,
      margin: "0 0 10px",
    },
    taglineP: {
      fontSize: 12.5, color: "rgba(200,220,255,0.70)",
      lineHeight: 1.75, margin: 0, maxWidth: 280,
    },
    badgeRow: {
      display: "flex", gap: 8,
      justifyContent: "center",
      marginTop: 20,
      flexWrap: "wrap" as const,
      position: "relative" as const, zIndex: 2,
    },
    badge: {
      padding: "5px 12px",
      background: "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      color: "rgba(255,255,255,0.85)",
      letterSpacing: "0.01em",
    },

    // RIGHT PANEL
    right: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      padding: "48px 52px",
      background: "#fff",
      position: "relative" as const,
      overflowY: "auto" as const,
    },
    accessBadge: {
      position: "absolute" as const,
      top: 24, right: 24,
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 12px",
      background: "#EDF3FC",
      border: "1px solid #C5D8F5",
      borderRadius: 20,
      fontSize: 10.5, fontWeight: 600,
      color: "#1565C0",
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
    },
    accessDot: {
      width: 6, height: 6,
      borderRadius: "50%",
      background: "#1565C0",
    },

    // Form header
    formHeader: { marginBottom: 28 },
    formH1: {
      fontSize: 26, fontWeight: 800, color: "#0A1628",
      letterSpacing: "-0.03em", lineHeight: 1.2,
      margin: "0 0 8px",
    },
    formSub: { fontSize: 13, color: "#6B87A8", lineHeight: 1.6, margin: 0 },
    formSubStrong: { color: "#1565C0", fontWeight: 600 },

    // Role chip
    roleChip: (color: string, bg: string): React.CSSProperties => ({
      display: "flex", alignItems: "center", gap: 8,
      padding: "7px 12px",
      borderRadius: "0 8px 8px 0",
      borderLeft: `3px solid ${color}`,
      background: bg,
      marginBottom: 16,
    }),
    roleDot: (color: string): React.CSSProperties => ({
      width: 7, height: 7, borderRadius: "50%",
      background: color, flexShrink: 0,
    }),
    roleName: (color: string): React.CSSProperties => ({
      fontSize: 12, fontWeight: 700, color,
    }),
    rolePos: {
      fontSize: 12, color: "#6B87A8",
    } as React.CSSProperties,

    // Error
    errorBox: {
      display: "flex", gap: 8, alignItems: "flex-start",
      padding: "10px 13px", marginBottom: 14,
      background: "#FFF0F0",
      border: "1px solid #FBC8C8",
      borderRadius: 8, fontSize: 12.5,
      color: "#C0292B",
    } as React.CSSProperties,

    // Field
    field: { marginBottom: 16 },
    label: {
      display: "block", fontSize: 11, fontWeight: 700,
      color: "#4A6580",
      textTransform: "uppercase" as const,
      letterSpacing: "0.08em",
      marginBottom: 7,
    },
    inputWrap: { position: "relative" as const },
    inputIcon: {
      position: "absolute" as const,
      left: 12, top: "50%",
      transform: "translateY(-50%)",
      color: "#8AAAD0",
      display: "flex", pointerEvents: "none" as const,
    },
    input: {
      width: "100%",
      padding: "11px 14px 11px 38px",
      background: "#F4F8FE",
      border: "1.5px solid #DDEAF8",
      borderRadius: 9,
      fontSize: 13.5, color: "#0A1628",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      outline: "none",
      boxSizing: "border-box" as const,
      transition: "border-color 0.15s, box-shadow 0.15s",
    },

    // Checkbox row
    rememberRow: {
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 20,
    },

    // Submit button
    btn: (status: LoginStatus): React.CSSProperties => ({
      width: "100%",
      padding: "12px 16px",
      background: status === "success" ? "#0B7B4A"
                : status === "loading"  ? "#2660C7"
                : "#0047B3",
      color: "#fff",
      border: "none", borderRadius: 9,
      fontSize: 14, fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      letterSpacing: "-0.01em",
      cursor: status !== "idle" ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center",
      justifyContent: "center", gap: 8,
      transition: "background 0.2s",
      marginBottom: 16,
    }),

    // Divider
    dividerWrap: {
      textAlign: "center" as const,
      position: "relative" as const,
      marginBottom: 14,
    },
    dividerLine: {
      position: "absolute" as const,
      left: 0, top: "50%",
      width: "100%", height: 1,
      background: "#E8F0FC",
    },
    dividerText: {
      position: "relative" as const,
      background: "#fff",
      padding: "0 10px",
      fontSize: 11, color: "#A8C0D8", fontWeight: 500,
    },

    // Demo grid
    demoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 7,
      marginBottom: 20,
    },

    // Footer
    footer: {
      textAlign: "center" as const,
      fontSize: 11, color: "#A8C0D8",
      letterSpacing: "0.01em",
    },
  }

  return (
    <>
      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .lp-input:focus {
          border-color: #0047B3 !important;
          box-shadow: 0 0 0 3px rgba(0,71,179,0.10) !important;
          background: #fff !important;
        }
        .lp-input::placeholder { color: #A8C0D8; }

        .lp-demo-btn {
          padding: 9px 11px;
          background: #F4F8FE;
          border: 1.5px solid #DDEAF8;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.12s;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .lp-demo-btn:hover {
          background: #EDF3FC;
          border-color: #B5D0F5;
        }
        .lp-demo-btn.active {
          border-color: var(--demo-c);
          background: var(--demo-bg);
        }

        .lp-check {
          width: 16px; height: 16px;
          border: 1.5px solid #DDEAF8;
          border-radius: 4px;
          background: #F4F8FE;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .lp-check.checked {
          background: #0047B3;
          border-color: #0047B3;
        }

        .lp-btn-primary:hover { background: #003A96 !important; }
        .lp-btn-primary:active { transform: scale(0.99); }

        .lp-pw-toggle {
          background: none; border: none; cursor: pointer;
          position: absolute; right: 11px; top: 50%;
          transform: translateY(-50%);
          color: #8AAAD0; display: flex; align-items: center;
          padding: 4px; transition: color 0.15s;
        }
        .lp-pw-toggle:hover { color: #0047B3; }

        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.30);
          border-top-color: #fff;
          animation: lp-spin 0.7s linear infinite;
        }

        @media (max-width: 860px) {
          .lp-left-panel { display: none !important; }
          .lp-right-panel { padding: 40px 28px !important; }
        }
        @media (max-width: 480px) {
          .lp-right-panel { padding: 28px 20px !important; }
          .lp-demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={s.root}>

        {/* ── LEFT PANEL ─────────────────────────────────── */}
        <div style={s.left} className="lp-left-panel">
          <div style={s.leftOrb1}/>
          <div style={s.leftOrb2}/>

          {/* Brand */}
          <div style={s.brandRow}>
            <div style={s.brandWhiteBox}>
              <CMLogo size={26}/>
            </div>
            <div>
              <div style={s.brandName}>CMLabs</div>
              <span style={s.brandSub}>Internal System</span>
            </div>
          </div>

          {/* Illustration */}
          <div style={s.illustWrap}>
            <Illustration/>
          </div>

          {/* Tagline */}
          <div style={s.tagline}>
            <h2 style={s.taglineH}>Sales CRM<br/>Management System</h2>
            <p style={s.taglineP}>
              Platform terpusat untuk pipeline, analitik, dan dokumen tim internal CMLabs.
            </p>
          </div>

          {/* Module badges */}
          <div style={s.badgeRow}>
            {["Lead Management","Analytics","Reporting","Document Generator"].map((m) => (
              <span key={m} style={s.badge}>{m}</span>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────── */}
        <div style={s.right} className="lp-right-panel">

          {/* Access badge */}
          <div style={s.accessBadge}>
            <div style={s.accessDot}/>
            Internal Access Only
          </div>

          <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>

            {/* Header */}
            <div style={s.formHeader}>
              <h1 style={s.formH1}>Selamat datang<br/>kembali</h1>
              <p style={s.formSub}>
                Masuk ke{" "}
                <strong style={s.formSubStrong}>CMLabs Internal System</strong>
                {" "}menggunakan akun yang telah diotorisasi.
              </p>
            </div>

            {/* Role chip */}
            {detectedAcc && (
              <div style={s.roleChip(detectedAcc.color, detectedAcc.bg)}>
                <div style={s.roleDot(detectedAcc.color)}/>
                <span style={s.roleName(detectedAcc.color)}>{detectedAcc.label}</span>
                <span style={s.rolePos}>— {detectedAcc.pos}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                <span style={{ flexShrink: 0, marginTop: 1 }}><AlertIcon/></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>

              {/* Email */}
              <div style={s.field}>
                <label style={s.label}>Alamat Email</label>
                <div style={s.inputWrap}>
                  <div style={s.inputIcon}><MailIcon/></div>
                  <input
                    className="lp-input"
                    type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@cmlabs.co"
                    style={s.input}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={s.field}>
                <label style={s.label}>Kata Sandi</label>
                <div style={s.inputWrap}>
                  <div style={s.inputIcon}><LockIcon/></div>
                  <input
                    className="lp-input"
                    type={showPw ? "text" : "password"} required
                    autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    style={{ ...s.input, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? <EyeOffIcon/> : <EyeIcon/>}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={s.rememberRow}>
                <div
                  className={`lp-check${remembered ? " checked" : ""}`}
                  onClick={() => setRemembered(!remembered)}
                  role="checkbox"
                  aria-checked={remembered}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && setRemembered(!remembered)}
                >
                  {remembered && <CheckIcon/>}
                </div>
                <label
                  onClick={() => setRemembered(!remembered)}
                  style={{ fontSize: 12.5, color: "#6B87A8", cursor: "pointer", userSelect: "none" }}
                >
                  Tetap masuk di perangkat ini
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="lp-btn-primary"
                disabled={loginStatus !== "idle"}
                style={s.btn(loginStatus)}
              >
                {loginStatus === "loading" ? (
                  <><div className="lp-spin"/> Memverifikasi...</>
                ) : loginStatus === "success" ? (
                  <><CheckIcon/> Berhasil — Mengalihkan...</>
                ) : (
                  <>Masuk ke Sistem <ArrowRightIcon/></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={s.dividerWrap}>
              <div style={s.dividerLine}/>
              <span style={s.dividerText}>atau gunakan akun demo</span>
            </div>

            {/* Demo accounts */}
            <div style={s.demoGrid} className="lp-demo-grid">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSel = activeRole === acc.role
                return (
                  <button
                    key={acc.role}
                    type="button"
                    className={`lp-demo-btn${isSel ? " active" : ""}`}
                    style={{
                      ["--demo-c" as string]: acc.color,
                      ["--demo-bg" as string]: acc.bg,
                    } as React.CSSProperties}
                    onClick={() => quickFill(acc)}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: 700,
                      color: acc.color,
                      letterSpacing: "0.01em",
                      marginBottom: 2,
                    }}>
                      {acc.label}
                    </div>
                    <div style={{
                      fontSize: 10, color: "#8AAAD0",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {acc.email}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <p style={s.footer}>
              &copy; {new Date().getFullYear()} CMLabs &mdash; Confidential Internal System
            </p>
          </div>
        </div>
      </div>
    </>
  )
}