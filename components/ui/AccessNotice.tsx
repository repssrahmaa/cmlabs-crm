"use client"

import { useState, useEffect } from "react"

interface AccessNoticeProps {
  type:     "readonly" | "own_only" | "no_access"
  role?:    string
  message?: string
  show:     boolean
  onClose?: () => void
  position?: "top" | "bottom"
}

const CONFIG = {
  readonly: {
    icon:    "👁️",
    title:   "Mode Lihat Saja",
    color:   "#7c3aed",
    bg:      "#f5f3ff",
    border:  "#c4b5fd",
  },
  own_only: {
    icon:    "🔒",
    title:   "Akses Terbatas",
    color:   "#d97706",
    bg:      "#fffbeb",
    border:  "#fcd34d",
  },
  no_access: {
    icon:    "🚫",
    title:   "Tidak Ada Akses",
    color:   "#dc2626",
    bg:      "#fef2f2",
    border:  "#fca5a5",
  },
}

// ── Toast Notification ─────────────────────────────────────────
export function AccessToast({
  type,
  message,
  show,
  onClose,
}: AccessNoticeProps) {
  const cfg = CONFIG[type]

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => onClose?.(), 3000)
    return () => clearTimeout(t)
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      style={{
        position:     "fixed",
        bottom:       24,
        right:        24,
        zIndex:       9999,
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        padding:      "14px 18px",
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        borderLeft:   `4px solid ${cfg.color}`,
        borderRadius: 10,
        boxShadow:    "0 8px 24px rgba(0,0,0,0.12)",
        maxWidth:     360,
        animation:    "slideIn 0.3s ease",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color, marginBottom: 2 }}>
          {cfg.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
          {message ?? defaultMessage(type)}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border:     "none",
          cursor:     "pointer",
          color:      "var(--text-muted)",
          fontSize:   16,
          padding:    "0 4px",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Inline Banner ──────────────────────────────────────────────
export function AccessBanner({
  type,
  role,
  message,
}: {
  type:     "readonly" | "own_only" | "no_access"
  role?:    string
  message?: string
}) {
  const cfg = CONFIG[type]

  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          10,
      padding:      "10px 16px",
      background:   cfg.bg,
      border:       `1px solid ${cfg.border}`,
      borderLeft:   `4px solid ${cfg.color}`,
      borderRadius: 8,
      marginBottom: 16,
    }}>
      <span style={{ fontSize: 18 }}>{cfg.icon}</span>
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
          {cfg.title}
          {role && (
            <span style={{
              marginLeft:   8,
              fontSize:     11,
              padding:      "1px 8px",
              borderRadius: 999,
              background:   cfg.color + "20",
              color:        cfg.color,
            }}>
              {role}
            </span>
          )}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
          {message ?? defaultMessage(type)}
        </span>
      </div>
    </div>
  )
}

function defaultMessage(type: string): string {
  if (type === "readonly")  return "Anda hanya dapat melihat data, tidak dapat melakukan perubahan."
  if (type === "own_only")  return "Anda hanya dapat mengubah lead yang ditugaskan kepada Anda."
  return "Anda tidak memiliki akses untuk melakukan tindakan ini."
}

// ── Hook untuk trigger toast ───────────────────────────────────
export function useAccessNotice() {
  const [notice, setNotice] = useState<{
    show:    boolean
    type:    "readonly" | "own_only" | "no_access"
    message?: string
  }>({ show: false, type: "readonly" })

  const showNotice = (
    type:     "readonly" | "own_only" | "no_access",
    message?: string
  ) => {
    setNotice({ show: true, type, message })
  }

  const hideNotice = () => setNotice((n) => ({ ...n, show: false }))

  return { notice, showNotice, hideNotice }
}