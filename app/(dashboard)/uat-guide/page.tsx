"use client"

import { useUAT }    from "@/lib/uat/uatContext"
import { ROLE_COLOR, ROLE_LABEL, GFORM_URL, getStepsForRole, UATRole } from "@/lib/uat/uatSteps"

// SVG icons
const IC = {
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Flag: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  RotateCcw: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
    </svg>
  ),
}

export default function UATGuidePage() {
  const { active, role, stepIndex, totalSteps, doneSet, jumpTo, reset, setActive } = useUAT()

  if (!active || !role) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 0" }}>
        <div style={{
          background:   "var(--bg-card)", borderRadius: 14,
          padding:      "32px 24px", border: "1px solid var(--border)",
          textAlign:    "center",
        }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--primary-pale)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--primary)", margin:"0 auto 14px" }}>
            <IC.Flag />
          </div>
          <h2 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>
            Panduan UAT Belum Dimulai
          </h2>
          <p style={{ margin:"0 0 20px", fontSize:13, color:"var(--text-muted)", lineHeight:1.7 }}>
            Buka halaman Login dan pilih role UAT Anda untuk memulai pengujian terstruktur.
            Bubble panduan akan mengikuti Anda di seluruh halaman sistem.
          </p>
          <a href="/login" style={{
            display:        "inline-flex", alignItems:"center", gap:6,
            padding:        "11px 22px",
            background:     "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color:          "#fff", borderRadius:10,
            fontSize:       13, fontWeight:700,
            textDecoration: "none",
            boxShadow:      "var(--shadow-primary)",
          }}>
            Ke Halaman Login
          </a>
        </div>
      </div>
    )
  }

  const color     = ROLE_COLOR[role]
  const steps     = getStepsForRole(role as UATRole)
  const doneCount = Array.from(doneSet).length
  const pct       = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0
  const allDone   = doneCount >= totalSteps

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div style={{
        background:   `linear-gradient(135deg, var(--hero-a,#07111e), var(--hero-b,#0a1628))`,
        borderRadius: 16, padding:"20px 22px",
        position:     "relative", overflow:"hidden", boxShadow:"var(--shadow-lg)",
      }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:110, height:110, borderRadius:"50%", background:color, opacity:0.07, pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:color, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>
                {ROLE_LABEL[role]}
              </div>
              <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:"#f0f6fc" }}>
                Progress Pengujian UAT
              </h2>
              <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                Langkah {stepIndex+1} dari {totalSteps} — {pct}% selesai
              </p>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {allDone && (
                <a href="https://forms.gle/fQxcNQjwspXH2wbDA" target="_blank" rel="noopener noreferrer" style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"8px 14px",
                  background:"linear-gradient(135deg,#10b981,#059669)",
                  color:"#fff", borderRadius:9,
                  fontSize:12, fontWeight:700,
                  textDecoration:"none",
                  boxShadow:"0 3px 12px rgba(16,185,129,0.4)",
                }}>
                  Isi Kuesioner <IC.ExternalLink />
                </a>
              )}
              <button onClick={() => { if(confirm("Reset progress UAT?")) reset() }} style={{
                display:"flex", alignItems:"center", gap:5,
                padding:"8px 12px",
                background:"rgba(239,68,68,0.12)",
                border:"1px solid rgba(239,68,68,0.22)",
                borderRadius:9, color:"#f87171",
                fontSize:11, fontWeight:500, cursor:"pointer",
              }}>
                <IC.RotateCcw /> Reset
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop:14, height:6, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:999, width:`${pct}%`,
              background: allDone
                ? "linear-gradient(90deg,#10b981,#34d399)"
                : `linear-gradient(90deg,${color},#3b82f6)`,
              transition:"width 0.5s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Step list */}
      <div style={{ background:"var(--bg-card)", borderRadius:14, border:"1px solid var(--border)", overflow:"hidden", boxShadow:"var(--shadow-xs)" }}>
        <div style={{ padding:"13px 17px 10px", borderBottom:"1px solid var(--border-light)", background:"var(--bg-card2)" }}>
          <h3 style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>
            Daftar Langkah Pengujian
          </h3>
          <p style={{ margin:"3px 0 0", fontSize:11, color:"var(--text-muted)" }}>
            Klik langkah manapun untuk loncat ke posisi tersebut. Bubble panduan akan memperbarui secara otomatis.
          </p>
        </div>
        <div style={{ padding:"10px 14px", maxHeight:480, overflowY:"auto" }}>
          {steps.map((step, i) => {
            const isDone    = doneSet.has(step.id)
            const isCurrent = i === stepIndex
            const isPast    = i < stepIndex

            return (
              <div
                key={step.id}
                onClick={() => jumpTo(i)}
                style={{
                  display:    "flex", alignItems:"flex-start", gap:11,
                  padding:    "9px 10px", borderRadius:9, marginBottom:3,
                  background: isCurrent ? color+"0d" : "transparent",
                  border:     `1px solid ${isCurrent ? color+"30" : "transparent"}`,
                  cursor:     "pointer", transition:"all 0.15s",
                }}
                onMouseEnter={(e) => { if(!isCurrent) e.currentTarget.style.background="var(--bg-card2)" }}
                onMouseLeave={(e) => { if(!isCurrent) e.currentTarget.style.background="transparent" }}
              >
                {/* Indicator */}
                <div style={{
                  width:          22, height:22, borderRadius:"50%", flexShrink:0,
                  background:     isDone ? color : isCurrent ? color+"18" : "var(--bg-card2)",
                  border:         `2px solid ${isDone||isCurrent ? color : "var(--border)"}`,
                  display:        "flex", alignItems:"center", justifyContent:"center",
                  color:          isDone ? "#fff" : isCurrent ? color : "var(--text-muted)",
                  fontSize:       8, fontWeight:900, marginTop:2,
                }}>
                  {isDone ? <IC.Check /> : i+1}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{
                    fontSize:       12, fontWeight: isCurrent ? 700 : 500,
                    color:          isDone ? "var(--text-muted)" : isCurrent ? color : "var(--text-secondary)",
                    textDecoration: isDone ? "line-through" : "none",
                    overflow:       "hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    lineHeight:     1.4,
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize:10, color:"var(--text-muted)", lineHeight:1.4, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {step.description}
                  </div>
                  {isCurrent && (
                    <div style={{ fontSize:9, color, marginTop:3, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                      Langkah saat ini
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA kuesioner */}
      <div style={{ background:"var(--bg-card)", borderRadius:12, padding:"16px 18px", border:"1px solid var(--border)", textAlign:"center" }}>
        <h3 style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>
          Sudah selesai semua langkah?
        </h3>
        <p style={{ margin:"0 0 14px", fontSize:12, color:"var(--text-muted)" }}>
          Isi kuesioner UAT untuk menyelesaikan proses pengujian Anda.
        </p>
        <a href="https://forms.gle/fQxcNQjwspXH2wbDA" target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:6,
          padding:"10px 22px",
          background:"linear-gradient(135deg,var(--primary),var(--primary-dark))",
          color:"#fff", borderRadius:10,
          fontSize:13, fontWeight:700,
          textDecoration:"none",
          boxShadow:"var(--shadow-primary)",
        }}>
          Isi Kuesioner Google Form <IC.ExternalLink />
        </a>
      </div>
    </div>
  )
}