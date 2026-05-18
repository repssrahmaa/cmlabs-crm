"use client"

import { useState, useRef, useCallback, useEffect } from "react"

// ── SVG Toolbar Icons ──────────────────────────────────────────
const Icons = {
  Bold: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
    </svg>
  ),
  Italic: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4"/>
      <line x1="14" y1="20" x2="5" y2="20"/>
      <line x1="15" y1="4" x2="9" y2="20"/>
    </svg>
  ),
  Underline: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
      <line x1="4" y1="21" x2="20" y2="21"/>
    </svg>
  ),
  Strike: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12"/>
      <path d="M17.5 5.5C17 4 15.5 3 13.5 3H10C7.8 3 6 4.8 6 7c0 1.5.8 2.8 2 3.5"/>
      <path d="M6.5 18.5C7 20 8.5 21 10.5 21H14c2.2 0 4-1.8 4-4 0-1.5-.8-2.8-2-3.5"/>
    </svg>
  ),
  BulletList: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6"  x2="20" y2="6"/>
      <line x1="9" y1="12" x2="20" y2="12"/>
      <line x1="9" y1="18" x2="20" y2="18"/>
      <circle cx="4" cy="6"  r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  ),
  NumberList: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6"  x2="21" y2="6"/>
      <line x1="10" y1="12" x2="21" y2="12"/>
      <line x1="10" y1="18" x2="21" y2="18"/>
      <path d="M4 6h1v4" strokeWidth="2"/>
      <path d="M4 10h2" strokeWidth="2"/>
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeWidth="2"/>
    </svg>
  ),
  Heading: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16M4 6v12M20 6v12"/>
    </svg>
  ),
  Quote: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  ),
  ClearFormat: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/>
      <line x1="18" y1="12" x2="22" y2="16"/><line x1="22" y1="12" x2="18" y2="16"/>
    </svg>
  ),
}

interface ToolbarGroup {
  items: {
    cmd:   string
    arg?:  string
    icon:  React.FC
    title: string
  }[]
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  {
    items: [
      { cmd: "bold",          icon: Icons.Bold,       title: "Tebal (Ctrl+B)" },
      { cmd: "italic",        icon: Icons.Italic,     title: "Miring (Ctrl+I)" },
      { cmd: "underline",     icon: Icons.Underline,  title: "Garis bawah (Ctrl+U)" },
      { cmd: "strikeThrough", icon: Icons.Strike,     title: "Coret" },
    ],
  },
  {
    items: [
      { cmd: "insertUnorderedList", icon: Icons.BulletList,  title: "Daftar bullet" },
      { cmd: "insertOrderedList",   icon: Icons.NumberList,  title: "Daftar nomor"  },
    ],
  },
  {
    items: [
      { cmd: "formatBlock",  arg: "h3", icon: Icons.Heading,      title: "Judul"   },
      { cmd: "formatBlock",  arg: "blockquote", icon: Icons.Quote, title: "Kutipan" },
      { cmd: "removeFormat",             icon: Icons.ClearFormat,  title: "Hapus format" },
    ],
  },
]

interface Props {
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  minHeight?:   number
  label?:       string
  required?:    boolean
}

export default function RichTextEditor({
  value, onChange, placeholder = "Tulis di sini...",
  minHeight = 100, label, required,
}: Props) {
  const ref    = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [active,  setActive]  = useState<Set<string>>(new Set())

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ""
    }
  }, [value])

  const updateActive = useCallback(() => {
    const s = new Set<string>()
    if (document.queryCommandState("bold"))               s.add("bold")
    if (document.queryCommandState("italic"))             s.add("italic")
    if (document.queryCommandState("underline"))          s.add("underline")
    if (document.queryCommandState("strikeThrough"))      s.add("strikeThrough")
    if (document.queryCommandState("insertUnorderedList"))s.add("insertUnorderedList")
    if (document.queryCommandState("insertOrderedList"))  s.add("insertOrderedList")
    setActive(s)
  }, [])

  const exec = useCallback((cmd: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(cmd, false, arg)
    if (ref.current) onChange(ref.current.innerHTML)
    updateActive()
  }, [onChange, updateActive])

  const onInput = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML)
    updateActive()
  }, [onChange, updateActive])

  const isEmpty = !value || value === "<br>" || value === ""

  return (
    <div>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 700,
          color: "var(--text-muted)", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {label}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* Toolbar */}
      <div style={{
        display:      "flex",
        gap:          2,
        padding:      "5px 8px",
        background:   "var(--bg-card2)",
        border:       `1px solid ${focused ? "var(--border-focus)" : "var(--border)"}`,
        borderBottom: "none",
        borderRadius: "8px 8px 0 0",
        flexWrap:     "wrap",
        alignItems:   "center",
        transition:   "border-color 0.15s",
      }}>
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {gi > 0 && (
              <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 3px" }} />
            )}
            {group.items.map((item) => {
              const isActive = active.has(item.cmd)
              const Icon     = item.icon
              return (
                <button
                  key={item.cmd + (item.arg ?? "")}
                  type="button"
                  title={item.title}
                  onMouseDown={(e) => { e.preventDefault(); exec(item.cmd, item.arg) }}
                  style={{
                    width:        28, height: 26,
                    display:      "flex", alignItems: "center", justifyContent: "center",
                    background:   isActive ? "var(--primary)" : "transparent",
                    border:       `1px solid ${isActive ? "var(--primary)" : "transparent"}`,
                    borderRadius: 5,
                    color:        isActive ? "#fff" : "var(--text-secondary)",
                    cursor:       "pointer",
                    transition:   "all 0.1s",
                    flexShrink:   0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background   = "var(--bg-card3)"
                      e.currentTarget.style.borderColor  = "var(--border)"
                      e.currentTarget.style.color        = "var(--text-primary)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background   = "transparent"
                      e.currentTarget.style.borderColor  = "transparent"
                      e.currentTarget.style.color        = "var(--text-secondary)"
                    }
                  }}
                >
                  <Icon />
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ position: "relative" }}>
        {isEmpty && !focused && (
          <div style={{
            position: "absolute", top: 10, left: 12,
            fontSize: 13, color: "var(--text-placeholder)",
            pointerEvents: "none", zIndex: 1, lineHeight: 1.6,
          }}>
            {placeholder}
          </div>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={onInput}
          onKeyUp={updateActive}
          onMouseUp={updateActive}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            minHeight:    minHeight,
            padding:      "10px 12px",
            background:   "var(--input-bg)",
            border:       `1px solid ${focused ? "var(--border-focus)" : "var(--border)"}`,
            borderRadius: "0 0 8px 8px",
            fontSize:     13,
            color:        "var(--text-primary)",
            lineHeight:   1.7,
            outline:      "none",
            boxShadow:    focused ? "0 0 0 3px var(--primary-glow)" : "none",
            transition:   "border-color 0.15s, box-shadow 0.15s",
            overflowY:    "auto",
            maxHeight:    360,
          }}
        />
      </div>
    </div>
  )
}