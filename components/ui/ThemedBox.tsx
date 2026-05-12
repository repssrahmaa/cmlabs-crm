// Komponen wrapper untuk memastikan semua box pakai CSS vars
"use client"

interface ThemedBoxProps {
  children:    React.ReactNode
  variant?:    "card" | "card2" | "card3" | "input"
  radius?:     number
  padding?:    string | number
  border?:     boolean
  shadow?:     "xs" | "sm" | "md" | "lg" | "none"
  style?:      React.CSSProperties
  className?:  string
  onClick?:    () => void
}

export default function ThemedBox({
  children, variant = "card", radius = 12,
  padding = "20px", border = true, shadow = "sm",
  style, className, onClick,
}: ThemedBoxProps) {
  const bgMap = {
    card:  "var(--bg-card)",
    card2: "var(--bg-card2)",
    card3: "var(--bg-card3)",
    input: "var(--input-bg)",
  }

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background:   bgMap[variant],
        borderRadius: radius,
        padding,
        border:       border ? "1px solid var(--border)" : "none",
        boxShadow:    shadow !== "none" ? `var(--shadow-${shadow})` : "none",
        color:        "var(--text-primary)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}