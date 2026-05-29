"use client"

import { signIn }              from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"

// ─── Types ───────────────────────────────────────────────────────
type DemoRole    = "SUPER_ADMIN" | "SALES_MANAGER" | "ACCOUNT_EXEC" | "EXECUTIVE"
type LoginStatus = "idle" | "loading" | "success"

const DEMO_ACCOUNTS: {
  role: DemoRole; label: string; pos: string; email: string
  color: string;  bg: string
}[] = [
  { role:"SUPER_ADMIN",   label:"Super Admin",   pos:"Developer Tim",  email:"super_admin@cmlabs.co", color:"#C0292B", bg:"rgba(192,41,43,0.08)"  },
  { role:"SALES_MANAGER", label:"Sales Manager", pos:"Leader Divisi",  email:"sales_mgr@cmlabs.co",  color:"#0047B3", bg:"rgba(0,71,179,0.08)"   },
  { role:"ACCOUNT_EXEC",  label:"Account Exec",  pos:"Marketing Team", email:"ae@cmlabs.co",          color:"#0C7A4B", bg:"rgba(12,122,75,0.08)"  },
  { role:"EXECUTIVE",     label:"Executive",     pos:"Head / C-Level", email:"executive@cmlabs.co",  color:"#5E35B1", bg:"rgba(94,53,177,0.08)"   },
]
const DEMO_PASSWORD = "Demo123!"

// ─── Floating decorative blobs ───────────────────────────────────
interface BlobProps {
  x: string; y: string; w: number; h: number
  color: string; rotate: string; shape: "drop" | "circle"
}
const BLOBS: BlobProps[] = [
  { x:"11%",  y:"7%",  w:14, h:20, color:"#F4C842", rotate:"-30deg", shape:"drop"   },
  { x:"27%",  y:"4%",  w:10, h:10, color:"#E05C8A", rotate:"0deg",   shape:"circle" },
  { x:"61%",  y:"3%",  w:12, h:12, color:"#F4C842", rotate:"0deg",   shape:"circle" },
  { x:"79%",  y:"6%",  w:18, h:24, color:"#E05C8A", rotate:"20deg",  shape:"drop"   },
  { x:"89%",  y:"13%", w:22, h:30, color:"#4B8FF5", rotate:"-15deg", shape:"drop"   },
  { x:"3%",   y:"54%", w:10, h:10, color:"#F4C842", rotate:"0deg",   shape:"circle" },
  { x:"4%",   y:"71%", w:16, h:22, color:"#8B5CF6", rotate:"20deg",  shape:"drop"   },
  { x:"91%",  y:"59%", w:12, h:12, color:"#4ADE80", rotate:"0deg",   shape:"circle" },
  { x:"86%",  y:"79%", w:20, h:28, color:"#4ADE80", rotate:"-10deg", shape:"drop"   },
  { x:"17%",  y:"87%", w:10, h:10, color:"#F4C842", rotate:"0deg",   shape:"circle" },
  { x:"71%",  y:"90%", w:12, h:12, color:"#F4C842", rotate:"0deg",   shape:"circle" },
]

function Blob({ x, y, w, h, color, rotate, shape }: BlobProps) {
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: w, height: h, background: color,
      borderRadius: shape === "circle" ? "50%" : "50% 50% 50% 10%",
      transform: `rotate(${rotate})`, opacity: 0.85, pointerEvents: "none",
    }}/>
  )
}

