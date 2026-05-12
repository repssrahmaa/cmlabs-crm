"use client"

import { useState } from "react"

interface ButtonProps {
  children:    React.ReactNode
  onClick?:    () => void
  type?:       "button" | "submit" | "reset"
  variant?:    "primary" | "ghost" | "danger" | "success" | "warning"
  size?:       "sm" | "md" | "lg"
  icon?:       string
  disabled?:   boolean
  fullWidth?:  boolean
  loading?:    boolean
}

const VARIANT_STYLES = {
  primary: {
    base:  { background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "white", border: "none", boxShadow: "var(--shadow-primary)" },
    hover: { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(75,158,243,0.45)" },
  },
  ghost: {
    base:  { background: "var(--bg-card2)", color: "var(--text-secondary)", border: "1px solid var(--border)" },
    hover: { background: "var(--bg-hover)", borderColor: "var(--border-strong)", color: "var(--text-primary)" },
  },
  danger: {
    base:  { background: "var(--danger-pale)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" },
    hover: { background: "var(--danger)", color: "white", borderColor: "transparent" },
  },
  success: {
    base:  { background: "var(--success-pale)", color: "var(--success)", border: "1px solid rgba(16,185,129,0.2)" },
    hover: { background: "var(--success)", color: "white", borderColor: "transparent" },
  },
  warning: {
    base:  { background: "var(--warning-pale)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.2)" },
    hover: { background: "var(--warning)", color: "white", borderColor: "transparent" },
  },
}

const SIZE_STYLES = {
  sm: { padding: "5px 12px", fontSize: 11, borderRadius: 8, gap: 5 },
  md: { padding: "8px 16px", fontSize: 13, borderRadius: 10, gap: 6 },
  lg: { padding: "12px 22px", fontSize: 14, borderRadius: 12, gap: 8 },
}

export default function Button({
  children, onClick, type = "button",
  variant = "primary", size = "md",
  icon, disabled, fullWidth, loading,
}: ButtonProps) {
  const [hov, setHov] = useState(false)
  const vs = VARIANT_STYLES[variant]
  const ss = SIZE_STYLES[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            ss.gap,
        padding:        ss.padding,
        fontSize:       ss.fontSize,
        fontWeight:     600,
        borderRadius:   ss.borderRadius,
        cursor:         disabled || loading ? "not-allowed" : "pointer",
        opacity:        disabled ? 0.5 : 1,
        transition:     "all 0.2s",
        width:          fullWidth ? "100%" : "auto",
        ...vs.base,
        ...(hov && !disabled && !loading ? vs.hover : {}),
      }}
    >
      {loading ? (
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "currentColor", animation: "spin 0.7s linear infinite" }} />
      ) : icon ? (
        <span style={{ fontSize: Number(ss.fontSize) + 2 }}>{icon}</span>
      ) : null}
      {children}
    </button>
  )
}