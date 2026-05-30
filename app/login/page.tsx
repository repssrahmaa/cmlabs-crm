"use client"

import { signIn }              from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"
import Image                   from "next/image"

// ── Types ──────────────────────────────────────────────────────
type DemoRole    = "SUPER_ADMIN" | "SALES_MANAGER" | "ACCOUNT_EXEC" | "EXECUTIVE"
type LoginStatus = "idle" | "loading" | "success"

const DEMO_ACCOUNTS: {
  role: DemoRole; label: string; pos: string
  email: string; color: string; bg: string; bgDark: string
}[] = [
  { role:"SUPER_ADMIN",   label:"Super Admin",        pos:"Developer Tim",  email:"super_admin@cmlabs.co", color:"#C0292B", bg:"rgba(192,41,43,0.07)",  bgDark:"rgba(192,41,43,0.14)"  },
  { role:"SALES_MANAGER", label:"Sales Manager",      pos:"Leader Divisi",  email:"sales_mgr@cmlabs.co",  color:"#0047B3", bg:"rgba(0,71,179,0.07)",   bgDark:"rgba(0,71,179,0.14)"   },
  { role:"ACCOUNT_EXEC",  label:"Account Executive",  pos:"Marketing Team", email:"ae@cmlabs.co",          color:"#0C7A4B", bg:"rgba(12,122,75,0.07)",  bgDark:"rgba(12,122,75,0.14)"  },
  { role:"EXECUTIVE",     label:"Executive",          pos:"Head / C-Level", email:"executive@cmlabs.co",  color:"#5E35B1", bg:"rgba(94,53,177,0.07)",   bgDark:"rgba(94,53,177,0.14)"  },
]
const DEMO_PASSWORD = "Demo123!"

