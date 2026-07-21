"use client"

import { signIn }              from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter }           from "next/navigation"
import Image from "next/image"

// ─── Types ────────────────────────────────────────────────────────
type DemoRole    = "ADMIN" | "SALES_MANAGER" | "ACCOUNT_EXEC" | "EXECUTIVE"
type LoginStatus = "idle" | "loading" | "success"

const DEMO_ACCOUNTS: {
  role: DemoRole; label: string; pos: string
  email: string; color: string; bg: string
}[] = [
  { role:"ADMIN",   label:"Admin",   pos:"Developer Tim",  email:"admin@cmlabs.co", color:"#C0292B", bg:"rgba(192,41,43,0.08)"  },
  { role:"SALES_MANAGER", label:"Sales Manager", pos:"Leader Divisi",  email:"sales_mgr@cmlabs.co",  color:"#0047B3", bg:"rgba(0,71,179,0.08)"   },
  { role:"ACCOUNT_EXEC",  label:"Account Executive (AE)",  pos:"Marketing Team", email:"ae@cmlabs.co",          color:"#0C7A4B", bg:"rgba(12,122,75,0.08)"  },
  { role:"EXECUTIVE",     label:"Executive",     pos:"Head / C-Level", email:"executive@cmlabs.co",  color:"#5E35B1", bg:"rgba(94,53,177,0.08)"   },
]
const DEMO_PASSWORD = "Demo123!"

// ─── Decorative blobs ─────────────────────────────────────────────
interface BlobProps { x:string; y:string; w:number; h:number; color:string; rotate:string; shape:"drop"|"circle" }
const BLOBS: BlobProps[] = [
  { x:"10%", y:"7%",  w:14, h:20, color:"#F4C842", rotate:"-30deg", shape:"drop"   },
  { x:"27%", y:"4%",  w:10, h:10, color:"#E05C8A", rotate:"0deg",   shape:"circle" },
  { x:"61%", y:"3%",  w:12, h:12, color:"#F4C842", rotate:"0deg",   shape:"circle" },
  { x:"79%", y:"6%",  w:18, h:24, color:"#E05C8A", rotate:"20deg",  shape:"drop"   },
  { x:"90%", y:"12%", w:22, h:30, color:"#4B8FF5", rotate:"-15deg", shape:"drop"   },
  { x:"3%",  y:"54%", w:10, h:10, color:"#F4C842", rotate:"0deg",   shape:"circle" },
  { x:"4%",  y:"70%", w:16, h:22, color:"#8B5CF6", rotate:"20deg",  shape:"drop"   },
  { x:"91%", y:"58%", w:12, h:12, color:"#4ADE80", rotate:"0deg",   shape:"circle" },
  { x:"86%", y:"79%", w:20, h:28, color:"#4ADE80", rotate:"-10deg", shape:"drop"   },
  { x:"17%", y:"87%", w:10, h:10, color:"#F4C842", rotate:"0deg",   shape:"circle" },
  { x:"71%", y:"90%", w:12, h:12, color:"#F4C842", rotate:"0deg",   shape:"circle" },
]
function Blob({ x,y,w,h,color,rotate,shape }: BlobProps) {
  return <div style={{ position:"absolute", left:x, top:y, width:w, height:h, background:color, borderRadius:shape==="circle"?"50%":"50% 50% 50% 10%", transform:`rotate(${rotate})`, opacity:0.85, pointerEvents:"none" }}/>
}

