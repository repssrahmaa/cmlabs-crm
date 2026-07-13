"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  LayoutGrid,
  StickyNote,
  Mail,
  Phone,
  Users,
  CheckSquare,
} from "lucide-react"


interface EmailRecord {
  id:          string
  toAddress:   string
  fromAddress: string
  subject:     string
  body:        string
  status:      "PENDING" | "SENT" | "FAILED"
  sentAt:      string | null
  errorLog:    string | null
}

interface TimelineActivity {
  id:          string
  type:        string
  title:       string
  content:     string | null
  description: string | null
  isDone:      boolean
  dueDate:     string | null
  createdAt:   string
  metadata:    any
  user:        { id: string; name: string | null; role: string }
  email:       EmailRecord | null
}

interface Props {
  leadId:       string
  clientEmail?: string | null
}

// ── Config per activity type ───────────────────────────
const TYPE_CONFIG: Record<string, {
  label:  string
  icon:   string
  color:  string
}> = {
  INTERNAL_NOTE:  { label: "Catatan Internal", icon: "📝", color: "#6366f1" },
  EMAIL_SENT:     { label: "Email Terkirim",   icon: "📤", color: "#2563eb" },
  EMAIL_RECEIVED: { label: "Email Diterima",   icon: "📥", color: "#0891b2" },
  CALL:           { label: "Telepon",          icon: "📞", color: "#7c3aed" },
  MEETING:        { label: "Meeting",          icon: "🤝", color: "#059669" },
  TASK:           { label: "Tugas",            icon: "✅", color: "#f59e0b" },
  NOTE:           { label: "Catatan",          icon: "📋", color: "#64748b" },
}

const EMAIL_STATUS_CONFIG = {
  PENDING: { label: "Mengirim...", color: "#f59e0b", varBg: "rgba(245,158,11,0.12)" },
  SENT:    { label: "Terkirim",   color: "#059669", varBg: "rgba(5,150,105,0.12)"  },
  FAILED:  { label: "Gagal",      color: "#ef4444", varBg: "rgba(239,68,68,0.12)"  },
}

type TabType     = "all" | "INTERNAL_NOTE" | "EMAIL_SENT" | "CALL" | "MEETING" | "TASK"
type ComposeType = "INTERNAL_NOTE" | "EMAIL_SENT" | "CALL" | "MEETING" | "TASK" | null

