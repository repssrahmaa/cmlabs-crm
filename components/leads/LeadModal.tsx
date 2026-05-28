"use client"

import { useState }       from "react"
import { useRoleGuard }   from "@/hooks/useRoleGuard"
import { useAccessNotice, AccessToast } from "@/components/ui/AccessNotice"
import RichTextEditor     from "@/components/ui/RichTextEditor"
import { FormField, inputStyle, selectStyle } from "@/components/ui/FormField"
import { Lead, KANBAN_COLUMNS, STATUS_COLOR, STATUS_LABEL, PRIORITY_COLOR, PRIORITY_LABEL } from "@/types/lead"
import LeadTimeline from "@/components/leads/LeadTimeline"

interface Props {
  lead:     Lead
  onClose:  () => void
  onUpdate: (id: string, data: Partial<Lead>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// ── SVG Icons ──────────────────────────────────────────────────
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function LeadModal({ lead, onClose, onUpdate, onDelete }: Props) {
  const { role, userId, can, canDeleteLead, is } = useRoleGuard()
  const { notice, showNotice, hideNotice }        = useAccessNotice()

  const [mode,    setMode]    = useState<"view"|"edit">("view")
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(false)
  const [error,   setError]   = useState("")

  const [form, setForm] = useState({
    title:          lead.title,
    clientName:     lead.clientName,
    clientEmail:    lead.clientEmail    ?? "",
    clientPhone:    lead.clientPhone    ?? "",
    clientCompany:  lead.clientCompany  ?? "",
    clientPosition: lead.clientPosition ?? "",
    value:          lead.value ? String(lead.value) : "",
    source:         lead.source         ?? "",
    description:    lead.description    ?? "",
    status:         lead.status,
    priority:       lead.priority,
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const canEdit = can("update", "lead", lead.assignedTo?.id ?? lead.assignedToId)

  function handleEditClick() {
    if (!canEdit) {
      showNotice(
        is("ACCOUNT_EXECUTIVE") ? "own_only" : "readonly",
        is("ACCOUNT_EXECUTIVE")
          ? "Anda hanya dapat mengubah lead yang ditugaskan kepada Anda."
          : "Anda tidak memiliki akses untuk mengubah lead ini."
      )
      return
    }
    setMode("edit")
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      await onUpdate(lead.id, {
        ...form,
        value: form.value ? Number(form.value) : undefined,
      })
      setMode("view")
    } catch (err: any) { setError(err.message ?? "Gagal menyimpan")
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm("Hapus lead ini secara permanen?")) return
    setDeleting(true)
    try { await onDelete(lead.id); onClose()
    } catch (err: any) { setError(err.message ?? "Gagal menghapus")
    } finally { setDeleting(false) }
  }

  const sc = STATUS_COLOR[lead.status] ?? "#94a3b8"
  const sl = STATUS_LABEL[lead.status] ?? lead.status

  return (
    <>
      <div
        onClick={onClose}
        style={{
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 100,

  display: "flex",
  justifyContent: "center",

  overflowY: "auto",
  padding: "24px 16px",

  alignItems: "flex-start",
}}
      >
        <div
          onClick={(e) => e.stopPropagation()}
         className="modal-responsive"
style={{
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  boxShadow: "var(--shadow-xl)",

  width: "100%",
  maxWidth: 920,

  maxHeight: "calc(100vh - 48px)",
  overflowY: "auto",

  padding: 26,

  margin: "auto 0",

  scrollbarWidth: "thin",
}}
        >
          {/* Header */}
          <div
  className="modal-header-responsive"
  style={{ marginBottom:20 }}
>
            <div style={{ flex:1, minWidth:0, marginRight:12 }}>
              {/* Status + Priority badges */}
              <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{
                  fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:999,
                  background:sc+"20", color:sc,
                }}>
                  {sl}
                </span>
                <span style={{
                  fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:999,
                  background:(PRIORITY_COLOR[lead.priority]??"")+20,
                  color: PRIORITY_COLOR[lead.priority] ?? "var(--text-muted)",
                }}>
                  {PRIORITY_LABEL[lead.priority] ?? lead.priority}
                </span>
              </div>
              <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:"var(--text-primary)", lineHeight:1.3 }}>
                {lead.title}
              </h2>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              {canDeleteLead && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Hapus lead"
                  style={{
                    width:32, height:32, borderRadius:8,
                    background:"var(--danger-pale)",
                    border:"1px solid rgba(239,68,68,0.2)",
                    color:"var(--danger)", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}
                >
                  <IconTrash />
                </button>
              )}
              <button
                onClick={handleEditClick}
                title="Edit lead"
                style={{
                  width:32, height:32, borderRadius:8,
                  background: mode==="edit" ? "var(--primary)" : "var(--bg-card2)",
                  border:`1px solid ${mode==="edit" ? "var(--primary)" : "var(--border)"}`,
                  color: mode==="edit" ? "#fff" : "var(--text-secondary)",
                  cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}
              >
                <IconEdit />
              </button>
              <button
                onClick={onClose}
                style={{
                  width:32, height:32, borderRadius:8,
                  background:"var(--bg-card2)", border:"1px solid var(--border)",
                  color:"var(--text-muted)", cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}
              >
                <IconX />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom:16, padding:"10px 14px", background:"var(--danger-pale)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:"var(--danger)" }}>
              {error}
            </div>
          )}

          {/* ── VIEW MODE ─────────────────────────────────── */}
          {mode === "view" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {/* Client Info */}
              <div style={{ background:"var(--bg-card2)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px" }}>
                <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Informasi Klien</p>
                <div className="info-grid">
                  {[
                    { l:"Nama",       v:lead.clientName },
                    { l:"Jabatan",    v:lead.clientPosition ?? "-" },
                    { l:"Email",      v:lead.clientEmail    ?? "-" },
                    { l:"Telepon",    v:lead.clientPhone    ?? "-" },
                    { l:"Perusahaan", v:lead.clientCompany  ?? "-" },
                    { l:"Sumber",     v:lead.source         ?? "-" },
                  ].map((r) => (
                    <div key={r.l}>
                      <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:2, fontWeight:600 }}>{r.l}</div>
                      <div style={{ fontSize:13, color:"var(--text-primary)", fontWeight:500 }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deal Info */}
              <div style={{ background:"var(--bg-card2)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px" }}>
                <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Informasi Deal</p>
                <div className="info-grid">
                  {[
                    { l:"Nilai",    v: lead.value ? `Rp ${Number(lead.value).toLocaleString("id-ID")}` : "-" },
                    { l:"PIC",      v: lead.assignedTo?.name ?? "-" },
                    { l:"Dibuat",   v: lead.createdBy?.name  ?? "-" },
                    { l:"Aktivitas",v: String(lead._count.activities) },
                  ].map((r) => (
                    <div key={r.l}>
                      <div style={{ fontSize:10, color:"var(--text-muted)", marginBottom:2, fontWeight:600 }}>{r.l}</div>
                      <div style={{ fontSize:13, color:"var(--text-primary)", fontWeight:500 }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {lead.description && (
                <div style={{ background:"var(--bg-card2)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px" }}>
                  <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Deskripsi</p>
                  <div
                    style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7 }}
                    dangerouslySetInnerHTML={{ __html: lead.description }}
                  />
                </div>
              )}
              {/* Timeline Aktivitas */}
<div
  style={{
    background: "var(--bg-card2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "14px 16px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: 10,
        fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      Timeline Komunikasi
    </p>

    <span
      style={{
        fontSize: 11,
        color: "var(--text-muted)",
        fontWeight: 500,
      }}
    >
      {lead._count.activities} aktivitas
    </span>
  </div>

  <LeadTimeline
    leadId={lead.id}
    clientEmail={lead.clientEmail}
  />
</div>
            </div>
          )}

          {/* ── EDIT MODE ─────────────────────────────────── */}
          {mode === "edit" && (
            <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <FormField label="Judul" required>
                <input type="text" required value={form.title} onChange={set("title")} style={inputStyle} />
              </FormField>

              <div className="grid-responsive-2">
                <FormField label="Nama Klien" required>
                  <input type="text" required value={form.clientName} onChange={set("clientName")} style={inputStyle} />
                </FormField>
                <FormField label="Jabatan Klien">
                  <input type="text" value={form.clientPosition} onChange={set("clientPosition")} style={inputStyle} />
                </FormField>
              </div>

              <div className="grid-responsive-2">
                <FormField label="Email Klien">
                  <input type="email" value={form.clientEmail} onChange={set("clientEmail")} style={inputStyle} />
                </FormField>
                <FormField label="Telepon">
                  <input type="text" value={form.clientPhone} onChange={set("clientPhone")} style={inputStyle} />
                </FormField>
              </div>

              <div className="grid-responsive-2">
                <FormField label="Perusahaan">
                  <input type="text" value={form.clientCompany} onChange={set("clientCompany")} style={inputStyle} />
                </FormField>
                <FormField label="Sumber Lead">
                  <input type="text" value={form.source} onChange={set("source")} style={inputStyle} />
                </FormField>
              </div>

              <div className="grid-responsive-3">
                <FormField label="Nilai (Rp)">
                  <input type="number" min={0} value={form.value} onChange={set("value")} style={inputStyle} />
                </FormField>
                <FormField label="Status">
                  <select value={form.status} onChange={set("status")} style={selectStyle}>
                    {KANBAN_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Prioritas">
                  <select value={form.priority} onChange={set("priority")} style={selectStyle}>
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi</option>
                  </select>
                </FormField>
              </div>

              <RichTextEditor
                label="Deskripsi"
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Catatan, konteks, atau informasi penting..."
                minHeight={80}
              />

              <div className="button-group-responsive">
                <button type="button" onClick={() => setMode("view")} style={{
                  padding:"9px 18px", background:"var(--bg-card2)",
                  border:"1px solid var(--border)", borderRadius:9,
                  fontSize:13, fontWeight:600, color:"var(--text-secondary)", cursor:"pointer",
                }}>
                  Batal
                </button>
                <button type="submit" disabled={saving} style={{
                  padding:"9px 22px",
                  background: saving ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  color: saving ? "var(--text-muted)" : "#fff",
                  border:"none", borderRadius:9,
                  fontSize:13, fontWeight:600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <AccessToast
        type={notice.type} message={notice.message}
        show={notice.show} onClose={hideNotice}
      />
    </>
  )
}

