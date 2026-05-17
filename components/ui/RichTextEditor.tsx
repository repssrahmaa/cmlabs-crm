"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface RichTextEditorProps {
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
  minHeight?:   number
  label?:       string
}

interface ToolbarBtn {
  cmd:     string
  arg?:    string
  icon:    string
  title:   string
  isBlock?: boolean
}

const TOOLBAR: ToolbarBtn[][] = [
  [
    { cmd: "bold",          icon: "B",    title: "Tebal (Ctrl+B)" },
    { cmd: "italic",        icon: "I",    title: "Miring (Ctrl+I)" },
    { cmd: "underline",     icon: "U",    title: "Garis bawah (Ctrl+U)" },
    { cmd: "strikeThrough", icon: "S",    title: "Coret" },
  ],
  [
    { cmd: "insertUnorderedList", icon: "ul", title: "Daftar bullet", isBlock: true },
    { cmd: "insertOrderedList",   icon: "ol", title: "Daftar nomor",  isBlock: true },
  ],
  [
    { cmd: "formatBlock", arg: "h3",        icon: "H3",  title: "Judul", isBlock: true },
    { cmd: "formatBlock", arg: "blockquote",icon: '"',   title: "Kutipan", isBlock: true },
    { cmd: "removeFormat",                  icon: "Tx",  title: "Hapus format" },
  ],
]

export default function RichTextEditor({
  value, onChange, placeholder = "Tulis di sini...",
  minHeight = 120, label,
}: RichTextEditorProps) {
  const editorRef    = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  // Sync value → innerHTML (hanya saat value berubah dari luar)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  // Cek format aktif di posisi cursor
  const updateActiveFormats = useCallback(() => {
    const active = new Set<string>()
    if (document.queryCommandState("bold"))          active.add("bold")
    if (document.queryCommandState("italic"))        active.add("italic")
    if (document.queryCommandState("underline"))     active.add("underline")
    if (document.queryCommandState("strikeThrough")) active.add("strikeThrough")
    if (document.queryCommandState("insertUnorderedList")) active.add("insertUnorderedList")
    if (document.queryCommandState("insertOrderedList"))   active.add("insertOrderedList")
    setActiveFormats(active)
  }, [])

  const execCmd = useCallback((cmd: string, arg?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, arg)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }, [onChange, updateActiveFormats])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    updateActiveFormats()
  }, [onChange, updateActiveFormats])

  const isEmpty = !value || value === "<br>" || value === ""

  return (
    <div>
      {label && (
        <label style={{
          display:      "block",
          fontSize:     11,
          fontWeight:   700,
          color:        "var(--text-muted)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          {label}
        </label>
      )}

      {/* Toolbar */}
      <div style={{
        display:      "flex",
        gap:          2,
        padding:      "6px 8px",
        background:   "var(--bg-card2)",
        border:       `1px solid ${focused ? "var(--border-focus)" : "var(--border)"}`,
        borderBottom: "none",
        borderRadius: "8px 8px 0 0",
        flexWrap:     "wrap",
        alignItems:   "center",
        transition:   "border-color 0.15s",
      }}>
        {TOOLBAR.map((group, gi) => (
          <div key={gi} style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {gi > 0 && (
              <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
            )}
            {group.map((btn) => {
              const isActive = activeFormats.has(btn.cmd)
              return (
                <button
                  key={btn.cmd + (btn.arg || "")}
                  type="button"
                  title={btn.title}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    execCmd(btn.cmd, btn.arg)
                  }}
                  style={{
                    padding:      "3px 7px",
                    background:   isActive ? "var(--primary)" : "transparent",
                    border:       `1px solid ${isActive ? "var(--primary)" : "transparent"}`,
                    borderRadius: 5,
                    fontSize:     btn.icon.length <= 2 ? 12 : 10,
                    fontWeight:   700,
                    color:        isActive ? "#fff" : "var(--text-secondary)",
                    cursor:       "pointer",
                    fontStyle:    btn.cmd === "italic" ? "italic" : "normal",
                    fontFamily:   ["bold","italic","underline","strikeThrough"].includes(btn.cmd)
                      ? "Georgia, serif" : "inherit",
                    textDecoration: btn.cmd === "underline" ? "underline"
                      : btn.cmd === "strikeThrough" ? "line-through" : "none",
                    minWidth:     26,
                    transition:   "all 0.1s",
                  }}
                >
                  {btn.icon === "ul" ? (
                    <span style={{ fontSize: 11 }}>&#8226;&#8212;</span>
                  ) : btn.icon === "ol" ? (
                    <span style={{ fontSize: 10 }}>1.</span>
                  ) : btn.icon}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ position: "relative" }}>
        {isEmpty && !focused && (
          <div style={{
            position:    "absolute",
            top:         12, left: 12,
            fontSize:    13,
            color:       "var(--text-placeholder)",
            pointerEvents: "none",
            zIndex:      1,
            lineHeight:  1.6,
          }}>
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            minHeight:    minHeight,
            padding:      "12px",
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
            maxHeight:    400,
          }}
        />
      </div>

      {/* Global prose styles untuk editor */}
      <style>{`
        [contenteditable] {
          -webkit-user-modify: read-write;
        }
        [contenteditable] b, [contenteditable] strong {
          font-weight: 700;
          color: var(--text-primary);
        }
        [contenteditable] i, [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable] s {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        [contenteditable] ul {
          padding-left: 20px;
          margin: 4px 0;
          list-style: disc;
        }
        [contenteditable] ol {
          padding-left: 20px;
          margin: 4px 0;
          list-style: decimal;
        }
        [contenteditable] li {
          margin: 2px 0;
          color: var(--text-primary);
        }
        [contenteditable] h3 {
          font-size: 15px;
          font-weight: 700;
          margin: 8px 0 4px;
          color: var(--text-primary);
        }
        [contenteditable] blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 12px;
          margin: 6px 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        [contenteditable]:empty:not(:focus):before {
          content: attr(data-placeholder);
          color: var(--text-placeholder);
        }
      `}</style>
    </div>
  )
}