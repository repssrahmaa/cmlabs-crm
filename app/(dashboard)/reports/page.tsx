"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRoleGuard }       from "@/hooks/useRoleGuard"
import { useRealtimeDashboard }from "@/hooks/useRealtimeDashboard"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { STATUS_LABEL, STATUS_COLOR } from "@/types/lead"

const MONTHS   = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
const CUR_YEAR = new Date().getFullYear()
const YEARS    = Array.from({ length: 5 }, (_, i) => String(CUR_YEAR - i))

function formatRp(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

// ── SVG Icons (no emoji) ───────────────────────────────────────
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

// ── CTooltip ───────────────────────────────────────────────────
function CTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-lg)", minWidth: 130,
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color ?? p.fill }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.name}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Section Filter ─────────────────────────────────────────────
function SectionFilter({ year, month, onYear, onMonth }: {
  year: string; month: string;
  onYear: (v: string) => void; onMonth: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select value={year} onChange={(e) => onYear(e.target.value)} style={{
        padding: "4px 9px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, cursor: "pointer",
      }}>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => onMonth(e.target.value)} style={{
        padding: "4px 9px", background: "var(--bg-card2)", color: "var(--text-secondary)",
        border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, cursor: "pointer",
      }}>
        <option value="all">Semua Bulan</option>
        {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
      </select>
    </div>
  )
}

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
  const [error, setError] = useState("")

  // ── Resolved document content ─────────────────────────────
// ── Resolved document content ─────────────────────────────
const [resolvedContent, setResolvedContent] = useState<any>(
  doc.content ?? {}
)