// ─── Illustration ─────────────────────────────────────────────────
function Illustration() {
  return (
    <svg width="280" height="256" viewBox="0 0 280 256" fill="none">
      {/* Card belakang (shadow) */}
      <rect x="14" y="30" width="168" height="118" rx="14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.20)" strokeWidth="1"/>

      {/* Card utama kiri */}
      <rect x="8" y="20" width="172" height="122" rx="14" fill="white"/>
      {/* Banner kuning */}
      <rect x="8" y="20" width="172" height="58" rx="14" fill="#FFD54F"/>
      <rect x="8" y="64" width="172" height="14" fill="#FFD54F"/>
      <circle cx="76" cy="43" r="15" fill="#F4A261"/>
      <rect x="62" y="55" width="28" height="20" rx="6" fill="#2563EB"/>
      <rect x="54" y="59" width="10" height="7" rx="3.5" fill="#F4A261"/>
      <rect x="82" y="59" width="10" height="7" rx="3.5" fill="#F4A261"/>
      {/* Label di banner */}
      <rect x="18" y="62" width="56" height="5" rx="2" fill="rgba(30,41,59,0.35)"/>
      {/* Title */}
      <rect x="18" y="82" width="96" height="7" rx="3" fill="#1E293B"/>
      {/* Rows */}
      <rect x="18" y="96" width="6" height="6" rx="1" fill="#4B8FF5"/>
      <rect x="28" y="98" width="58" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="18" y="107" width="6" height="6" rx="1" fill="#34D399"/>
      <rect x="28" y="109" width="76" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="18" y="118" width="6" height="6" rx="1" fill="#F59E0B"/>
      <rect x="28" y="120" width="48" height="4" rx="2" fill="#CBD5E1"/>
      {/* Bottom strip */}
      <rect x="8" y="134" width="172" height="8" rx="4" fill="#EFF6FF"/>
      <circle cx="24" cy="138" r="4" fill="#4B8FF5" opacity="0.45"/>
      <rect x="32" y="136" width="68" height="4" rx="2" fill="#DBEAFE"/>

      {/* Card kanan (daftar profil) */}
      <rect x="116" y="96" width="156" height="152" rx="14" fill="white"/>
      {/* Title card kanan */}
      <rect x="128" y="108" width="76" height="7" rx="3" fill="#1E293B"/>
      <rect x="128" y="104" width="48" height="4" rx="2" fill="rgba(30,41,59,0.32)"/>
      {/* Row 1 */}
      <circle cx="141" cy="131" r="12" fill="#FFB347"/>
      <rect x="158" y="125" width="62" height="6" rx="3" fill="#1E293B"/>
      <rect x="158" y="135" width="40" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="226" y="124" width="36" height="18" rx="5" fill="#FEF3C7"/>
      <rect x="230" y="129" width="28" height="8" rx="3" fill="#F59E0B"/>
      {/* Row 2 */}
      <circle cx="141" cy="169" r="12" fill="#74C0FC"/>
      <rect x="158" y="163" width="62" height="6" rx="3" fill="#1E293B"/>
      <rect x="158" y="173" width="40" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="226" y="162" width="36" height="18" rx="5" fill="#DBEAFE"/>
      <rect x="230" y="167" width="28" height="8" rx="3" fill="#3B82F6"/>
      {/* Row 3 */}
      <circle cx="141" cy="207" r="12" fill="#69DB7C"/>
      <rect x="158" y="201" width="62" height="6" rx="3" fill="#1E293B"/>
      <rect x="158" y="211" width="40" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="226" y="200" width="36" height="18" rx="5" fill="#D1FAE5"/>
      <rect x="230" y="205" width="28" height="8" rx="3" fill="#10B981"/>

      {/* Floating chip */}
      <rect x="136" y="62" width="38" height="38" rx="10" fill="white" filter="url(#shadow)"/>
      <rect x="136" y="62" width="38" height="38" rx="10" stroke="rgba(0,71,179,0.14)" strokeWidth="1"/>
      <line x1="147" y1="74" x2="165" y2="74" stroke="#4B8FF5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="147" y1="81" x2="161" y2="81" stroke="#4B8FF5" strokeWidth="2" strokeLinecap="round"/>
      <line x1="147" y1="88" x2="157" y2="88" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>

      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,60,160,0.15)"/>
        </filter>
      </defs>
    </svg>
  )
}

// ─── Google icon ──────────────────────────────────────────────────
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

