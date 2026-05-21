"use client"

import { useState, useEffect } from "react"
import { useUAT }              from "@/lib/uat/uatContext"
import { GFORM_URL, ROLE_COLOR, ROLE_LABEL } from "@/lib/uat/uatSteps"
import Link                    from "next/link"
import { usePathname }         from "next/navigation"

// ── SVG Icons ──────────────────────────────────────────────────
const IC = {
  ChevRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ChevLeft: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Target: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Info: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Warning: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Map: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  Minimize: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20"/>
      <polyline points="20 10 14 10 14 4"/>
      <line x1="10" y1="14" x2="3" y2="21"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
    </svg>
  ),
  Maximize: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
  Flag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
}

// ── Mini indicator (collapsed state) ──────────────────────────
function MiniBubble({ color, stepIndex, total, onExpand }: {
  color: string; stepIndex: number; total: number; onExpand: () => void
}) {
  const pct = total > 0 ? Math.round(((stepIndex + 1) / total) * 100) : 0
  return (
    <button
      onClick={onExpand}
      style={{
        position:      "fixed",
        bottom:        24,
        right:         24,
        zIndex:        1000,
        width:         52, height: 52,
        borderRadius:  "50%",
        background:    `linear-gradient(135deg, ${color}, ${color}cc)`,
        border:        "none",
        cursor:        "pointer",
        display:       "flex",
        alignItems:    "center",
        justifyContent: "center",
        boxShadow:     `0 4px 20px ${color}50, 0 0 0 3px ${color}20`,
        animation:     "bubblePulse 2.5s ease-in-out infinite",
        color:         "#fff",
      }}
      title="Buka panduan UAT"
    >
      <IC.Map />
      {/* Step count badge */}
      <div style={{
        position:       "absolute",
        top:            -4, right: -4,
        width:          18, height: 18,
        borderRadius:   "50%",
        background:     "#fff",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       8,
        fontWeight:     900,
        color,
      }}>
        {stepIndex + 1}
      </div>
    </button>
  )
}

