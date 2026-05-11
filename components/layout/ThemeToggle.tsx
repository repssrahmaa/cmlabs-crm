"use client"

import { useTheme } from "@/hooks/useTheme"

export default function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme()

  if (!mounted) return (
    <div style={{ width: 44, height: 24, borderRadius: 999, background: "var(--border)" }} />
  )

  const isDark = theme === "dark"

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            8,
        padding:        "6px 12px",
        background:     isDark ? "var(--bg-card2)" : "var(--bg-hover)",
        border:         "1px solid var(--border)",
        borderRadius:   999,
        cursor:         "pointer",
        fontSize:       12,
        fontWeight:     600,
        color:          "var(--text-secondary)",
        transition:     "all 0.2s",
        userSelect:     "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)"
        e.currentTarget.style.color       = "var(--primary)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)"
        e.currentTarget.style.color       = "var(--text-secondary)"
      }}
    >
      {/* Track */}
      <div style={{
        position:       "relative",
        width:          36, height: 20,
        borderRadius:   999,
        background:     isDark
          ? "linear-gradient(135deg, #4B9EF3, #1a6fd4)"
          : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
        transition:     "background 0.3s",
        flexShrink:     0,
      }}>
        {/* Thumb */}
        <div style={{
          position:       "absolute",
          top:            2,
          left:           isDark ? 18 : 2,
          width:          16, height: 16,
          borderRadius:   "50%",
          background:     "#fff",
          boxShadow:      "0 1px 4px rgba(0,0,0,0.3)",
          transition:     "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       9,
        }}>
          {isDark ? "🌙" : "☀️"}
        </div>
      </div>
      <span style={{ fontSize: 11 }}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  )
}