export default function LoginPage() {
  const router = useRouter()

  const [email,       setEmail]       = useState("")
  const [password,    setPassword]    = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [remembered,  setRemembered]  = useState(false)
  const [error,       setError]       = useState("")
  const [status,      setStatus]      = useState<LoginStatus>("idle")
  const [activeRole,  setActiveRole]  = useState<DemoRole | null>(null)
  const [showDemo,    setShowDemo]    = useState(false)
  const [focus,       setFocus]       = useState<"email"|"password"|null>(null)
  const [isDark,      setIsDark]      = useState(false)

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") setIsDark(true)
  }, [])

  function toggleTheme() {
    setIsDark(p => {
      localStorage.setItem("theme", !p ? "dark" : "light")
      return !p
    })
  }

  useEffect(() => {
    const found = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.trim().toLowerCase())
    setActiveRole(found?.role ?? null)
  }, [email])

  function quickFill(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email); setPassword(DEMO_PASSWORD)
    setActiveRole(acc.role); setError("")
  }

// SESUDAH
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError("Harap isi email dan kata sandi."); return }
    setError(""); setStatus("loading")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      setStatus("idle")
      const code = (res as any).code
      setError(
        code === "account_inactive"
          ? "Akun Anda telah dinonaktifkan. Hubungi Admin untuk mengaktifkan kembali."
          : "Email atau password tidak valid."
      )
    }
    else { setStatus("success"); setTimeout(() => router.push("/dashboard"), 1000) }
  }

  const detected = activeRole ? DEMO_ACCOUNTS.find(a => a.role === activeRole) ?? null : null

  const D = isDark
  const T = {
    page:    D ? "#060c18"      : "#EFF4FC",
    card:    D ? "#0d1a2e"      : "#ffffff",
    leftBg:  D ? "linear-gradient(145deg,#003894,#002060)" : "linear-gradient(145deg,#0055D4,#003A96)",
    inputBg: D ? "#0f1e32"      : "#FAFCFF",
    inputBd: D ? "#2B3A4D" : "#D1D5DB",
    inputTx: D ? "#ddeaf8"      : "#1E293B",
    heading: D ? "#e8f2fc"      : "#0A1628",
    body:    D ? "#6890b0"      : "#7A95B4",
    muted:   D ? "#304f6a"      : "#A8BFDA",
    divider: D ? "#14263d"      : "#EEF2FA",
    codeBg:  D ? "rgba(0,71,179,0.18)" : "#EEF4FF",
    codeBd:  D ? "rgba(0,71,179,0.35)" : "#C5D8F5",
    codeTx:  D ? "#6ea8f7"      : "#0047B3",
  }