// ── Main Bubble ────────────────────────────────────────────────
export default function UATBubble() {
  const {
    active, role, stepIndex, totalSteps, currentStep, doneSet,
    next, back, skip, setActive,
  } = useUAT()

  const pathname      = usePathname()
  const [minimized, setMinimized] = useState(false)
  const [expanded,  setExpanded]  = useState(false)

  // Auto-expand when step changes
  useEffect(() => {
    if (active) setMinimized(false)
  }, [stepIndex, active])

  // Don't render if not active or on login page (login page has its own UI)
  if (!active || !role || !currentStep) return null
  if (pathname === "/login") return null

  const color      = ROLE_COLOR[role] ?? "#3b82f6"
  const pct        = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0
  const isFinish   = currentStep.id === "finish-1"
  const isFirst    = stepIndex === 0
  const isLast     = stepIndex === totalSteps - 1

  if (minimized) {
    return <MiniBubble color={color} stepIndex={stepIndex} total={totalSteps} onExpand={() => setMinimized(false)} />
  }

  return (
    <>
      {/* Bubble container */}
      <div style={{
        position:     "fixed",
        bottom:       24,
        right:        24,
        zIndex:       1000,
        width:        390,
        maxWidth:     "calc(100vw - 24px)",
        background:   "var(--bg-card, #0e1724)",
        border:       `1px solid ${color}45`,
        borderRadius: 16,
        boxShadow:    `0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px ${color}15`,
        overflow:     "hidden",
        animation:    "bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Progress bar top */}
        <div style={{ height: 3, background: "var(--border, #1a2d42)", position: "relative" }}>
          <div style={{
            position:   "absolute", top: 0, left: 0, height: "100%",
            width:      `${pct}%`, borderRadius: 999,
            background: isFinish
              ? "linear-gradient(90deg,#10b981,#34d399)"
              : `linear-gradient(90deg,${color},${color}bb)`,
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding:      "12px 14px 9px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display:      "flex", alignItems: "center", gap: 9,
        }}>
          {/* Step circle */}
          <div style={{
            width:          26, height: 26, borderRadius: "50%",
            background:     isFinish ? "#10b981" : color + "20",
            border:         `2px solid ${isFinish ? "#10b981" : color}`,
            display:        "flex", alignItems: "center", justifyContent: "center",
            color:          isFinish ? "#fff" : color,
            fontSize:       10, fontWeight: 800, flexShrink: 0,
          }}>
            {isFinish ? <IC.Flag /> : stepIndex + 1}
          </div>

          {/* Title + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 700,
              color:    "var(--text-primary, #e8f0f8)",
              lineHeight: 1.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {currentStep.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999,
                background: color + "18", color,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {ROLE_LABEL[role]}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Ringkas" : "Perluas"}
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", color: "rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {expanded ? <IC.Minimize /> : <IC.Maximize />}
            </button>
            <button
              onClick={() => setMinimized(true)}
              title="Perkecil"
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                fontSize: 16, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              —
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{
          maxHeight: expanded ? 420 : 260,
          overflowY: "auto",
          transition: "max-height 0.3s ease",
        }}>
          <div style={{ padding: "11px 14px" }}>

            {/* Description */}
            <p style={{
              margin: "0 0 10px", fontSize: 12,
              color: "var(--text-secondary, #8ba3bf)",
              lineHeight: 1.65,
            }}>
              {currentStep.description}
            </p>

            {/* Substeps */}
            {currentStep.substeps.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  marginBottom: 6,
                }}>
                  Yang harus dilakukan:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {currentStep.substeps.map((sub, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{
                        width: 17, height: 17, borderRadius: "50%",
                        background:     color + "18", color,
                        display:        "flex", alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8, fontWeight: 900, flexShrink: 0, marginTop: 1,
                      }}>
                        {i + 1}
                      </div>
                      <span style={{
                        fontSize: 12, color: "var(--text-secondary, #8ba3bf)",
                        lineHeight: 1.55, flex: 1,
                      }}>
                        {sub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checkpoint */}
            {currentStep.checkpoint && (
              <div style={{
                display:      "flex", gap: 7, alignItems: "flex-start",
                padding:      "8px 10px",
                background:   "rgba(16,185,129,0.08)",
                border:       "1px solid rgba(16,185,129,0.18)",
                borderRadius: 8, marginBottom: 8,
              }}>
                <span style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }}><IC.Target /></span>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                    Hasil yang diharapkan:
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary, #8ba3bf)", lineHeight: 1.5 }}>
                    {currentStep.checkpoint}
                  </p>
                </div>
              </div>
            )}

            {/* Tips */}
            {currentStep.tips && (
              <div style={{
                display: "flex", gap: 7, alignItems: "flex-start",
                padding: "7px 10px",
                background: color + "0d",
                border: `1px solid ${color}22`,
                borderRadius: 8, marginBottom: 8,
              }}>
                <span style={{ color, flexShrink: 0, marginTop: 1 }}><IC.Info /></span>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary, #8ba3bf)", lineHeight: 1.5 }}>
                  <strong style={{ color }}>Tips: </strong>{currentStep.tips}
                </p>
              </div>
            )}

            {/* Warning */}
            {currentStep.warning && (
              <div style={{
                display: "flex", gap: 7, alignItems: "flex-start",
                padding: "7px 10px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8, marginBottom: 8,
              }}>
                <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }}><IC.Warning /></span>
                <p style={{ margin: 0, fontSize: 11, color: "#f59e0b", lineHeight: 1.5 }}>
                  {currentStep.warning}
                </p>
              </div>
            )}

            {/* Action button — navigate to page */}
            {currentStep.actionRoute && !currentStep.isExternal && (
              <Link href={currentStep.actionRoute} style={{
                display:        "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding:        "8px 12px", marginBottom: 4,
                background:     `linear-gradient(135deg, ${color}, ${color}cc)`,
                color:          "#fff", borderRadius: 8,
                fontSize:       12, fontWeight: 600,
                textDecoration: "none",
                boxShadow:      `0 3px 10px ${color}30`,
              }}>
                {currentStep.action}
                <IC.ChevRight />
              </Link>
            )}

            {/* External link (Google Form) */}
            {currentStep.isExternal && currentStep.externalUrl && (
              
                href={currentStep.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display:        "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding:        "10px 12px", marginBottom: 4,
                  background:     "linear-gradient(135deg,#10b981,#059669)",
                  color:          "#fff", borderRadius: 8,
                  fontSize:       12, fontWeight: 700,
                  textDecoration: "none",
                  boxShadow:      "0 3px 12px rgba(16,185,129,0.4)",
                }}
              >
                {currentStep.action}
                <IC.ExternalLink />
              </a>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div style={{
          padding:      "9px 14px",
          borderTop:    "1px solid rgba(255,255,255,0.06)",
          display:      "flex", alignItems: "center", gap: 7,
        }}>
          {/* Back */}
          <button
            onClick={back}
            disabled={isFirst}
            style={{
              display:    "flex", alignItems: "center", gap: 4,
              padding:    "7px 12px",
              background: "rgba(255,255,255,0.05)",
              border:     "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, color: "rgba(255,255,255,0.5)",
              fontSize:   11, fontWeight: 500,
              cursor:     isFirst ? "not-allowed" : "pointer",
              opacity:    isFirst ? 0.35 : 1,
            }}
          >
            <IC.ChevLeft /> Kembali
          </button>

          {/* Dots progress */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 3 }}>
            {Array.from({ length: Math.min(totalSteps, 10) }).map((_, i) => (
              <div
                key={i}
                onClick={() => {}}
                style={{
                  width:        i === stepIndex ? 14 : 5,
                  height:       5, borderRadius: 999,
                  background:   i < stepIndex
                    ? color
                    : i === stepIndex ? color : "rgba(255,255,255,0.12)",
                  transition:   "all 0.2s",
                }}
              />
            ))}
            {totalSteps > 10 && (
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>
                +{totalSteps - 10}
              </span>
            )}
          </div>

          {/* Skip / Next */}
          {isFinish ? (
            
              href={GFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:        "flex", alignItems: "center", gap: 5,
                padding:        "7px 12px",
                background:     "linear-gradient(135deg,#10b981,#059669)",
                color:          "#fff", borderRadius: 8,
                fontSize:       11, fontWeight: 700,
                textDecoration: "none",
                boxShadow:      "0 3px 10px rgba(16,185,129,0.4)",
              }}
            >
              Isi Kuesioner
              <IC.ExternalLink />
            </a>
          ) : (
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={skip}
                style={{
                  padding:    "7px 10px",
                  background: "transparent",
                  border:     "none",
                  color:      "rgba(255,255,255,0.25)",
                  fontSize:   11, cursor: "pointer",
                }}
              >
                Lewati
              </button>
              <button
                onClick={next}
                style={{
                  display:    "flex", alignItems: "center", gap: 4,
                  padding:    "7px 12px",
                  background: `linear-gradient(135deg,${color},${color}cc)`,
                  color:      "#fff", border: "none", borderRadius: 8,
                  fontSize:   11, fontWeight: 700,
                  cursor:     "pointer",
                  boxShadow:  `0 3px 8px ${color}35`,
                }}
              >
                {isLast ? "Selesai" : "Berikutnya"}
                <IC.ChevRight />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bubbleIn {
          from { transform: translateY(20px) scale(0.94); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bubblePulse {
          0%, 100% { box-shadow: 0 4px 20px ${color}50, 0 0 0 3px ${color}20; }
          50%       { box-shadow: 0 4px 28px ${color}70, 0 0 0 6px ${color}12; }
        }
      `}</style>
    </>
  )
}