export default function LeadTimeline({ leadId, clientEmail }: Props) {
  const [timeline, setTimeline]       = useState<TimelineActivity[]>([])
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [activeTab, setActiveTab]     = useState<TabType>("all")
  const [composeType, setComposeType] = useState<ComposeType>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)

  // ── Form state ─────────────────────────────────────
  const [noteForm, setNoteForm] = useState({ title: "", content: "" })
  const [emailForm, setEmailForm] = useState({
    toAddress: clientEmail ?? "",
    subject:   "",
    body:      "",
  })
  const [activityForm, setActivityForm] = useState({
    title:       "",
    description: "",
    dueDate:     "",
  })

  // ── Fetch timeline ──────────────────────────────────
  const fetchTimeline = useCallback(async () => {
    try {
      const res  = await fetch(`/api/leads/${leadId}/timeline`)
      const data = await res.json()
      setTimeline(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Fetch timeline error:", err)
      setTimeline([])
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => { fetchTimeline() }, [fetchTimeline])

  // ── Submit communication ────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!composeType) return
    setSubmitting(true)

    try {
      let payload: any

      if (composeType === "INTERNAL_NOTE") {
        payload = { type: "INTERNAL_NOTE", ...noteForm }
      } else if (composeType === "EMAIL_SENT") {
        payload = { type: "EMAIL_SENT", ...emailForm }
      } else {
        payload = { type: composeType, ...activityForm }
      }

      const res = await fetch(`/api/leads/${leadId}/communications`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Gagal menyimpan")
      }

      setNoteForm({ title: "", content: "" })
      setEmailForm({ toAddress: clientEmail ?? "", subject: "", body: "" })
      setActivityForm({ title: "", description: "", dueDate: "" })
      setComposeType(null)
      await fetchTimeline()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Toggle done ─────────────────────────────────────
  async function handleToggleDone(activity: TimelineActivity) {
    await fetch(`/api/activities/${activity.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isDone: !activity.isDone }),
    })
    fetchTimeline()
  }

  // ── Delete ──────────────────────────────────────────
  async function handleDelete(activityId: string) {
    if (!confirm("Hapus aktivitas ini dari timeline?")) return
    await fetch(`/api/activities/${activityId}`, { method: "DELETE" })
    fetchTimeline()
  }

  // ── Filter ──────────────────────────────────────────
  const filtered = activeTab === "all"
    ? timeline
    : timeline.filter((a) => a.type === activeTab)

const tabs = [
  { key: "all",           label: "Semua",   icon: LayoutGrid },
  { key: "INTERNAL_NOTE", label: "Catatan", icon: StickyNote },
  { key: "EMAIL_SENT",    label: "Email",   icon: Mail },
  { key: "CALL",          label: "Telepon", icon: Phone },
  { key: "MEETING",       label: "Meeting", icon: Users },
  { key: "TASK",          label: "Tugas",   icon: CheckSquare },
]

  const composeButtons: { type: ComposeType; label: string; color: string }[] = [
    { type: "INTERNAL_NOTE", label: "+ Catatan", color: "#6366f1" },
    { type: "EMAIL_SENT",    label: "+ Email",   color: "#2563eb" },
    { type: "CALL",          label: "+ Telepon", color: "#7c3aed" },
    { type: "MEETING",       label: "+ Meeting", color: "#059669" },
    { type: "TASK",          label: "+ Tugas",   color: "#f59e0b" },
  ]

  return (
    <div style={{ marginTop: 0 }}>

      {/* ── Compose Buttons ──────────────────────────── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {composeButtons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setComposeType(composeType === btn.type ? null : btn.type)}
            style={{
              padding:      "6px 12px",
              background:   composeType === btn.type ? btn.color : "var(--bg-card2)",
              color:        composeType === btn.type ? "#fff" : btn.color,
              border:       `1px solid ${btn.color}40`,
              borderRadius: 6,
              fontSize:     12,
              fontWeight:   500,
              cursor:       "pointer",
              transition:   "all 0.15s",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── Compose Form ─────────────────────────────── */}
      {composeType && (
        <form
          onSubmit={handleSubmit}
          style={{
            background:   "var(--bg-card2)",
            border:       `1px solid ${TYPE_CONFIG[composeType]?.color}30`,
            borderRadius: 10,
            padding:      16,
            marginBottom: 16,
          }}
        >
          {/* Form header */}
          <div style={{
            display:       "flex",
            alignItems:    "center",
            gap:           8,
            marginBottom:  12,
            paddingBottom: 10,
            borderBottom:  "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 16 }}>{TYPE_CONFIG[composeType]?.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: TYPE_CONFIG[composeType]?.color }}>
              {TYPE_CONFIG[composeType]?.label}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* ── INTERNAL NOTE form ── */}
            {composeType === "INTERNAL_NOTE" && (
              <>
                <input
                  type="text"
                  placeholder="Judul catatan *"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Isi catatan internal (hanya terlihat oleh tim) *"
                  required
                  value={noteForm.content}
                  onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </>
            )}

            {/* ── EMAIL SENT form ── */}
            {composeType === "EMAIL_SENT" && (
              <>
                <input
                  type="email"
                  placeholder="Kirim ke (email klien) *"
                  required
                  value={emailForm.toAddress}
                  onChange={(e) => setEmailForm((f) => ({ ...f, toAddress: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Subjek email *"
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Isi email *"
                  required
                  value={emailForm.body}
                  onChange={(e) => setEmailForm((f) => ({ ...f, body: e.target.value }))}
                  rows={6}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                <div style={{
                  padding:      "8px 12px",
                  background:   "rgba(37,99,235,0.08)",
                  border:       "1px solid rgba(37,99,235,0.2)",
                  borderRadius: 6,
                  fontSize:     12,
                  color:        "#2563eb",
                }}>
                  {process.env.NODE_ENV === "development"
                    ? "⚙️ Mode Dev: Email akan di-mock (tidak dikirim ke server nyata)"
                    : "✉️ Email akan dikirim via Resend ke alamat yang dituju"}
                </div>
              </>
            )}

            {/* ── CALL / MEETING / TASK form ── */}
            {["CALL", "MEETING", "TASK"].includes(composeType) && (
              <>
                <input
                  type="text"
                  placeholder={`Judul ${TYPE_CONFIG[composeType]?.label} *`}
                  required
                  value={activityForm.title}
                  onChange={(e) => setActivityForm((f) => ({ ...f, title: e.target.value }))}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Catatan (opsional)"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    Due Date (opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={activityForm.dueDate}
                    onChange={(e) => setActivityForm((f) => ({ ...f, dueDate: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* Submit row */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setComposeType(null)}
                style={{
                  padding:      "8px 16px",
                  background:   "var(--bg-card)",
                  color:        "var(--text-secondary)",
                  border:       "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize:     13,
                  cursor:       "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding:      "8px 20px",
                  background:   submitting ? "var(--border)" : (TYPE_CONFIG[composeType]?.color ?? "#2563eb"),
                  color:        submitting ? "var(--text-muted)" : "#fff",
                  border:       "none",
                  borderRadius: 6,
                  fontSize:     13,
                  fontWeight:   500,
                  cursor:       submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Menyimpan..." : composeType === "EMAIL_SENT" ? "Kirim Email" : "Simpan"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Filter Tabs ───────────────────────────────── */}
      <div style={{
        display:       "flex",
        gap:           4,
        marginBottom:  12,
        borderBottom:  "1px solid var(--border)",
        paddingBottom: 8,
        flexWrap:      "wrap",
      }}>
{tabs.map((tab) => {
  const count = tab.key === "all"
    ? timeline.length
    : timeline.filter((a) => a.type === tab.key).length

  const isActive = activeTab === tab.key
  const Icon = tab.icon

  return (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key as TabType)}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          6,
        padding:      "4px 12px",
        background:   isActive ? "#2563eb" : "transparent",
        color:        isActive ? "#fff" : "var(--text-muted)",
        border:       "none",
        borderRadius: 999,
        fontSize:     12,
        fontWeight:   isActive ? 600 : 400,
        cursor:       "pointer",
      }}
    >
      <Icon size={14} />

      <span>{tab.label}</span>

      {count > 0 && (
        <span
          style={{
            marginLeft:   2,
            fontSize:     10,
            background:   isActive
              ? "rgba(255,255,255,0.25)"
              : "var(--bg-card2)",
            color:        isActive ? "#fff" : "var(--text-muted)",
            padding:      "1px 5px",
            borderRadius: 999,
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
})}
      </div>

      {/* ── Timeline Items ────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>
          Memuat timeline...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign:    "center",
          padding:      32,
          color:        "var(--text-muted)",
          fontSize:     13,
          background:   "var(--bg-card2)",
          borderRadius: 8,
          border:       "1px dashed var(--border)",
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
          Belum ada aktivitas. Mulai dengan menambahkan catatan atau mengirim email.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((activity, index) => {
            const cfg        = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
            const isExpanded = expandedId === activity.id
            const isLast     = index === filtered.length - 1

            return (
              <div key={activity.id} style={{ display: "flex", gap: 12 }}>

                {/* ── Timeline spine ── */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width:          32,
                    height:         32,
                    borderRadius:   "50%",
                    background:     `${cfg.color}18`,
                    border:         `2px solid ${cfg.color}40`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       14,
                    flexShrink:     0,
                  }}>
                    {cfg.icon}
                  </div>
                  {!isLast && (
                    <div style={{
                      width:     2,
                      flex:      1,
                      background:"var(--border)",
                      minHeight: 16,
                      marginTop: 4,
                    }} />
                  )}
                </div>

                {/* ── Content card ── */}
                <div style={{
                  flex:          1,
                  paddingBottom: isLast ? 0 : 16,
                  paddingTop:    2,
                }}>
                  <div style={{
                    background:   "var(--bg-card)",
                    borderRadius: 8,
                    border:       "1px solid var(--border)",
                    overflow:     "hidden",
                    opacity:      activity.isDone && activity.type === "TASK" ? 0.65 : 1,
                    transition:   "opacity 0.15s",
                  }}>

                    {/* Activity header (click to expand) */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                      style={{
                        padding:    "10px 14px",
                        cursor:     "pointer",
                        display:    "flex",
                        alignItems: "center",
                        gap:        8,
                      }}
                    >
                      {/* Type badge */}
                      <span style={{
                        fontSize:     11,
                        fontWeight:   600,
                        padding:      "2px 8px",
                        borderRadius: 999,
                        background:   `${cfg.color}18`,
                        color:        cfg.color,
                        flexShrink:   0,
                      }}>
                        {cfg.label}
                      </span>

                      {/* Title */}
                      <span style={{
                        fontSize:       13,
                        fontWeight:     600,
                        color:          "var(--text-primary)",
                        flex:           1,
                        textDecoration: activity.isDone && activity.type === "TASK"
                          ? "line-through"
                          : "none",
                        overflow:       "hidden",
                        textOverflow:   "ellipsis",
                        whiteSpace:     "nowrap",
                      }}>
                        {activity.title}
                      </span>

                      {/* Email status badge */}
                      {activity.email && (
                        <span style={{
                          fontSize:     11,
                          fontWeight:   600,
                          padding:      "2px 8px",
                          borderRadius: 999,
                          background:   EMAIL_STATUS_CONFIG[activity.email.status].varBg,
                          color:        EMAIL_STATUS_CONFIG[activity.email.status].color,
                          flexShrink:   0,
                        }}>
                          {EMAIL_STATUS_CONFIG[activity.email.status].label}
                        </span>
                      )}

                      {/* Timestamp */}
                      <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                        {format(new Date(activity.createdAt), "d MMM, HH:mm", { locale: localeId })}
                      </span>

                      {/* Expand indicator */}
                      <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* ── Expanded detail ── */}
                    {isExpanded && (
                      <div style={{
                        padding:    "12px 14px 14px",
                        borderTop:  "1px solid var(--border)",
                      }}>

                        {/* Content / body */}
                        {(activity.content || activity.description) && (
                          <div style={{
                            fontSize:     13,
                            color:        "var(--text-secondary)",
                            lineHeight:   1.7,
                            whiteSpace:   "pre-wrap",
                            marginBottom: 10,
                            padding:      10,
                            background:   "var(--bg-card2)",
                            borderRadius: 6,
                            border:       "1px solid var(--border-light)",
                          }}>
                            {activity.content ?? activity.description}
                          </div>
                        )}

                        {/* Email detail */}
                        {activity.email && (
                          <div style={{
                            marginBottom: 10,
                            padding:      10,
                            background:   "rgba(37,99,235,0.06)",
                            borderRadius: 6,
                            fontSize:     12,
                            border:       "1px solid rgba(37,99,235,0.15)",
                            color:        "var(--text-secondary)",
                          }}>
                            <div style={{ marginBottom: 4 }}>
                              <strong style={{ color: "var(--text-primary)" }}>Dari:</strong>{" "}
                              {activity.email.fromAddress}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <strong style={{ color: "var(--text-primary)" }}>Kepada:</strong>{" "}
                              {activity.email.toAddress}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <strong style={{ color: "var(--text-primary)" }}>Subjek:</strong>{" "}
                              {activity.email.subject}
                            </div>
                            {activity.email.sentAt && (
                              <div style={{ color: "#059669" }}>
                                <strong>Terkirim:</strong>{" "}
                                {format(new Date(activity.email.sentAt), "d MMM yyyy, HH:mm", { locale: localeId })}
                              </div>
                            )}
                            {activity.email.status === "FAILED" && activity.email.errorLog && (
                              <div style={{ color: "#ef4444", marginTop: 4 }}>
                                <strong>Error:</strong> {activity.email.errorLog}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Due date */}
                        {activity.dueDate && (
                          <div style={{
                            fontSize:     12,
                            color:        new Date(activity.dueDate) < new Date() && !activity.isDone
                              ? "#ef4444"
                              : "#f59e0b",
                            marginBottom: 10,
                            display:      "flex",
                            alignItems:   "center",
                            gap:          4,
                          }}>
                            ⏰ Due:{" "}
                            {format(new Date(activity.dueDate), "d MMM yyyy, HH:mm", { locale: localeId })}
                          </div>
                        )}

                        {/* Author + actions */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            oleh{" "}
                            <strong style={{ color: "var(--text-secondary)" }}>
                              {activity.user.name}
                            </strong>
                          </span>

                          <div style={{ display: "flex", gap: 6 }}>
                            {activity.type === "TASK" && (
                              <button
                                onClick={() => handleToggleDone(activity)}
                                style={{
                                  padding:      "3px 10px",
                                  background:   activity.isDone
                                    ? "var(--bg-card2)"
                                    : "rgba(22,163,74,0.1)",
                                  color:        activity.isDone
                                    ? "var(--text-muted)"
                                    : "#16a34a",
                                  border:       `1px solid ${activity.isDone ? "var(--border)" : "rgba(22,163,74,0.25)"}`,
                                  borderRadius: 6,
                                  fontSize:     11,
                                  cursor:       "pointer",
                                  fontWeight:   500,
                                }}
                              >
                                {activity.isDone ? "Buka Kembali" : "Tandai Selesai"}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(activity.id)}
                              style={{
                                padding:      "3px 10px",
                                background:   "rgba(239,68,68,0.08)",
                                color:        "#ef4444",
                                border:       "1px solid rgba(239,68,68,0.2)",
                                borderRadius: 6,
                                fontSize:     11,
                                cursor:       "pointer",
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Shared input style — uses CSS variables ────────────
const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "8px 12px",
  border:       "1px solid var(--input-border)",
  borderRadius: 6,
  fontSize:     13,
  boxSizing:    "border-box",
  background:   "var(--input-bg)",
  color:        "var(--input-text)",
}