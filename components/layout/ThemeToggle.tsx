"use client"

import { useTheme } from "@/hooks/useTheme"

interface Props {
  compact?: boolean
}

export default function ThemeToggle({ compact = false }: Props) {
  const { theme, toggle, mounted } = useTheme()
  if (!mounted) return <div style={{ width: 36, height: 20, borderRadius: 999, background: "var(--border)", opacity: 0.5 }} />

  const isDark = theme === "dark"

  if (compact) {
    return (
      <button
        onClick={toggle}
        title={isDark ? "Light mode" : "Dark mode"}
        style={{
          width:        32, height: 32,
          borderRadius: 8,
          background:   "var(--bg-card2)",
          border:       "1px solid var(--border)",
          cursor:       "pointer",
          display:      "flex", alignItems: "center",
          justifyContent: "center",
          fontSize:     15, transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--primary)"
          e.currentTarget.style.background  = "var(--primary-pale)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)"
          e.currentTarget.style.background  = "var(--bg-card2)"
        }}
      >
        {isDark ? "☀️" : "🌙"}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
      style={{
        display:      "flex", alignItems: "center", gap: 8,
        padding:      "6px 12px 6px 8px",
        background:   "var(--bg-card2)",
        border:       "1px solid var(--border)",
        borderRadius: 999,
        cursor:       "pointer",
        fontSize:     12, fontWeight: 600,
        color:        "var(--text-secondary)",
        transition:   "all 0.2s",
        userSelect:   "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)"
        e.currentTarget.style.color       = "var(--primary)"
        e.currentTarget.style.background  = "var(--primary-pale)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)"
        e.currentTarget.style.color       = "var(--text-secondary)"
        e.currentTarget.style.background  = "var(--bg-card2)"
      }}
    >
      {/* Track */}
      <div style={{
        position:   "relative",
        width:       38, height: 21,
        borderRadius: 999,
        background:  isDark
          ? "linear-gradient(135deg, #1e3a5f, #4B9EF3)"
          : "linear-gradient(135deg, #fbbf24, #f97316)",
        transition:  "background 0.4s",
        flexShrink:  0,
      }}>
        {/* Stars (dark) or Sun rays (light) */}
        {isDark ? (
          <>
            <div style={{ position:"absolute", top:4,  left:6,  width:2, height:2, borderRadius:"50%", background:"rgba(255,255,255,0.8)" }} />
            <div style={{ position:"absolute", top:8,  left:10, width:1.5, height:1.5, borderRadius:"50%", background:"rgba(255,255,255,0.6)" }} />
            <div style={{ position:"absolute", top:5,  left:13, width:1, height:1, borderRadius:"50%", background:"rgba(255,255,255,0.5)" }} />
          </>
        ) : (
          <div style={{ position:"absolute", top:"50%", left:6, transform:"translateY(-50%)", fontSize:8, color:"rgba(255,255,255,0.9)", lineHeight:1 }}>
            ✦
          </div>
        )}
        {/* Thumb */}
        <div style={{
          position:     "absolute",
          top:          2.5,
          left:         isDark ? 19 : 2.5,
          width:        16, height: 16,
          borderRadius: "50%",
          background:   "#fff",
          boxShadow:    "0 1px 4px rgba(0,0,0,0.35)",
          transition:   "left 0.35s cubic-bezier(0.4,0,0.2,1)",
          display:      "flex", alignItems: "center",
          justifyContent: "center",
          fontSize:     8,
        }}>
          {isDark ? "🌙" : "☀️"}
        </div>
      </div>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  )
}