// ─── Left panel flat illustration ───────────────────────────────
function LeftIllustration() {
  return (
    <svg width="300" height="280" viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back card */}
      <rect x="30" y="60" width="170" height="110" rx="14" fill="white" opacity="0.15"/>
      <rect x="30" y="60" width="170" height="110" rx="14" stroke="white" strokeWidth="0.8" opacity="0.3"/>
      {/* Main food card */}
      <rect x="18" y="46" width="175" height="118" rx="14" fill="white"/>
      <rect x="18" y="46" width="175" height="52" rx="14" fill="#FFD54F"/>
      <rect x="18" y="84" width="175" height="14" fill="#FFD54F"/>
      {/* Person */}
      <circle cx="80" cy="68" r="16" fill="#F4A261"/>
      <rect x="64" y="80" width="32" height="22" rx="6" fill="#2563EB"/>
      <rect x="56" y="84" width="12" height="8" rx="4" fill="#F4A261"/>
      <rect x="88" y="84" width="12" height="8" rx="4" fill="#F4A261"/>
      {/* Content lines */}
      <rect x="28" y="104" width="6" height="6" rx="1" fill="#4B8FF5"/>
      <rect x="38" y="106" width="60" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="28" y="115" width="6" height="6" rx="1" fill="#34D399"/>
      <rect x="38" y="117" width="80" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="28" y="126" width="6" height="6" rx="1" fill="#F59E0B"/>
      <rect x="38" y="128" width="50" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="28" y="92" width="100" height="7" rx="3" fill="#1E293B"/>
      <rect x="28" y="86" width="60" height="5" rx="2" fill="rgba(30,41,59,0.4)"/>
      {/* Bottom bar */}
      <rect x="18" y="152" width="175" height="12" rx="6" fill="white"/>
      <circle cx="32" cy="158" r="5" fill="#4B8FF5" opacity="0.4"/>
      <rect x="42" y="155" width="70" height="4" rx="2" fill="#E2E8F0"/>
      {/* Right card */}
      <rect x="150" y="110" width="140" height="148" rx="14" fill="white"/>
      {[0,1,2].map((i) => (
        <g key={i} transform={`translate(0, ${i * 38})`}>
          <circle cx="173" cy="135" r="14" fill={["#FFB347","#74C0FC","#69DB7C"][i]}/>
          <rect x="195" y="130" width="60" height="5" rx="2.5" fill="#1E293B"/>
          <rect x="195" y="139" width="40" height="4" rx="2" fill="#CBD5E1"/>
          <rect x="257" y="130" width="22" height="14" rx="4" fill={["#FEF3C7","#DBEAFE","#D1FAE5"][i]}/>
          <rect x="259" y="134" width="18" height="6" rx="2" fill={["#F59E0B","#3B82F6","#10B981"][i]}/>
        </g>
      ))}
      <rect x="160" y="116" width="80" height="7" rx="3" fill="#1E293B"/>
      <rect x="160" y="112" width="50" height="4" rx="2" fill="rgba(30,41,59,0.35)"/>
      {/* Icon chip */}
      <rect x="168" y="82" width="36" height="36" rx="10" fill="white"/>
      <rect x="168" y="82" width="36" height="36" rx="10" stroke="rgba(0,71,179,0.15)" strokeWidth="1"/>
      <path d="M180 94 h12 M180 100 h8 M180 106 h10" stroke="#4B8FF5" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ─── CMLabs stacked-lines logo ───────────────────────────────────
function CMLogo({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect width="44" height="44" rx="12" fill="#EEF4FF"/>
      <rect x="1" y="1" width="42" height="42" rx="11" stroke="#DDEAF8" strokeWidth="1"/>
      <rect x="13" y="13" width="18" height="4" rx="2" fill="#0047B3"/>
      <rect x="13" y="20" width="14" height="4" rx="2" fill="#4B8FF5"/>
      <rect x="13" y="27" width="10" height="4" rx="2" fill="#93C5FD"/>
    </svg>
  )
}

// ─── Google icon ─────────────────────────────────────────────────
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

// ─── Main page component ─────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()

  const [email,       setEmail]       = useState("")
  const [password,    setPassword]    = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [remembered,  setRemembered]  = useState(false)
  const [error,       setError]       = useState("")
  const [loginStatus, setLoginStatus] = useState<LoginStatus>("idle")
  const [activeRole,  setActiveRole]  = useState<DemoRole | null>(null)
  const [showDemo,    setShowDemo]    = useState(false)
  const [focusField,  setFocusField]  = useState<"email" | "password" | null>(null)

  useEffect(() => {
    const found = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    )
    setActiveRole(found?.role ?? null)
  }, [email])

  function quickFill(acc: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(acc.email)
    setPassword(DEMO_PASSWORD)
    setActiveRole(acc.role)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError("Harap isi email dan kata sandi."); return }
    setError("")
    setLoginStatus("loading")
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

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px 42px 13px 16px",
    border: `1.5px solid ${focused ? "#0047B3" : "#E8EEF8"}`,
    borderRadius: 10,
    fontSize: 13.5,
    color: "#1E293B",
    background: focused ? "#fff" : "#FAFCFF",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    boxShadow: focused ? "0 0 0 3px rgba(0,71,179,0.09)" : "none",
    transition: "all 0.15s",
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #A8BFDA; font-size: 13.5px; }

        .lp-btn-main {
          width: 100%; padding: 13px;
          background: #0047B3; color: #fff;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: -0.01em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }
        .lp-btn-main:hover:not(:disabled) { background: #003A96; }
        .lp-btn-main:active { transform: scale(0.99); }
        .lp-btn-main.success { background: #0B7B4A; cursor: not-allowed; }
        .lp-btn-main.loading { background: #2F6FD4; cursor: not-allowed; }

        .lp-btn-google {
          width: 100%; padding: 11px;
          background: #fff; color: #374151;
          border: 1.5px solid #E8EEF8; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: border-color 0.15s, background 0.15s;
        }
        .lp-btn-google:hover { border-color: #B5D0F5; background: #FAFCFF; }

        .lp-check-box {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 1.5px solid #C8D8EC; border-radius: 4px;
          background: #FAFCFF; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .lp-check-box.on { background: #0047B3; border-color: #0047B3; }

        .lp-demo-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 8px; cursor: pointer;
          border: 1.5px solid transparent; background: transparent;
          text-align: left; width: 100%;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.12s;
        }
        .lp-demo-row:hover { background: #F0F6FF; border-color: #C5D8F5; }
        .lp-demo-row.active { border-color: var(--dc); background: var(--db); }

        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spin {
          width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: lp-spin 0.7s linear infinite;
        }

        @media (max-width: 840px) { .lp-left-panel { display: none !important; } }
        @media (max-width: 500px) {
          .lp-right-panel { padding: 36px 24px !important; }
        }
      `}</style>

      {/* Page wrapper with blobs */}
      <div style={{
        minHeight: "100vh",
        background: "#EFF4FC",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 16px",
        position: "relative", overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}>
        {BLOBS.map((b, i) => <Blob key={i} {...b}/>)}

        {/* Card */}
        <div style={{
          display: "flex", width: "100%", maxWidth: 860,
          minHeight: 560, borderRadius: 20, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,60,160,0.14), 0 4px 16px rgba(0,0,0,0.06)",
          position: "relative", zIndex: 2,
        }}>

          {/* ── LEFT PANEL ────────────────────────────────────── */}
          <div className="lp-left-panel" style={{
            width: 360, flexShrink: 0,
            background: "linear-gradient(145deg, #0055D4 0%, #0047B3 55%, #003A96 100%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "56px 32px 40px",
            position: "relative", overflow: "hidden",
          }}>
            {/* Orbs */}
            <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>

            {/* Branding */}
            <div style={{ position:"absolute", top:28, left:28, display:"flex", alignItems:"center", gap:10, zIndex:2 }}>
              <div style={{ width:32, height:32, background:"rgba(255,255,255,0.15)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
                  <rect x="5" y="8"  width="22" height="5" rx="2.5" fill="white"/>
                  <rect x="5" y="17" width="16" height="5" rx="2.5" fill="rgba(255,255,255,0.7)"/>
                  <rect x="5" y="26" width="12" height="5" rx="2.5" fill="rgba(255,255,255,0.5)"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>CMLabs</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.50)", letterSpacing:"0.10em", textTransform:"uppercase" }}>Internal System</div>
              </div>
            </div>

            {/* Mini blobs inside left panel */}
            <div style={{ position:"absolute", top:72, right:28, width:10, height:14, borderRadius:"50% 50% 50% 10%", background:"#FFD54F", transform:"rotate(20deg)", opacity:0.8, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", top:90, right:54, width:7,  height:7,  borderRadius:"50%", background:"#FF7EB3", opacity:0.7, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:80, left:24, width:8,  height:8,  borderRadius:"50%", background:"#7DD3FC", opacity:0.7, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:58, left:48, width:12, height:16, borderRadius:"50% 50% 50% 10%", background:"#86EFAC", transform:"rotate(-20deg)", opacity:0.7, pointerEvents:"none" }}/>

            {/* Illustration */}
            <div style={{ position:"relative", zIndex:2, marginTop:16 }}>
              <LeftIllustration/>
            </div>

            {/* Caption */}
            <div style={{ position:"relative", zIndex:2, textAlign:"center", marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.03em", lineHeight:1.3, margin:"0 0 10px" }}>
                Sales CRM &amp;<br/>Management System
              </h2>
              <p style={{ fontSize:12, color:"rgba(200,220,255,0.70)", lineHeight:1.75, margin:0 }}>
                Platform terpusat untuk pipeline, analitik,<br/>dan dokumen tim internal CMLabs.
              </p>
            </div>

            {/* Dot indicator */}
            <div style={{ display:"flex", gap:6, marginTop:20, position:"relative", zIndex:2 }}>
              <div style={{ width:20, height:5, borderRadius:3, background:"rgba(255,255,255,0.85)" }}/>
              <div style={{ width:5,  height:5, borderRadius:3, background:"rgba(255,255,255,0.35)" }}/>
              <div style={{ width:5,  height:5, borderRadius:3, background:"rgba(255,255,255,0.35)" }}/>
            </div>
          </div>

          {/* ── RIGHT PANEL ───────────────────────────────────── */}
          <div className="lp-right-panel" style={{
            flex: 1, background: "#fff",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "48px 52px",
            position: "relative", overflowY: "auto",
          }}>

            {/* Internal badge */}
            <div style={{
              position:"absolute", top:22, right:22,
              padding:"4px 12px",
              background:"#EEF4FF", border:"1px solid #C5D8F5", borderRadius:20,
              fontSize:10, fontWeight:700, color:"#1565C0",
              letterSpacing:"0.06em", textTransform:"uppercase",
              display:"flex", alignItems:"center", gap:5,
            }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#0047B3" }}/>
              Internal Only
            </div>

            <div style={{ width:"100%", maxWidth:340 }}>

              {/* Logo + heading */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:28 }}>
                <CMLogo size={52}/>
                <h1 style={{ fontSize:26, fontWeight:800, color:"#0A1628", letterSpacing:"-0.03em", margin:"16px 0 8px", textAlign:"center" }}>
                  Selamat Datang!
                </h1>
                <p style={{ fontSize:13, color:"#7A95B4", textAlign:"center", lineHeight:1.65, margin:0 }}>
                  Masuk ke sistem internal CMLabs.<br/>Akses khusus personel yang diotorisasi.
                </p>
              </div>

              {/* Role chip */}
              {detectedAcc && (
                <div style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"7px 12px", marginBottom:14,
                  borderRadius:"0 8px 8px 0",
                  borderLeft:`3px solid ${detectedAcc.color}`,
                  background: detectedAcc.bg,
                }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:detectedAcc.color, flexShrink:0 }}/>
                  <span style={{ fontSize:12, fontWeight:700, color:detectedAcc.color }}>{detectedAcc.label}</span>
                  <span style={{ fontSize:12, color:"#7A95B4" }}>— {detectedAcc.pos}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  display:"flex", gap:8, alignItems:"center",
                  padding:"9px 13px", marginBottom:14,
                  background:"#FFF0F0", border:"1px solid #FBC8C8",
                  borderRadius:8, fontSize:12.5, color:"#C0292B",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
                <div style={{ position:"relative" }}>
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    style={inputStyle(focusField === "email")}
                    onFocus={() => setFocusField("email")}
                    onBlur={() => setFocusField(null)}
                  />
                  <div style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", color:"#A8BFDA", display:"flex", pointerEvents:"none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                </div>

                {/* Password */}
                <div style={{ position:"relative" }}>
                  <input
                    type={showPw ? "text" : "password"} required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={inputStyle(focusField === "password")}
                    onFocus={() => setFocusField("password")}
                    onBlur={() => setFocusField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position:"absolute", right:11, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color: showPw ? "#0047B3" : "#A8BFDA",
                      display:"flex", padding:4, transition:"color 0.15s",
                    }}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPw ? (
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
                    )}
                  </button>
                </div>

                {/* Remember + Forgot */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"2px 0" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", userSelect:"none" }}>
                    <div
                      className={`lp-check-box${remembered ? " on" : ""}`}
                      onClick={() => setRemembered(!remembered)}
                      role="checkbox" aria-checked={remembered} tabIndex={0}
                      onKeyDown={(e) => e.key === " " && setRemembered(!remembered)}
                    >
                      {remembered && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize:12, color:"#7A95B4" }}>Tetap masuk</span>
                  </label>
                  <button
                    type="button"
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#0047B3", fontWeight:600, fontFamily:"inherit", padding:0 }}
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`lp-btn-main${loginStatus === "success" ? " success" : loginStatus === "loading" ? " loading" : ""}`}
                  disabled={loginStatus !== "idle"}
                  style={{ marginTop:4 }}
                >
                  {loginStatus === "loading" ? (
                    <><div className="lp-spin"/> Memverifikasi...</>
                  ) : loginStatus === "success" ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Berhasil — Mengalihkan...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{ position:"relative", textAlign:"center", margin:"16px 0" }}>
                <div style={{ position:"absolute", left:0, top:"50%", width:"100%", height:1, background:"#EEF2FA" }}/>
                <span style={{ position:"relative", background:"#fff", padding:"0 10px", fontSize:11, color:"#A8BFDA", fontWeight:500 }}>atau</span>
              </div>

              {/* Google SSO */}
              <button type="button" className="lp-btn-google">
                <GoogleIcon/>
                Masuk dengan Google Workspace
              </button>

              {/* Demo accounts section */}
              <div style={{ marginTop:20, borderTop:"1px solid #EEF2FA", paddingTop:16 }}>
                <button
                  type="button"
                  onClick={() => setShowDemo(!showDemo)}
                  style={{
                    width:"100%", background:"none", border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"0 2px",
                    fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                >
                  <span style={{ fontSize:11.5, fontWeight:600, color:"#7A95B4" }}>Akun Demo</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <code style={{
                      fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:4,
                      background:"#EEF4FF", border:"1px solid #C5D8F5",
                      color:"#0047B3", fontFamily:"'DM Mono', monospace",
                    }}>
                      {DEMO_PASSWORD}
                    </code>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#A8BFDA" strokeWidth="2.5" strokeLinecap="round"
                      style={{ transform: showDemo ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.15s" }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {showDemo && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:10 }}>
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => quickFill(acc)}
                        className={`lp-demo-row${activeRole === acc.role ? " active" : ""}`}
                        style={{ ["--dc" as string]: acc.color, ["--db" as string]: acc.bg } as React.CSSProperties}
                      >
                        <div style={{ width:3, height:28, borderRadius:2, background:acc.color, flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:11.5, fontWeight:700, color:"#1E293B" }}>{acc.label}</div>
                          <div style={{ fontSize:10.5, color:"#94A3B8", fontFamily:"'DM Mono', monospace" }}>{acc.email}</div>
                        </div>
                        {activeRole === acc.role && (
                          <div style={{ width:16, height:16, borderRadius:"50%", background:acc.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p style={{ textAlign:"center", fontSize:11.5, color:"#94A3B8", marginTop:20, lineHeight:1.6 }}>
                Sistem ini hanya untuk personel CMLabs<br/>yang telah mendapat otorisasi administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p style={{
          position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)",
          fontSize:11, color:"rgba(0,60,140,0.35)", whiteSpace:"nowrap",
          zIndex:2, letterSpacing:"0.01em",
        }}>
          &copy; {new Date().getFullYear()} CMLabs &mdash; Confidential Internal System
        </p>
      </div>
    </>
  )
}