// ── CMLabs Dashboard Illustration ─────────────────────────────
// Bersih, tidak ada titik dekoratif — hanya illustration card
function DashboardIllustration({ isDark }: { isDark: boolean }) {
  const cardBg    = isDark ? "#ffffff14" : "#ffffff"
  const cardBd    = isDark ? "rgba(255,255,255,0.15)" : "rgba(200,220,255,0.8)"
  const textLight = isDark ? "rgba(255,255,255,0.18)" : "#CBD5E1"
  const textMed   = isDark ? "rgba(255,255,255,0.55)" : "#475569"

  return (
    <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ilCard" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,40,140,0.18)" floodOpacity="1"/>
        </filter>
        <filter id="ilChip" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="rgba(0,40,140,0.14)" floodOpacity="1"/>
        </filter>
        <linearGradient id="bannerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
        <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#10B981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
      </defs>

      {/* ── Left card: Profile/Lead card ── */}
      <rect x="6" y="18" width="154" height="116" rx="12" fill={cardBg} stroke={cardBd} strokeWidth="1" filter="url(#ilCard)"/>
      {/* Blue banner header */}
      <rect x="6" y="18" width="154" height="52" rx="12" fill="url(#bannerGrad)"/>
      <rect x="6" y="58" width="154" height="12" fill="url(#bannerGrad)"/>
      {/* Avatar */}
      <circle cx="83" cy="40" r="14" fill="rgba(255,255,255,0.25)"/>
      <circle cx="83" cy="38" r="6" fill="rgba(255,255,255,0.7)"/>
      <ellipse cx="83" cy="52" rx="9" ry="5" fill="rgba(255,255,255,0.45)"/>
      {/* Content rows */}
      <rect x="18" y="78" width="80" height="6" rx="3" fill={textMed}/>
      <rect x="18" y="91" width="5" height="5" rx="1.5" fill="#3B82F6"/>
      <rect x="27" y="92" width="50" height="3.5" rx="1.5" fill={textLight}/>
      <rect x="18" y="102" width="5" height="5" rx="1.5" fill="#10B981"/>
      <rect x="27" y="103" width="64" height="3.5" rx="1.5" fill={textLight}/>
      <rect x="18" y="113" width="5" height="5" rx="1.5" fill="#F59E0B"/>
      <rect x="27" y="114" width="40" height="3.5" rx="1.5" fill={textLight}/>
      {/* Status pill */}
      <rect x="128" y="90" width="26" height="12" rx="6" fill="rgba(16,185,129,0.18)"/>
      <rect x="131" y="93" width="20" height="6" rx="3" fill="#10B981"/>

      {/* ── Right card: Team/Leads list ── */}
      <rect x="106" y="90" width="164" height="140" rx="12" fill={cardBg} stroke={cardBd} strokeWidth="1" filter="url(#ilCard)"/>
      {/* Card header */}
      <rect x="118" y="102" width="64" height="6" rx="3" fill={textMed}/>
      <rect x="118" y="112" width="44" height="3.5" rx="1.5" fill={textLight}/>
      {/* Divider */}
      <line x1="118" y1="122" x2="258" y2="122" stroke={cardBd} strokeWidth="1"/>

      {/* Row 1 */}
      <circle cx="127" cy="138" r="10" fill="#FDB47F"/>
      <rect x="141" y="132" width="58" height="5" rx="2.5" fill={textMed}/>
      <rect x="141" y="141" width="36" height="3.5" rx="1.5" fill={textLight}/>
      <rect x="222" y="131" width="38" height="16" rx="5" fill="rgba(245,158,11,0.14)"/>
      <rect x="226" y="135" width="30" height="8" rx="3" fill="url(#amberGrad)"/>

      {/* Row 2 */}
      <circle cx="127" cy="170" r="10" fill="#74C0FC"/>
      <rect x="141" y="164" width="58" height="5" rx="2.5" fill={textMed}/>
      <rect x="141" y="173" width="36" height="3.5" rx="1.5" fill={textLight}/>
      <rect x="222" y="163" width="38" height="16" rx="5" fill="rgba(59,130,246,0.12)"/>
      <rect x="226" y="167" width="30" height="8" rx="3" fill="url(#bannerGrad)"/>

      {/* Row 3 */}
      <circle cx="127" cy="202" r="10" fill="#86EFAC"/>
      <rect x="141" y="196" width="58" height="5" rx="2.5" fill={textMed}/>
      <rect x="141" y="205" width="36" height="3.5" rx="1.5" fill={textLight}/>
      <rect x="222" y="195" width="38" height="16" rx="5" fill="rgba(16,185,129,0.12)"/>
      <rect x="226" y="199" width="30" height="8" rx="3" fill="url(#greenGrad)"/>

      {/* ── Floating mini chart chip ── */}
      <rect x="124" y="52" width="46" height="42" rx="9" fill={isDark?"#1a2e4a":"#ffffff"} stroke={cardBd} strokeWidth="1" filter="url(#ilChip)"/>
      {/* Mini bar chart */}
      <rect x="132" y="72" width="6" height="14" rx="2" fill="rgba(59,130,246,0.3)"/>
      <rect x="141" y="66" width="6" height="20" rx="2" fill="#3B82F6"/>
      <rect x="150" y="69" width="6" height="17" rx="2" fill="rgba(59,130,246,0.5)"/>
      <rect x="159" y="63" width="6" height="23" rx="2" fill="#6366F1"/>

      {/* ── Floating revenue chip ── */}
      <rect x="6" y="148" width="86" height="34" rx="9" fill={isDark?"#1a2e4a":"#ffffff"} stroke={cardBd} strokeWidth="1" filter="url(#ilChip)"/>
      <rect x="16" y="156" width="28" height="4" rx="2" fill={textLight}/>
      <rect x="16" y="163" width="50" height="7" rx="3" fill="url(#greenGrad)"/>

      {/* Trend arrow on revenue chip */}
      <polyline points="72,157 78,153 84,155" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

// ── Google icon ────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()

  const [email,      setEmail]      = useState("")
  const [password,   setPassword]   = useState("")
  const [showPw,     setShowPw]     = useState(false)
  const [remembered, setRemembered] = useState(false)
  const [error,      setError]      = useState("")
  const [status,     setStatus]     = useState<LoginStatus>("idle")
  const [activeRole, setActiveRole] = useState<DemoRole | null>(null)
  const [showDemo,   setShowDemo]   = useState(false)
  const [focus,      setFocus]      = useState<"email"|"password"|null>(null)
  const [isDark,     setIsDark]     = useState(false)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem("theme") === "dark") setIsDark(true)
  }, [])

  function toggleTheme() {
    setIsDark(p => {
      localStorage.setItem("theme", !p ? "dark" : "light")
      return !p
    })
  }

  useEffect(() => {
    const found = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.trim().toLowerCase()
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
    setError(""); setStatus("loading")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) { setStatus("idle"); setError("Email atau password tidak valid.") }
    else { setStatus("success"); setTimeout(() => router.push("/dashboard"), 900) }
  }

  if (!mounted) return <div style={{ minHeight:"100vh", background:"#060c18" }}/>

  const D = isDark
  const detected = activeRole ? DEMO_ACCOUNTS.find(a => a.role === activeRole) ?? null : null

  // ── Design tokens ──────────────────────────────────────────────
  const T = {
    page:      D ? "#07101e"                : "#EBF0FA",
    card:      D ? "#0d1928"                : "#ffffff",
    leftBg:    D ? "linear-gradient(150deg,#002a7a 0%,#001c55 100%)"
                 : "linear-gradient(150deg,#0052CC 0%,#003A96 100%)",
    border:    D ? "#172640"                : "#dde7f5",
    inputBg:   D ? "#0f1f33"               : "#F8FAFE",
    inputBd:   D ? "#1c3254"               : "#d0daf0",
    inputTx:   D ? "#ddeaf8"               : "#1E293B",
    heading:   D ? "#e4effc"               : "#0A1628",
    body:      D ? "#5a7fa0"               : "#6B87A8",
    muted:     D ? "#2e4f6e"               : "#A0B5CC",
    divider:   D ? "#131f32"               : "#eaf0fa",
    badgeBg:   D ? "rgba(0,82,204,0.16)"   : "#EEF4FF",
    badgeBd:   D ? "rgba(0,82,204,0.32)"   : "#C2D7F5",
    badgeTx:   D ? "#6ea8f7"               : "#1a56c4",
    codeBg:    D ? "rgba(0,71,179,0.16)"   : "#EDF3FF",
    codeBd:    D ? "rgba(0,71,179,0.30)"   : "#BFCFEE",
    codeTx:    D ? "#6ea8f7"               : "#0047B3",
    googleBg:  D ? "#0f1f33"               : "#ffffff",
    googleBd:  D ? "#1c3254"               : "#d0daf0",
    googleTx:  D ? "#b8d4f0"               : "#374151",
    demoBg:    D ? "#0f1f33"               : "#f4f7fd",
    demoBd:    D ? "#172640"               : "#dde7f5",
    footerTx:  D ? "rgba(80,130,180,0.35)" : "rgba(0,50,120,0.28)",
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width:        "100%",
    padding:      "11px 40px 11px 14px",
    border:       `1.5px solid ${focused ? "#0052CC" : T.inputBd}`,
    borderRadius: 9,
    fontSize:     13.5,
    color:        T.inputTx,
    background:   focused ? (D ? "#112034" : "#fff") : T.inputBg,
    outline:      "none",
    boxSizing:    "border-box",
    boxShadow:    focused ? "0 0 0 3px rgba(0,82,204,0.11)" : "none",
    transition:   "all 0.15s",
    fontFamily:   "inherit",
  })

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        input { font-family: inherit; }
        input::placeholder { color: ${T.muted}; font-size: 13.5px; }

        .lp-btn-primary {
          width: 100%; padding: 12px;
          background: #0052CC; color: #fff;
          border: none; border-radius: 9px;
          font-size: 14px; font-weight: 700;
          font-family: inherit; letter-spacing: -0.01em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }
        .lp-btn-primary:hover:not(:disabled) { background: #0041A8; }
        .lp-btn-primary:active { transform: scale(0.99); }
        .lp-btn-primary.loading { background: ${D?"#1a3a6a":"#2F6FD4"}; cursor: not-allowed; }
        .lp-btn-primary.success { background: #0B7B4A; cursor: not-allowed; }

        .lp-btn-google {
          width: 100%; padding: 10px;
          background: ${T.googleBg}; color: ${T.googleTx};
          border: 1.5px solid ${T.googleBd};
          border-radius: 9px; font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: border-color 0.15s, background 0.15s;
        }
        .lp-btn-google:hover { border-color: #4B8FF5; }

        .lp-check {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 1.5px solid ${D?"#1c3254":"#c0cfec"};
          border-radius: 4px;
          background: ${D?"#0f1f33":"#fff"};
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .lp-check.on { background: #0052CC; border-color: #0052CC; }

        .lp-demo-row {
          display: flex; align-items: center; gap: 10;
          padding: 9px 12px; border-radius: 8px;
          border: 1.5px solid ${T.demoBd};
          background: transparent;
          cursor: pointer; text-align: left; width: 100%;
          font-family: inherit;
          transition: all 0.12s;
        }
        .lp-demo-row:hover {
          background: ${D?"rgba(0,82,204,0.08)":"rgba(0,82,204,0.04)"};
          border-color: ${D?"rgba(0,82,204,0.35)":"rgba(0,82,204,0.25)"};
        }
        .lp-demo-row.sel {
          border-color: var(--rc);
          background: var(--rb);
        }

        .lp-pw-btn {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          display: flex; padding: 4px;
          color: ${T.muted};
          transition: color 0.15s;
        }
        .lp-pw-btn:hover { color: #0052CC; }

        .lp-theme-btn {
          position: fixed; top: 16px; right: 16px; z-index: 200;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px;
          background: ${D?"rgba(13,25,40,0.9)":"rgba(255,255,255,0.92)"};
          border: 1px solid ${D?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.10)"};
          border-radius: 999px; font-size: 12px; font-weight: 600;
          color: ${D?"#5a7fa0":"#56708a"};
          cursor: pointer; backdrop-filter: blur(10px);
          font-family: inherit;
          transition: all 0.15s;
        }
        .lp-theme-btn:hover { border-color: #0052CC; color: #0052CC; }

        @keyframes lp-spin {
          to { transform: rotate(360deg); }
        }
        .lp-spin {
          width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: lp-spin 0.7s linear infinite;
        }

        @media (max-width: 820px) {
          .lp-left { display: none !important; }
        }
        @media (max-width: 520px) {
          .lp-right-inner { padding: 32px 20px !important; }
        }
      `}</style>

      <div style={{
        minHeight:    "100vh",
        background:   T.page,
        display:      "flex",
        alignItems:   "center",
        justifyContent:"center",
        padding:      "28px 16px",
        position:     "relative",
        fontFamily:   "'DM Sans', system-ui, sans-serif",
      }}>

        {/* Theme toggle */}
        <button className="lp-theme-btn" onClick={toggleTheme}>
          {D
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
          {D ? "Light Mode" : "Dark Mode"}
        </button>

        {/* ── Main card ──────────────────────────────────────── */}
        <div style={{
          display:      "flex",
          width:        "100%",
          maxWidth:     860,
          minHeight:    560,
          borderRadius: 18,
          overflow:     "hidden",
          boxShadow:    D
            ? "0 24px 64px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.05)"
            : "0 20px 56px rgba(0,50,140,0.12), 0 0 0 1px rgba(0,50,140,0.06)",
          position:     "relative",
          zIndex:       2,
        }}>

          {/* ══ LEFT PANEL ════════════════════════════════════ */}
          <div className="lp-left" style={{
            width:         376,
            flexShrink:    0,
            background:    T.leftBg,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            justifyContent:"center",
            padding:       "48px 36px 40px",
            position:      "relative",
            overflow:      "hidden",
          }}>
            {/* Subtle orb decorations inside panel only */}
            <div style={{ position:"absolute", top:-100, right:-100, width:320, height:320, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-80, left:-80, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.035)", pointerEvents:"none" }}/>

            {/* Brand — top left */}
            <div style={{ position:"absolute", top:24, left:24, display:"flex", alignItems:"center", gap:9, zIndex:2 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                <Image src="/logo-cmlabs.png" alt="CMLabs" width={28} height={28} style={{ objectFit:"cover" }} priority/>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>CMLabs</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.42)", letterSpacing:"0.10em", textTransform:"uppercase" }}>Internal System</div>
              </div>
            </div>

            {/* Internal Only badge */}
            <div style={{
              position:   "absolute", top:26, right:20,
              padding:    "3px 10px",
              background: "rgba(255,255,255,0.10)",
              border:     "1px solid rgba(255,255,255,0.18)",
              borderRadius:20, fontSize:9.5, fontWeight:700,
              color:      "rgba(255,255,255,0.65)",
              letterSpacing:"0.06em", textTransform:"uppercase",
              display:    "flex", alignItems:"center", gap:5,
            }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.65)" }}/>
              Internal Only
            </div>

            {/* Illustration */}
            <div style={{ position:"relative", zIndex:2, marginTop:12 }}>
              <DashboardIllustration isDark={isDark} />
            </div>

            {/* Caption — NO dots decoration */}
            <div style={{ position:"relative", zIndex:2, textAlign:"center", marginTop:20, maxWidth:280 }}>
              <h2 style={{
                fontSize:    20,
                fontWeight:  800,
                color:       "#ffffff",
                letterSpacing:"-0.03em",
                lineHeight:  1.35,
                margin:      "0 0 10px",
              }}>
                Sales CRM &amp;<br/>Management System
              </h2>
              <p style={{
                fontSize:   12.5,
                color:      "rgba(186,212,245,0.70)",
                lineHeight: 1.7,
                margin:     0,
              }}>
                Platform terpusat untuk pipeline, analitik,<br/>
                dan dokumen tim internal CMLabs.
              </p>
            </div>
            {/* Removed the three dots (.../pill indicators) that were here */}
          </div>

          {/* ══ RIGHT PANEL ═══════════════════════════════════ */}
          <div style={{
            flex:           1,
            background:     T.card,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            overflowY:      "auto",
          }}>
            <div className="lp-right-inner" style={{ width:"100%", maxWidth:360, padding:"48px 44px" }}>

              {/* Heading */}
              <div style={{ marginBottom:24 }}>
                <div style={{
                  width:38, height:38, borderRadius:9,
                  background: D?"#0f1f33":"#EEF4FF",
                  border:`1.5px solid ${D?"#1c3254":"#C5D8F5"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:16, overflow:"hidden",
                }}>
                  <Image src="/logo-cmlabs.png" alt="CMLabs" width={30} height={30} style={{ objectFit:"cover" }}/>
                </div>
                <h1 style={{ fontSize:23, fontWeight:800, color:T.heading, letterSpacing:"-0.025em", margin:"0 0 7px", lineHeight:1.25 }}>
                  Selamat Datang
                </h1>
                <p style={{ fontSize:13, color:T.body, lineHeight:1.65, margin:0 }}>
                  Masuk ke sistem internal CMLabs.<br/>
                  Akses khusus personel yang diotorisasi.
                </p>
              </div>

              {/* Detected role badge */}
              {detected && (
                <div style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        8,
                  padding:    "8px 12px",
                  marginBottom:14,
                  borderRadius:"0 8px 8px 0",
                  borderLeft: `3px solid ${detected.color}`,
                  background: D ? detected.bgDark : detected.bg,
                }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:detected.color, flexShrink:0 }}/>
                  <span style={{ fontSize:12.5, fontWeight:700, color:detected.color }}>{detected.label}</span>
                  <span style={{ fontSize:12.5, color:T.body }}>— {detected.pos}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  display:    "flex", gap:8, alignItems:"flex-start",
                  padding:    "9px 12px", marginBottom:14,
                  background: D ? "rgba(192,41,43,0.10)" : "#FFF0F0",
                  border:     `1px solid ${D?"rgba(192,41,43,0.28)":"#FBC8C8"}`,
                  borderRadius:8, fontSize:12.5,
                  color:      D?"#f87171":"#C0292B",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>

                {/* Email */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.body, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                    Email
                  </label>
                  <div style={{ position:"relative" }}>
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="nama@cmlabs.co"
                      style={inputStyle(focus === "email")}
                      onFocus={() => setFocus("email")}
                      onBlur={() => setFocus(null)}
                    />
                    <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:T.muted, display:"flex", pointerEvents:"none" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.body, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                    Kata Sandi
                  </label>
                  <div style={{ position:"relative" }}>
                    <input
                      type={showPw?"text":"password"} required autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      style={{ ...inputStyle(focus === "password"), letterSpacing:showPw?"normal":"0.06em" }}
                      onFocus={() => setFocus("password")}
                      onBlur={() => setFocus(null)}
                    />
                    <button type="button" className="lp-pw-btn" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                      {showPw
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Remember + note */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", userSelect:"none" }}>
                    <div
                      className={`lp-check${remembered?" on":""}`}
                      onClick={() => setRemembered(!remembered)}
                      role="checkbox" aria-checked={remembered} tabIndex={0}
                      onKeyDown={e => e.key === " " && setRemembered(!remembered)}
                    >
                      {remembered && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize:12, color:T.body }}>Tetap masuk</span>
                  </label>
                  <span style={{ fontSize:11, color:T.muted, fontStyle:"italic", textAlign:"right" }}>
                    Lupa password? Hubungi Super Admin
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`lp-btn-primary${status==="loading"?" loading":status==="success"?" success":""}`}
                  disabled={status !== "idle"}
                  style={{ marginTop:4 }}
                >
                  {status === "loading" ? (
                    <><div className="lp-spin"/> Memverifikasi...</>
                  ) : status === "success" ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Berhasil — Mengalihkan...
                    </>
                  ) : (
                    <>
                      Masuk ke Sistem
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ position:"relative", textAlign:"center", margin:"16px 0 14px" }}>
                <div style={{ position:"absolute", left:0, top:"50%", width:"100%", height:1, background:T.divider }}/>
                <span style={{ position:"relative", background:T.card, padding:"0 10px", fontSize:11, color:T.muted, fontWeight:500 }}>atau</span>
              </div>

              {/* Google SSO */}
              <button type="button" className="lp-btn-google">
                <GoogleIcon/> Masuk dengan Google Workspace
              </button>

              {/* Demo accounts */}
              <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${T.divider}` }}>
                <button
                  type="button"
                  onClick={() => setShowDemo(!showDemo)}
                  style={{
                    width:"100%", background:"none", border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"0 2px", fontFamily:"inherit",
                  }}
                >
                  <span style={{ fontSize:12, fontWeight:600, color:T.body }}>Akun Demo</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <code style={{
                      fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4,
                      background:T.codeBg, border:`1px solid ${T.codeBd}`,
                      color:T.codeTx, fontFamily:"'DM Mono', monospace",
                    }}>
                      {DEMO_PASSWORD}
                    </code>
                    <svg
                      width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={T.muted} strokeWidth="2.5" strokeLinecap="round"
                      style={{ transform:showDemo?"rotate(180deg)":"none", transition:"transform 0.15s", flexShrink:0 }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {showDemo && (
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:10 }}>
                    {DEMO_ACCOUNTS.map(acc => {
                      const isSel = activeRole === acc.role
                      return (
                        <button
                          key={acc.role}
                          type="button"
                          onClick={() => quickFill(acc)}
                          className={`lp-demo-row${isSel?" sel":""}`}
                          style={{ ["--rc" as string]:acc.color, ["--rb" as string]: D ? acc.bgDark : acc.bg } as React.CSSProperties}
                        >
                          {/* Color strip */}
                          <div style={{ width:3, height:28, borderRadius:2, background:acc.color, flexShrink:0 }}/>

                          {/* Text */}
                          <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                              <span style={{ fontSize:12, fontWeight:700, color:isSel ? acc.color : T.heading }}>
                                {acc.label}
                              </span>
                              <span style={{
                                fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3,
                                background: isSel ? acc.color+"18" : D?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
                                color: isSel ? acc.color : T.muted,
                                textTransform:"uppercase", letterSpacing:"0.04em",
                              }}>
                                {acc.pos}
                              </span>
                            </div>
                            <div style={{ fontSize:11, color:T.muted, fontFamily:"'DM Mono', monospace" }}>
                              {acc.email}
                            </div>
                          </div>

                          {/* Check */}
                          {isSel && (
                            <div style={{
                              width:18, height:18, borderRadius:"50%",
                              background:acc.color, flexShrink:0,
                              display:"flex", alignItems:"center", justifyContent:"center",
                            }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer note */}
              <p style={{
                textAlign:  "center",
                fontSize:   11,
                color:      T.muted,
                marginTop:  18,
                lineHeight: 1.65,
              }}>
                Sistem ini hanya untuk personel CMLabs<br/>
                yang telah mendapat otorisasi administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p style={{
          position:  "absolute",
          bottom:    12,
          left:      "50%",
          transform: "translateX(-50%)",
          fontSize:  11,
          color:     T.footerTx,
          whiteSpace:"nowrap",
          zIndex:    2,
        }}>
          &copy; {new Date().getFullYear()} CMLabs &mdash; Confidential Internal System
        </p>
      </div>
    </>
  )
}