useEffect(() => {
  async function loadContent() {
    if (!resolvedContent || Object.keys(resolvedContent).length === 0) {
      const {
        generateDocumentNumber,
        buildDefaultContent,
      } = await import("@/lib/services/documentGenerator")

      const number = generateDocumentNumber(doc.type)

      const content = buildDefaultContent(
        doc.type,
        doc.lead ?? {},
        number
      )

      setResolvedContent(content)
    } else {
      setResolvedContent(resolvedContent)
    }
  }

  loadContent()
}, [doc])

  const STATUS_CONFIG = {
    DRAFT: {
      label: "Draft",
      color: "#f59e0b",
      bg: "var(--warning-pale)",
    },
    FINALIZED: {
      label: "Finalized",
      color: "#3b82f6",
      bg: "var(--primary-pale)",
    },
    SENT: {
      label: "Terkirim",
      color: "#10b981",
      bg: "var(--success-pale)",
    },
  } as Record<
    string,
    { label: string; color: string; bg: string }
  >

  const TYPE_LABEL: Record<string, string> = {
    INVOICE: "Invoice",
    SPK: "Surat Perintah Kerja",
    MOU: "Memorandum of Understanding",
    OTHER: "Dokumen",
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
            padding: "8px 14px",
            background: "var(--bg-card2)",
            border: "1px solid var(--border)",
            borderRadius: 9, color: "var(--text-secondary)",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            flexShrink: 0, transition: "all 0.15s",
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
          <BackIcon /> Kembali
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              {doc.title}
            </h2>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
              background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.color}30`,
            }}>
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

          {/* Client & Lead Info */}
          <div style={{
            background: "var(--bg-card)", borderRadius: 14, padding: "20px",
            border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "var(--primary-pale)", color: "var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileIcon />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Informasi Dokumen</h3>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>Detail klien dan transaksi</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
              {[
                { l: "Nama Klien",    v: doc.lead?.clientName     ?? "-" },
                { l: "Perusahaan",    v: doc.lead?.clientCompany  ?? "-" },
                { l: "Email Klien",   v: doc.lead?.clientEmail    ?? "-" },
                { l: "Telepon",       v: doc.lead?.clientPhone    ?? "-" },
                { l: "Nilai Deal",    v: doc.lead?.value ? formatRp(Number(doc.lead.value)) : "-" },
                { l: "PIC Sales",     v: doc.lead?.assignedTo?.name ?? "-" },
              ].map((r) => (
                <div key={r.l}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                    {r.l}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>
          </div>

        {/* Right: Actions Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Status Card */}
          <div style={{
            background: "var(--bg-card)", borderRadius: 14, padding: "18px",
            border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)",
          }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Status Dokumen</h3>

            {/* Status steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { key: "DRAFT",     label: "Draft",     desc: "Dokumen dibuat" },
                { key: "FINALIZED", label: "Finalized", desc: "Siap dikirim" },
                { key: "SENT",      label: "Terkirim",  desc: "Dikirim ke klien" },
              ].map((step, i) => {
                const statusOrder = ["DRAFT","FINALIZED","SENT"]
                const currentIdx  = statusOrder.indexOf(doc.status)
                const stepIdx     = statusOrder.indexOf(step.key)
                const isDone      = stepIdx <= currentIdx
                const isCurrent   = stepIdx === currentIdx
                const c           = STATUS_CONFIG[step.key]?.color ?? "#94a3b8"

                return (
                  <div key={step.key} style={{ display: "flex", gap: 12, paddingBottom: i < 2 ? 16 : 0, position: "relative" }}>
                    {/* Connector line */}
                    {i < 2 && (
                      <div style={{
                        position: "absolute", left: 15, top: 30,
                        width: 2, height: "calc(100% - 16px)",
                        background: isDone ? c : "var(--border)",
                        transition: "background 0.3s",
                      }} />
                    )}
                    {/* Step indicator */}
                    <div style={{
                      width:  30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: isDone ? c + "20" : "var(--bg-card2)",
                      border: `2px solid ${isDone ? c : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.3s",
                      boxShadow: isCurrent ? `0 0 0 4px ${c}20` : "none",
                    }}>
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isDone ? 700 : 500, color: isDone ? c : "var(--text-muted)" }}>
                        {step.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{step.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            background: "var(--bg-card)", borderRadius: 14, padding: "18px",
            border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)",
          }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Tindakan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {/* Download */}
              <button
                onClick={handleDownload}
                style={{
                  display:       "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding:       "11px",
                  background:    "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  color:         "#fff", border: "none", borderRadius: 10,
                  fontSize:      13, fontWeight: 600, cursor: "pointer",
                  boxShadow:     "var(--shadow-primary)",
                  transition:    "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(59,130,246,0.4)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-primary)" }}
              >
                <DownloadIcon /> Download .docx
              </button>

              {/* Finalize */}
              {doc.status === "DRAFT" && (
                <button
                  onClick={handleFinalize}
                  disabled={updating}
                  style={{
                    display:    "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding:    "11px",
                    background: updating ? "var(--border)" : "rgba(59,130,246,0.1)",
                    color:      updating ? "var(--text-muted)" : "var(--primary)",
                    border:     `1px solid ${updating ? "var(--border)" : "rgba(59,130,246,0.3)"}`,
                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor:     updating ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!updating) {
                      e.currentTarget.style.background = "var(--primary)"
                      e.currentTarget.style.color      = "#fff"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!updating) {
                      e.currentTarget.style.background = "rgba(59,130,246,0.1)"
                      e.currentTarget.style.color      = "var(--primary)"
                    }
                  }}
                >
                  <CheckIcon /> {updating ? "Memproses..." : "Finalisasi Dokumen"}
                </button>
              )}

              {/* Mark Sent */}
              {doc.status === "FINALIZED" && (
                <button
                  onClick={handleMarkSent}
                  disabled={updating}
                  style={{
                    display:    "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding:    "11px",
                    background: updating ? "var(--border)" : "rgba(16,185,129,0.1)",
                    color:      updating ? "var(--text-muted)" : "var(--success)",
                    border:     `1px solid ${updating ? "var(--border)" : "rgba(16,185,129,0.3)"}`,
                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor:     updating ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!updating) {
                      e.currentTarget.style.background = "var(--success)"
                      e.currentTarget.style.color      = "#fff"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!updating) {
                      e.currentTarget.style.background = "rgba(16,185,129,0.1)"
                      e.currentTarget.style.color      = "var(--success)"
                    }
                  }}
                >
                  <SendIcon /> {updating ? "Memproses..." : "Tandai Sudah Dikirim"}
                </button>
              )}

              {/* Status info if SENT */}
              {doc.status === "SENT" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "11px 14px",
                  background: "rgba(16,185,129,0.08)",
                  border:     "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 10,
                  fontSize:   13, color: "var(--success)", fontWeight: 500,
                }}>
                  <CheckIcon /> Dokumen sudah dikirim ke klien
                </div>
              )}

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  display:    "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding:    "11px",
                  background: deleting ? "var(--border)" : "var(--danger-pale)",
                  color:      deleting ? "var(--text-muted)" : "var(--danger)",
                  border:     `1px solid ${deleting ? "var(--border)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor:     deleting ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = "var(--danger)"
                    e.currentTarget.style.color      = "#fff"
                    e.currentTarget.style.borderColor = "var(--danger)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background  = "var(--danger-pale)"
                    e.currentTarget.style.color       = "var(--danger)"
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"
                  }
                }}
              >
                <TrashIcon /> {deleting ? "Menghapus..." : "Hapus Dokumen"}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div style={{
            background: "var(--bg-card2)", borderRadius: 14, padding: "14px 16px",
            border: "1px solid var(--border)",
          }}>
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

      {/* Mobile: stack columns */}
      <style>{`
        @media (max-width: 768px) {
          .doc-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
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
        display:        "flex", alignItems: "center", gap: 14,
        padding:        "14px 18px",
        background:     hov ? "var(--bg-hover)" : "var(--bg-card)",
        borderRadius:   12,
        border:         `1px solid ${hov ? "var(--primary)" : "var(--border)"}`,
        cursor:         "pointer",
        transition:     "all 0.18s",
        transform:      hov ? "translateX(3px)" : "none",
        boxShadow:      hov ? "var(--shadow-sm)" : "var(--shadow-xs)",
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: sc.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: sc.color,
      }}>
        <FileIcon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {doc.title}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
            background: sc.bg, color: sc.color,
            border: `1px solid ${sc.color}30`,
            flexShrink: 0,
          }}>
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
  const [leadId,  setLeadId]  = useState("")
  const [type,    setType]    = useState("INVOICE")
  const [title,   setTitle]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !title) { setError("Lead dan judul wajib diisi"); return }
    setLoading(true); setError("")
    try {
      const { generateDocumentNumber, buildDefaultContent } =
        await import("@/lib/services/documentGenerator")
      const number  = generateDocumentNumber(type)
      const lead    = leads.find((l) => l.id === leadId)
      const content = buildDefaultContent(type, lead ?? {}, number)
      await onSubmit({ leadId, type, title, content })
    } catch (err: any) { setError(err.message)
    } finally { setLoading(false) }
  }

  const iStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", boxSizing: "border-box",
    background: "var(--input-bg)", color: "var(--input-text)",
    border: "1px solid var(--input-border)", borderRadius: 9,
    fontSize: 13,
  }
  const lStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "var(--text-muted)", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.06em",
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-card)", borderRadius: 16, padding: 26,
        width: "100%", maxWidth: 460,
        border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)",
        animation: "scaleIn .2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Buat Dokumen Baru</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>&times;</button>
        </div>
        {error && <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--danger-pale)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lStyle}>Lead *</label>
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)} required style={iStyle}>
              <option value="">-- Pilih Lead --</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.title} — {l.clientName}</option>)}
            </select>
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
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={`Contoh: ${type === "INVOICE" ? "Invoice" : type} Q1 2025`}
              style={iStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            padding: "11px",
            background: loading ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: loading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "var(--shadow-primary)",
          }}>
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
  const { canGenerateDocument }     = useRoleGuard()
  const [activeTab,  setActiveTab]  = useState<"report"|"document">("report")
  const [selectedDoc,setSelectedDoc]= useState<any>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [docs,       setDocs]       = useState<any[]>([])
  const [leads,      setLeads]      = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [rYear,  setRYear]  = useState(String(CUR_YEAR))
  const [rMonth, setRMonth] = useState("all")

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      const [repRes, docRes, leadRes] = await Promise.all([
        fetch(`/api/reports?year=${rYear}&month=${rMonth}`, { cache: "no-store" }),
        fetch("/api/documents"),
        fetch("/api/leads"),
      ])
      const [rep, docData, leadData] = await Promise.all([repRes.json(), docRes.json(), leadRes.json()])
      setReportData(rep)
      setDocs(Array.isArray(docData) ? docData : [])
      setLeads(Array.isArray(leadData) ? leadData : [])
    } catch {}
    finally { setLoading(false) }
  }, [rYear, rMonth])

  useEffect(() => { fetchAll() }, [fetchAll])
  useRealtimeDashboard({ onDashboardRefresh: fetchAll })

  async function updateDoc(id: string, data: any) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
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
    const res = await fetch("/api/documents", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error ?? "Gagal membuat dokumen")
    setDocs((prev) => [d, ...prev])
    setSelectedDoc(d)
    setShowCreate(false)
    setActiveTab("document")
  }

  const salesPerf    = reportData?.salesPerformance ?? []
  const monthly      = reportData?.charts?.monthlyBreakdown ?? []
  const statusData   = (reportData?.charts?.leadsByStatus ?? []).map((d: any) => ({
    name:  STATUS_LABEL[d.status as keyof typeof STATUS_LABEL] ?? d.status,
    value: d.count,
    color: STATUS_COLOR[d.status as keyof typeof STATUS_COLOR] ?? "#94a3b8",
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4, padding: 4,
        background: "var(--bg-card)", borderRadius: 14,
        border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)",
      }}>
        {[
          { k: "report",   l: "Laporan Performa" },
          { k: "document", l: `Dokumen (${docs.length})` },
        ].map((t) => (
          <button key={t.k} onClick={() => { setActiveTab(t.k as any); setSelectedDoc(null) }} style={{
            flex: 1, padding: "10px 16px",
            background: activeTab === t.k ? "var(--primary)" : "transparent",
            border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: activeTab === t.k ? 700 : 500,
            color: activeTab === t.k ? "#fff" : "var(--text-muted)",
            cursor: "pointer", transition: "all 0.2s",
            boxShadow: activeTab === t.k ? "var(--shadow-primary)" : "none",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── REPORT TAB ───────────────────────────────────── */}
      {activeTab === "report" && (
        <>
          {/* Filter */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", background: "var(--bg-card)",
            borderRadius: 12, border: "1px solid var(--border)", flexWrap: "wrap", gap: 10,
          }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Filter Periode Laporan</h3>
            <SectionFilter year={rYear} month={rMonth} onYear={setRYear} onMonth={setRMonth} />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Memuat data...</div>
          ) : (
            <>
              {/* KPI */}
              <div className="grid-4">
                {[
                  { l: "Total Lead",    v: reportData?.summary?.totalLeads   ?? 0, c: "var(--primary)" },
                  { l: "Deal",          v: reportData?.summary?.wonLeads     ?? 0, c: "var(--success)" },
                  { l: "Recycle",       v: reportData?.summary?.lostLeads    ?? 0, c: "var(--danger)"  },
                  { l: "Total Revenue", v: formatRp(reportData?.summary?.totalRevenue ?? 0), c: "var(--purple)" },
                ].map((s) => (
                  <div key={s.l} style={{
                    background: "var(--bg-card)", borderRadius: 14, padding: "18px",
                    border: "1px solid var(--border)", borderTop: `3px solid ${s.c}`, boxShadow: "var(--shadow-xs)",
                  }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.l}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Monthly trend */}
              <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Tren Lead Bulanan</h3>
                <ResponsiveContainer width="100%" height={220} className="chart-md">
                  <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      {[["c","#3b82f6"],["d","#10b981"],["r","#ef4444"]].map(([id,c]) => (
                        <linearGradient key={id} id={`rg${id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={c} stopOpacity={0.22} />
                          <stop offset="95%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                    <Area type="monotone" dataKey="created" name="Lead Masuk" stroke="#3b82f6" strokeWidth={2.5} fill="url(#rgc)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="won"     name="Deal"       stroke="#10b981" strokeWidth={2.5} fill="url(#rgd)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="lost"    name="Recycle"    stroke="#ef4444" strokeWidth={2}   fill="url(#rgr)" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Charts 2-col */}
              <div className="grid-2">
                <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border)" }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Distribusi Status Lead</h3>
                  <ResponsiveContainer width="100%" height={200} className="chart-md">
                    <BarChart data={statusData} margin={{ top: 4, right: 4, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--chart-text)" }} angle={-20} textAnchor="end" axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CTooltip />} />
                      <Bar dataKey="value" name="Lead" radius={[5,5,0,0]} maxBarSize={38}>
                        {statusData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: "var(--bg-card)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border)" }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Deal vs Recycle</h3>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <div style={{ position: "relative", width: 120, height: 120 }}>
                      <PieChart width={120} height={120}>
                        <Pie data={[
                          { name: "Deal",    value: reportData?.summary?.wonLeads   ?? 0, fill: "#10b981" },
                          { name: "Aktif",   value: reportData?.summary?.activeLeads ?? 0, fill: "#3b82f6" },
                          { name: "Recycle", value: reportData?.summary?.lostLeads  ?? 0, fill: "#ef4444" },
                        ]} cx={55} cy={55} innerRadius={36} outerRadius={52}
                          dataKey="value" paddingAngle={3} strokeWidth={0}
                          startAngle={90} endAngle={-270}
                        >
                          <Cell fill="#10b981" /><Cell fill="#3b82f6" /><Cell fill="#ef4444" />
                        </Pie>
                      </PieChart>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{reportData?.summary?.winRate ?? 0}%</div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Win Rate</div>
                      </div>
                    </div>
                  </div>
                  {[
                    { l: "Deal",    v: reportData?.summary?.wonLeads   ?? 0, c: "#10b981" },
                    { l: "Aktif",   v: reportData?.summary?.activeLeads ?? 0, c: "#3b82f6" },
                    { l: "Recycle", v: reportData?.summary?.lostLeads  ?? 0, c: "#ef4444" },
                  ].map((s) => (
                    <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.l}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Performance Table */}
              <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-xs)" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-light)" }}>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Performa Sales</h3>
                </div>
                <div className="table-scroll">
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                    <thead>
                      <tr>
                        {["Rank","Nama","Total Lead","Deal","Recycle","Win Rate","Revenue",""].map((h) => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", background: "var(--table-head)", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {salesPerf.map((s: any, i: number) => (
                        <tr key={s.name} style={{ borderTop: "1px solid var(--table-border)", background: i % 2 === 0 ? "var(--table-odd)" : "var(--table-even)", cursor: "pointer", transition: "background .1s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--table-hover)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "var(--table-odd)" : "var(--table-even)"}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: ["#d97706","#94a3b8","#b45309","#6366f1","#3b82f6"][i] ?? "var(--text-muted)" }}>
                              #{i + 1}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>{s.total}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{s.won}</td>
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>{s.lost}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ flex: 1, height: 5, background: "var(--bg-card2)", borderRadius: 999, minWidth: 50, overflow: "hidden" }}>
                                <div className="anim-bar" style={{
                                  height: "100%", borderRadius: 999, width: `${s.winRate}%`,
                                  background: s.winRate >= 60 ? "var(--success)" : s.winRate >= 30 ? "var(--warning)" : "var(--danger)",
                                }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{s.winRate}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>{formatRp(s.revenue)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontSize: 11, color: "var(--primary)" }}>Detail</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── DOCUMENT TAB ─────────────────────────────────── */}
      {activeTab === "document" && (
        <>
          {/* Document detail view */}
          {selectedDoc ? (
            <DocumentDetail
              doc={selectedDoc}
              onBack={() => setSelectedDoc(null)}
              onUpdate={updateDoc}
              onDelete={deleteDoc}
            />
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    Dokumen ({docs.length})
                  </h3>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                    Klik dokumen untuk melihat detail, mengubah status, atau mengunduh
                  </p>
                </div>
                {canGenerateDocument && (
                  <button
                    onClick={() => setShowCreate(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 18px",
                      background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                      color: "#fff", border: "none", borderRadius: 9,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      boxShadow: "var(--shadow-primary)",
                    }}
                  >
                    <PlusIcon /> Buat Dokumen
                  </button>
                )}
              </div>

              {/* Doc list */}
              {docs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
                  Belum ada dokumen. Klik "Buat Dokumen" untuk memulai.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="stagger-children">
                  {docs.map((doc) => (
                    <DocListItem key={doc.id} doc={doc} onClick={() => setSelectedDoc(doc)} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {showCreate && (
        <CreateDocModal
          leads={leads}
          onSubmit={createDoc}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