const inp = (f: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "12px 40px 12px 16px",

  // BORDER
  border: `1.5px solid ${
    f ? "#0047B3" : T.inputBd
  }`,

  borderRadius: 10,
  fontSize: 13.5,

  // TEXT
  color: T.inputTx,

  // BACKGROUND
  background: T.inputBg,

  fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",

  outline: "none",
  boxSizing: "border-box",

  // FOCUS EFFECT
  boxShadow: f
    ? "0 0 0 3px rgba(0,71,179,0.12)"
    : "none",

  transition: "all 0.15s",

  appearance: "none",
  WebkitAppearance: "none",

  caretColor: T.inputTx,
})

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input::placeholder{color:#A8BFDA;font-size:13.5px;}

        .lp-submit{width:100%;padding:13px;background:#0047B3;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',system-ui,sans-serif;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s,transform 0.1s;}
        .lp-submit:hover:not(:disabled){background:#003A96;}
        .lp-submit:active{transform:scale(0.99);}
        .lp-submit.loading{background:#2F6FD4;cursor:not-allowed;}
        .lp-submit.success{background:#0B7B4A;cursor:not-allowed;}

        .lp-google{width:100%;padding:11px;background:${D?"#0f1e32":"#fff"};color:${D?"#c5daf5":"#374151"};border:1.5px solid ${D?"#1c3150":"#E8EEF8"};border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;transition:border-color 0.15s,background 0.15s;}
        .lp-google:hover{border-color:#4B8FF5;}

        .lp-check{width:16px;height:16px;flex-shrink:0;border:1.5px solid ${D?"#1c3150":"#C8D8EC"};border-radius:4px;background:${D?"#0f1e32":"#FAFCFF"};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
        .lp-check.on{background:#0047B3;border-color:#0047B3;}

        .lp-demo-item{padding:9px 11px;background:${D?"#0f1e32":"#F4F8FE"};border:1.5px solid ${D?"#1c3150":"#DDEAF8"};border-radius:8px;cursor:pointer;text-align:left;transition:all 0.12s;font-family:'Plus Jakarta Sans',system-ui,sans-serif;width:100%;}
        .lp-demo-item:hover{background:${D?"#132233":"#EDF3FC"};border-color:${D?"#2a4a6e":"#B5D0F5"};}
        .lp-demo-item.sel{border-color:var(--dc);background:var(--db);}

        .lp-pw-btn{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;display:flex;padding:4px;transition:color 0.15s;}

        @keyframes lp-spin{to{transform:rotate(360deg);}}
        .lp-spin{width:15px;height:15px;border-radius:50%;flex-shrink:0;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;animation:lp-spin 0.7s linear infinite;}

        @media(max-width:820px){.lp-left{display:none!important;}}
        @media(max-width:480px){.lp-right{padding:36px 20px!important;}}
      `}</style>

      <div style={{ minHeight:"100vh", background:T.page, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 16px", position:"relative", overflow:"hidden", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>

        {BLOBS.map((b,i) => <Blob key={i} {...b}/>)}

        {/* ── Theme toggle ── */}
        <button onClick={toggleTheme} style={{ position:"fixed", top:18, right:18, zIndex:100, display:"flex", alignItems:"center", gap:6, padding:"6px 13px", background:D?"rgba(14,23,36,0.85)":"rgba(255,255,255,0.90)", border:`1px solid ${D?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.10)"}`, borderRadius:999, fontSize:12, fontWeight:600, color:D?"#8ba3bf":"#3d5166", cursor:"pointer", backdropFilter:"blur(10px)", transition:"all 0.2s" }}>
          {D
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
          {D ? "Light Mode" : "Dark Mode"}
        </button>

        {/* ── Main card ── */}
        <div style={{ display:"flex", width:"100%", maxWidth:860, minHeight:560, borderRadius:20, overflow:"hidden", boxShadow:D?"0 20px 60px rgba(0,0,0,0.55),0 4px 16px rgba(0,0,0,0.35)":"0 20px 60px rgba(0,60,160,0.13),0 4px 16px rgba(0,0,0,0.06)", position:"relative", zIndex:2 }}>

          {/* ══ LEFT PANEL ══════════════════════════════════════ */}
          <div className="lp-left" style={{ width:360, flexShrink:0, background:T.leftBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 32px 40px", position:"relative", overflow:"hidden" }}>
            {/* Orbs */}
            <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }}/>

            {/* Brand */}
<div
  style={{
    position: "absolute",
    top: 26,
    left: 26,
    display: "flex",
    alignItems: "center",
    gap: 9,
    zIndex: 2,
  }}
>
  <Image
    src="/logo-cmlabs.png"
    alt="CMLabs"
    width={30}
    height={30}
    style={{
      borderRadius: 7,
      objectFit: "cover",
      flexShrink: 0,
      background: "#fff",
    }}
    priority
  />

  <div>
    <div
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: "#fff",
        letterSpacing: "-0.02em",
      }}
    >
      CMLabs
    </div>

    <div
      style={{
        fontSize: 8.5,
        color: "rgba(255,255,255,0.48)",
        letterSpacing: "0.10em",
        textTransform: "uppercase",
      }}
    >
      Internal System
    </div>
  </div>
</div>

            {/* Accent blobs inside panel */}
            <div style={{ position:"absolute", top:72, right:26, width:10, height:14, borderRadius:"50% 50% 50% 10%", background:"#FFD54F", transform:"rotate(20deg)", opacity:0.8, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", top:90, right:52, width:7, height:7, borderRadius:"50%", background:"#FF7EB3", opacity:0.7, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:80, left:22, width:8, height:8, borderRadius:"50%", background:"#7DD3FC", opacity:0.7, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:58, left:46, width:12, height:16, borderRadius:"50% 50% 50% 10%", background:"#86EFAC", transform:"rotate(-20deg)", opacity:0.7, pointerEvents:"none" }}/>

            <div style={{ position:"relative", zIndex:2, marginTop:16 }}>
              <Illustration/>
            </div>

            <div style={{ position:"relative", zIndex:2, textAlign:"center", marginTop:18 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.03em", lineHeight:1.3, margin:"0 0 10px" }}>
                Sales CRM &amp;<br/>Management System
              </h2>
              <p style={{ fontSize:12, color:"rgba(200,220,255,0.68)", lineHeight:1.75, margin:0 }}>
                Platform terpusat untuk pipeline, analitik,<br/>dan dokumen tim internal CMLabs.
              </p>
            </div>

            <div style={{ display:"flex", gap:6, marginTop:22, position:"relative", zIndex:2 }}>
              <div style={{ width:20, height:5, borderRadius:3, background:"rgba(255,255,255,0.85)" }}/>
              <div style={{ width:5,  height:5, borderRadius:3, background:"rgba(255,255,255,0.32)" }}/>
              <div style={{ width:5,  height:5, borderRadius:3, background:"rgba(255,255,255,0.32)" }}/>
            </div>
          </div>

          {/* ══ RIGHT PANEL ═════════════════════════════════════ */}
          <div className="lp-right" style={{ flex:1, background:T.card, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 52px", position:"relative", overflowY:"auto" }}>

            {/* Internal badge */}
            <div style={{ position:"absolute", top:22, right:22, padding:"4px 12px", background:D?"rgba(0,71,179,0.18)":"#EEF4FF", border:`1px solid ${D?"rgba(0,71,179,0.35)":"#C5D8F5"}`, borderRadius:20, fontSize:10, fontWeight:700, color:D?"#6ea8f7":"#1565C0", letterSpacing:"0.06em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#0047B3" }}/>
              Internal Only
            </div>

            <div style={{ width:"100%", maxWidth:340 }}>

              {/* Logo + heading */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
               <Image
  src="/logo-cmlabs.png"
  alt="CMLabs"
  width={30}
  height={30}
  style={{
    borderRadius: 7,
    objectFit: "cover",
    flexShrink: 0,
  }}
/>
                <h1 style={{ fontSize:25, fontWeight:800, color:T.heading, letterSpacing:"-0.03em", margin:"14px 0 7px", textAlign:"center" }}>
                  Selamat Datang!
                </h1>
                <p style={{ fontSize:13, color:T.body, textAlign:"center", lineHeight:1.65, margin:0 }}>
                  Masuk ke sistem internal CMLabs.<br/>Akses khusus personel yang diotorisasi.
                </p>
              </div>

              {/* Role chip */}
              {detected && (
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", marginBottom:14, borderRadius:"0 8px 8px 0", borderLeft:`3px solid ${detected.color}`, background:detected.bg }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:detected.color, flexShrink:0 }}/>
                  <span style={{ fontSize:12, fontWeight:700, color:detected.color }}>{detected.label}</span>
                  <span style={{ fontSize:12, color:T.body }}>— {detected.pos}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ display:"flex", gap:8, alignItems:"center", padding:"9px 13px", marginBottom:14, background:D?"rgba(192,41,43,0.12)":"#FFF0F0", border:`1px solid ${D?"rgba(192,41,43,0.30)":"#FBC8C8"}`, borderRadius:8, fontSize:12.5, color:D?"#f87171":"#C0292B" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:12 }}>

                {/* Email */}
                <div style={{ position:"relative" }}>
                  <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={inp(focus==="email")} onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}/>
                  <div style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", color:T.muted, display:"flex", pointerEvents:"none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                </div>

                {/* Password */}
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={inp(focus==="password")} onFocus={() => setFocus("password")} onBlur={() => setFocus(null)}/>
                  <button type="button" className="lp-pw-btn" onClick={() => setShowPw(!showPw)} style={{ color: showPw?"#0047B3":T.muted }} aria-label="Toggle password">
                    {showPw
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>

                {/* Remember me */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"2px 0" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", userSelect:"none" }}>
                    <div className={`lp-check${remembered?" on":""}`} onClick={() => setRemembered(!remembered)} role="checkbox" aria-checked={remembered} tabIndex={0} onKeyDown={e => e.key===" " && setRemembered(!remembered)}>
                      {remembered && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ fontSize:12, color:T.body }}>Tetap masuk</span>
                  </label>
                  {/* Tidak ada lupa password — Admin yang reset */}
                  <span style={{ fontSize:11.5, color:T.muted, fontStyle:"italic" }}>
                    Hubungi Admin jika lupa password
                  </span>
                </div>

                {/* Submit */}
                <button type="submit" className={`lp-submit${status==="loading"?" loading":status==="success"?" success":""}`} disabled={status!=="idle"} style={{ marginTop:4 }}>
                  {status==="loading" ? <><div className="lp-spin"/> Loading </>
                   : status==="success" ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Berhasil! </>
                   : <>Login <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                  }
                </button>
              </form>

              {/* Divider */}
              <div style={{ position:"relative", textAlign:"center", margin:"16px 0" }}>
                <div style={{ position:"absolute", left:0, top:"50%", width:"100%", height:1, background:T.divider }}/>
                <span style={{ position:"relative", background:T.card, padding:"0 10px", fontSize:11, color:T.muted, fontWeight:500 }}>atau</span>
              </div>

              {/* Google SSO */}
              <button type="button" className="lp-google">
                <GoogleIcon/> Masuk dengan Google Workspace
              </button>

              {/* Demo accounts */}
              <div style={{ marginTop:20, borderTop:`1px solid ${T.divider}`, paddingTop:16 }}>
                <button type="button" onClick={() => setShowDemo(!showDemo)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2px", fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
                  <span style={{ fontSize:11.5, fontWeight:600, color:T.body }}>Akun Demo</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <code style={{ fontSize:10.5, fontWeight:600, padding:"2px 8px", borderRadius:4, background:T.codeBg, border:`1px solid ${T.codeBd}`, color:T.codeTx, fontFamily:"'DM Mono',monospace" }}>
                      {DEMO_PASSWORD}
                    </code>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" style={{ transform:showDemo?"rotate(180deg)":"rotate(0)", transition:"transform 0.15s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>

                {showDemo && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10 }}>
                    {DEMO_ACCOUNTS.map(acc => (
                      <button key={acc.role} type="button" onClick={() => quickFill(acc)} className={`lp-demo-item${activeRole===acc.role?" sel":""}`} style={{ ["--dc" as string]:acc.color, ["--db" as string]:acc.bg } as React.CSSProperties}>
                        <div style={{ fontSize:11, fontWeight:700, color:acc.color, marginBottom:3 }}>{acc.label}</div>
                        <div style={{ fontSize:10, color:T.muted, fontFamily:"'DM Mono',monospace" }}>{acc.email.split("@")[0]}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p style={{ textAlign:"center", fontSize:11, color:T.muted, marginTop:18, lineHeight:1.65 }}>
                Sistem ini hanya untuk personel CMLabs<br/>yang telah mendapat otorisasi administrator.
              </p>
            </div>
          </div>
        </div>

        <p style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", fontSize:11, color:D?"rgba(100,140,180,0.38)":"rgba(0,60,140,0.28)", whiteSpace:"nowrap", zIndex:2 }}>
          &copy; {new Date().getFullYear()} CMLabs &mdash; CRM CMLABS
        </p>
      </div>
    </>
  )
}