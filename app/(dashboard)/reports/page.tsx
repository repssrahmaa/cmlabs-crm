"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRoleGuard }        from "@/hooks/useRoleGuard"
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard"
import { STATUS_LABEL, STATUS_COLOR } from "@/types/lead"

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

// ── SVG Icons ─────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const SendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

// ── Document Detail Page ───────────────────────────────────────
function DocumentDetail({
  doc,
  onBack,
  onUpdate,
  onDelete,
}: {
  doc: any
  onBack: () => void
  onUpdate: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState("")

  const [resolvedContent, setResolvedContent] = useState<any>(doc.content ?? {})

  useEffect(() => {
    async function loadContent() {
      if (!resolvedContent || Object.keys(resolvedContent).length === 0) {
        const { generateDocumentNumber, buildDefaultContent } =
          await import("@/lib/services/documentGenerator")
        const number  = generateDocumentNumber(doc.type)
        const content = buildDefaultContent(doc.type, doc.lead ?? {}, number)
        setResolvedContent(content)
      }
    }
    loadContent()
  }, [doc])

  const STATUS_CONFIG = {
    DRAFT:     { label: "Draft",     color: "#f59e0b", bg: "var(--warning-pale)"  },
    FINALIZED: { label: "Finalized", color: "#3b82f6", bg: "var(--primary-pale)"  },
    SENT:      { label: "Terkirim",  color: "#10b981", bg: "var(--success-pale)"  },
  } as Record<string, { label: string; color: string; bg: string }>

  const TYPE_LABEL: Record<string, string> = {
    INVOICE: "Invoice",
    SPK:     "Surat Perintah Kerja",
    MOU:     "Memorandum of Understanding",
    OTHER:   "Dokumen",
  }

  const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.DRAFT

  async function handleFinalize() {
    if (doc.status !== "DRAFT") return
    setUpdating(true); setError("")
    try { await onUpdate(doc.id, { status: "FINALIZED" }) }
    catch (err: any) { setError(err.message) }
    finally { setUpdating(false) }
  }

  async function handleMarkSent() {
    if (doc.status === "SENT") return
    setUpdating(true); setError("")
    try { await onUpdate(doc.id, { status: "SENT" }) }
    catch (err: any) { setError(err.message) }
    finally { setUpdating(false) }
  }

  async function handleDelete() {
    if (!confirm("Hapus dokumen ini secara permanen?")) return
    setDeleting(true)
    try { await onDelete(doc.id); onBack() }
    catch (err: any) { setError(err.message); setDeleting(false) }
  }

  async function handleDownload() {
    try {
      const { generateDocxDocument, generateDocumentNumber, buildDefaultContent } =
        await import("@/lib/services/documentGenerator")
      const number  = resolvedContent?.documentNumber ?? generateDocumentNumber(doc.type)
      const content = resolvedContent ?? buildDefaultContent(doc.type, doc.lead ?? {}, number)
      await generateDocxDocument({
        type: doc.type, title: doc.title, number,
        date: content.date ?? new Date().toLocaleDateString("id-ID"),
        lead: doc.lead ?? {}, content,
      })
    } catch (err: any) {
      alert("Gagal download: " + err.message)
    }
  }

  return (
    <div className="anim-scale" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Back + Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px", background: "var(--bg-card2)",
            border: "1px solid var(--border)", borderRadius: 9,
            color: "var(--text-secondary)", fontSize: 13, fontWeight: 500,
            cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.color = "var(--text-secondary)" }}
        >
          <BackIcon /> Kembali
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{doc.title}</h2>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            {TYPE_LABEL[doc.type] ?? doc.type}
            {resolvedContent?.documentNumber ? ` — No. ${resolvedContent.documentNumber}` : ""}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "var(--danger-pale)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

        {/* Left: Detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-pale)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileIcon />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Informasi Dokumen</h3>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Detail klien dan transaksi</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              {[
                { l: "Nama Klien",  v: doc.lead?.clientName    ?? "-" },
                { l: "Perusahaan",  v: doc.lead?.clientCompany ?? "-" },
                { l: "Email Klien", v: doc.lead?.clientEmail   ?? "-" },
                { l: "Telepon",     v: doc.lead?.clientPhone   ?? "-" },
                { l: "Nilai Deal",  v: doc.lead?.value ? formatRp(Number(doc.lead.value)) : "-" },
                { l: "PIC Sales",   v: doc.lead?.assignedTo?.name ?? "-" },
              ].map((r) => (
                <div key={r.l}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{r.l}</div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Status Card */}
          <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "18px", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Status Dokumen</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { key: "DRAFT",     label: "Draft",     desc: "Dokumen dibuat"    },
                { key: "FINALIZED", label: "Finalized", desc: "Siap dikirim"      },
                { key: "SENT",      label: "Terkirim",  desc: "Dikirim ke klien"  },
              ].map((step, i) => {
                const order      = ["DRAFT","FINALIZED","SENT"]
                const currentIdx = order.indexOf(doc.status)
                const stepIdx    = order.indexOf(step.key)
                const isDone     = stepIdx <= currentIdx
                const isCurrent  = stepIdx === currentIdx
                const c          = STATUS_CONFIG[step.key]?.color ?? "#94a3b8"
                return (
                  <div key={step.key} style={{ display: "flex", gap: 12, paddingBottom: i < 2 ? 16 : 0, position: "relative" }}>
                    {i < 2 && (
                      <div style={{ position: "absolute", left: 15, top: 30, width: 2, height: "calc(100% - 16px)", background: isDone ? c : "var(--border)", transition: "background 0.3s" }} />
                    )}
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: isDone ? c + "20" : "var(--bg-card2)", border: `2px solid ${isDone ? c : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", boxShadow: isCurrent ? `0 0 0 4px ${c}20` : "none" }}>
                      {isDone
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isDone ? 700 : 500, color: isDone ? c : "var(--text-muted)" }}>{step.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{step.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "18px", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Tindakan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={handleDownload}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-primary)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(59,130,246,0.4)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-primary)" }}
              >
                <DownloadIcon /> Download .docx
              </button>

              {doc.status === "DRAFT" && (
                <button onClick={handleFinalize} disabled={updating}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: updating ? "var(--border)" : "rgba(59,130,246,0.1)", color: updating ? "var(--text-muted)" : "var(--primary)", border: `1px solid ${updating ? "var(--border)" : "rgba(59,130,246,0.3)"}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: updating ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { if (!updating) { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff" } }}
                  onMouseLeave={(e) => { if (!updating) { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.color = "var(--primary)" } }}
                >
                  <CheckIcon /> {updating ? "Memproses..." : "Finalisasi Dokumen"}
                </button>
              )}

              {doc.status === "FINALIZED" && (
                <button onClick={handleMarkSent} disabled={updating}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: updating ? "var(--border)" : "rgba(16,185,129,0.1)", color: updating ? "var(--text-muted)" : "var(--success)", border: `1px solid ${updating ? "var(--border)" : "rgba(16,185,129,0.3)"}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: updating ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { if (!updating) { e.currentTarget.style.background = "var(--success)"; e.currentTarget.style.color = "#fff" } }}
                  onMouseLeave={(e) => { if (!updating) { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; e.currentTarget.style.color = "var(--success)" } }}
                >
                  <SendIcon /> {updating ? "Memproses..." : "Tandai Sudah Dikirim"}
                </button>
              )}

              {doc.status === "SENT" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, fontSize: 13, color: "var(--success)", fontWeight: 500 }}>
                  <CheckIcon /> Dokumen sudah dikirim ke klien
                </div>
              )}

              <button onClick={handleDelete} disabled={deleting}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: deleting ? "var(--border)" : "var(--danger-pale)", color: deleting ? "var(--text-muted)" : "var(--danger)", border: `1px solid ${deleting ? "var(--border)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { if (!deleting) { e.currentTarget.style.background = "var(--danger)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--danger)" } }}
                onMouseLeave={(e) => { if (!deleting) { e.currentTarget.style.background = "var(--danger-pale)"; e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)" } }}
              >
                <TrashIcon /> {deleting ? "Menghapus..." : "Hapus Dokumen"}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div style={{ background: "var(--bg-card2)", borderRadius: 14, padding: "14px 16px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { l: "No. Dokumen", v: resolvedContent?.documentNumber ?? "-" },
                { l: "Tipe",        v: doc.type },
                { l: "Lead",        v: doc.lead?.title ?? "-" },
                { l: "Dibuat",      v: new Date(doc.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
              ].map((r) => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{r.l}</span>
                  <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 600, textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .doc-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

// ── Document List Item ─────────────────────────────────────────
function DocListItem({ doc, onClick }: { doc: any; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const SC: Record<string, { color: string; bg: string }> = {
    DRAFT:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
    FINALIZED: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
    SENT:      { color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  }
  const sc = SC[doc.status] ?? SC.DRAFT

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px",
        background: hov ? "var(--bg-hover)" : "var(--bg-card)",
        borderRadius: 12,
        border: `1px solid ${hov ? "var(--primary)" : "var(--border)"}`,
        cursor: "pointer", transition: "all 0.18s",
        transform: hov ? "translateX(3px)" : "none",
        boxShadow: hov ? "var(--shadow-sm)" : "var(--shadow-xs)",
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", color: sc.color }}>
        <FileIcon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.title}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30`, flexShrink: 0 }}>
            {doc.status}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {doc.type} · {doc.lead?.clientName ?? "-"}{doc.lead?.clientCompany ? ` — ${doc.lead.clientCompany}` : ""}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: hov ? 1 : 0.4, transition: "opacity 0.2s", flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  )
}

// ── Create Document Modal ──────────────────────────────────────
function CreateDocModal({ leads, onSubmit, onClose }: {
  leads:    any[]
  onSubmit: (d: any) => Promise<void>
  onClose:  () => void
}) {
  const [leadId,     setLeadId]     = useState("")
  const [leadSearch, setLeadSearch] = useState("")
  const [dropOpen,   setDropOpen]   = useState(false)
  const [type,       setType]       = useState("INVOICE")
  const [title,      setTitle]      = useState("")
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState("")
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filteredLeads = useMemo(() =>
    leads.filter((l) => {
      const q = leadSearch.toLowerCase()
      return l.title?.toLowerCase().includes(q) || l.clientName?.toLowerCase().includes(q) || l.clientCompany?.toLowerCase().includes(q)
    }),
    [leads, leadSearch]
  )

  const selectedLead = leads.find((l) => l.id === leadId)
  function selectLead(l: any) { setLeadId(l.id); setLeadSearch(""); setDropOpen(false) }
  function clearLead()        { setLeadId(""); setLeadSearch("") }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !title) { setError("Lead dan judul wajib diisi"); return }
    setLoading(true); setError("")
    try {
      const { generateDocumentNumber, buildDefaultContent } = await import("@/lib/services/documentGenerator")
      const number  = generateDocumentNumber(type)
      const lead    = leads.find((l) => l.id === leadId)
      const content = buildDefaultContent(type, lead ?? {}, number)
      await onSubmit({ leadId, type, title, content })
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const iStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", boxSizing: "border-box",
    background: "var(--input-bg)", color: "var(--input-text)",
    border: "1px solid var(--input-border)", borderRadius: 9, fontSize: 13,
  }
  const lStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "var(--text-muted)", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.06em",
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: 16, padding: 26, width: "100%", maxWidth: 460, border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)", animation: "scaleIn .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Buat Dokumen Baru</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>&times;</button>
        </div>
        {error && <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--danger-pale)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lStyle}>Lead *</label>
            <div ref={searchRef} style={{ position: "relative" }}>
              {selectedLead ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--input-bg)", border: "1px solid var(--primary)", borderRadius: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedLead.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{selectedLead.clientName}{selectedLead.clientCompany ? ` — ${selectedLead.clientCompany}` : ""}</div>
                  </div>
                  <button type="button" onClick={clearLead} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>&times;</button>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" value={leadSearch} onChange={(e) => { setLeadSearch(e.target.value); setDropOpen(true) }} onFocus={() => setDropOpen(true)} placeholder="Cari lead atau nama klien..." autoComplete="off" style={{ ...iStyle, paddingLeft: 34 }} />
                </div>
              )}
              {dropOpen && !selectedLead && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-xl)", maxHeight: 220, overflowY: "auto" }}>
                  {filteredLeads.length === 0
                    ? <div style={{ padding: "14px", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>Lead tidak ditemukan</div>
                    : filteredLeads.map((l) => (
                      <div key={l.id} onMouseDown={() => selectLead(l)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border-light)", transition: "background 0.12s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{l.clientName}{l.clientCompany ? ` — ${l.clientCompany}` : ""}</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={lStyle}>Tipe Dokumen *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={iStyle}>
              <option value="INVOICE">Invoice</option>
              <option value="SPK">Surat Perintah Kerja (SPK)</option>
              <option value="MOU">Memorandum of Understanding (MOU)</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
          <div>
            <label style={lStyle}>Judul Dokumen *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Contoh: ${type === "INVOICE" ? "Invoice" : type} Q1 2025`} style={iStyle} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: "11px", background: loading ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: loading ? "var(--text-muted)" : "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "var(--shadow-primary)" }}>
            {loading ? "Membuat..." : "Buat Dokumen"}
          </button>
        </form>
        <style>{`@keyframes scaleIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      </div>
    </div>
  )
}

// ── Main Reports Page ──────────────────────────────────────────
export default function ReportsPage() {
  const { canGenerateDocument } = useRoleGuard()
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [docs,        setDocs]        = useState<any[]>([])
  const [leads,       setLeads]       = useState<any[]>([])
  const [loading,     setLoading]     = useState(true)
  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState("")

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [docRes, leadRes] = await Promise.all([fetch("/api/documents"), fetch("/api/leads")])
      const [docData, leadData] = await Promise.all([docRes.json(), leadRes.json()])
      setDocs(Array.isArray(docData) ? docData : [])
      setLeads(Array.isArray(leadData) ? leadData : [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useRealtimeDashboard({ onDashboardRefresh: fetchAll })

  // ── Filtered docs ──
  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return docs
    return docs.filter((d) =>
      d.title?.toLowerCase().includes(q) ||
      d.type?.toLowerCase().includes(q) ||
      d.status?.toLowerCase().includes(q) ||
      d.lead?.clientName?.toLowerCase().includes(q) ||
      d.lead?.clientCompany?.toLowerCase().includes(q) ||
      d.lead?.title?.toLowerCase().includes(q)
    )
  }, [docs, searchQuery])

  async function updateDoc(id: string, data: any) {
    const res = await fetch(`/api/documents/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error((await res.json()).error ?? "Gagal update")
    const updated = await res.json()
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, ...updated } : d))
    if (selectedDoc?.id === id) setSelectedDoc((prev: any) => ({ ...prev, ...updated }))
  }

  async function deleteDoc(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Gagal hapus dokumen")
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  async function createDoc(data: any) {
    const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error ?? "Gagal membuat dokumen")
    setDocs((prev) => [d, ...prev])
    setSelectedDoc(d)
    setShowCreate(false)
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Memuat data...</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {selectedDoc ? (
        <DocumentDetail doc={selectedDoc} onBack={() => setSelectedDoc(null)} onUpdate={updateDoc} onDelete={deleteDoc} />
      ) : (
        <>
          {/* ── Header row ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                Dokumen ({filteredDocs.length}{searchQuery ? ` dari ${docs.length}` : ""})
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                Klik dokumen untuk melihat detail, mengubah status, atau mengunduh
              </p>
            </div>
            {canGenerateDocument && (
              <button
                onClick={() => setShowCreate(true)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-primary)" }}
              >
                <PlusIcon /> Buat Dokumen
              </button>
            )}
          </div>

          {/* ── Search box ── */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex" }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokumen berdasarkan judul, tipe, status, atau nama klien..."
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 14px 10px 38px",
                background: "var(--bg-card)", color: "var(--text-primary)",
                border: "1px solid var(--border)", borderRadius: 10,
                fontSize: 13, outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e)  => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={(e)   => e.currentTarget.style.borderColor = "var(--border)"}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: "0 2px" }}
              >
                &times;
              </button>
            )}
          </div>

          {/* ── Doc list ── */}
          {docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
              Belum ada dokumen. Klik "Buat Dokumen" untuk memulai.
            </div>
          ) : filteredDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px", background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
              Tidak ada dokumen yang cocok dengan "<strong>{searchQuery}</strong>"
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="stagger-children">
              {filteredDocs.map((doc) => (
                <DocListItem key={doc.id} doc={doc} onClick={() => setSelectedDoc(doc)} />
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && <CreateDocModal leads={leads} onSubmit={createDoc} onClose={() => setShowCreate(false)} />}
    </div>
  )
}