"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

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
  user:        { id: string; name: string; avatar: string | null; role: string }
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
  bg:     string
}> = {
  INTERNAL_NOTE:  { label: "Catatan Internal", icon: "📝", color: "#6366f1", bg:"var(--bg-primary)" },
  EMAIL_SENT:     { label: "Email Terkirim",   icon: "📤", color: "#2563eb", bg: "var(--bg-primary)" },
  EMAIL_RECEIVED: { label: "Email Diterima",   icon: "📥", color: "#0891b2", bg: "var(--bg-primary)" },
  CALL:           { label: "Telepon",          icon: "📞", color: "#7c3aed", bg: "var(--bg-primary)" },
  MEETING:        { label: "Meeting",          icon: "🤝", color: "#059669", bg: "var(--bg-primary)" },
  TASK:           { label: "Tugas",            icon: "✅", color: "#f59e0b", bg: "var(--bg-primary)" },
  NOTE:           { label: "Catatan",          icon: "📋", color: "#64748b", bg: "var(--bg-primary)" },
}

const EMAIL_STATUS_CONFIG = {
  PENDING: { label: "Mengirim...", color: "#f59e0b", bg: "#fffbeb" },
  SENT:    { label: "Terkirim",   color: "#059669", bg: "#ecfdf5" },
  FAILED:  { label: "Gagal",      color: "#ef4444", bg: "#fef2f2" },
}

type TabType = "all" | "INTERNAL_NOTE" | "EMAIL_SENT" | "CALL" | "MEETING" | "TASK"
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

      // Reset form
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

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "all",           label: "Semua",    icon: "◎" },
    { key: "INTERNAL_NOTE", label: "Catatan",  icon: "📝" },
    { key: "EMAIL_SENT",    label: "Email",    icon: "📤" },
    { key: "CALL",          label: "Telepon",  icon: "📞" },
    { key: "MEETING",       label: "Meeting",  icon: "🤝" },
    { key: "TASK",          label: "Tugas",    icon: "✅" },
  ]

  const composeButtons: { type: ComposeType; label: string; color: string }[] = [
    { type: "INTERNAL_NOTE", label: "+ Catatan",  color: "#6366f1" },
    { type: "EMAIL_SENT",    label: "+ Email",    color: "#2563eb" },
    { type: "CALL",          label: "+ Telepon",  color: "#7c3aed" },
    { type: "MEETING",       label: "+ Meeting",  color: "#059669" },
    { type: "TASK",          label: "+ Tugas",    color: "#f59e0b" },
  ]

  return (
    <div style={{ marginTop: 0 }}>
      {/* ── Compose Buttons ──────────────────────────── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {composeButtons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => setComposeType(
              composeType === btn.type ? null : btn.type
            )}
            style={{
              padding:      "6px 12px",
              background:   composeType === btn.type ? btn.color : "#f8fafc",
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
            background:   "#f8fafc",
            border:       `1px solid ${TYPE_CONFIG[composeType]?.color}30`,
            borderRadius: 8,
            padding:      16,
            marginBottom: 16,
          }}
        >
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          8,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: "1px solid #e2e8f0",
          }}>
            <span style={{ fontSize: 16 }}>{TYPE_CONFIG[composeType]?.icon}</span>
            <span style={{
              fontSize:   13,
              fontWeight: 600,
              color:      TYPE_CONFIG[composeType]?.color,
            }}>
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
                  background:   "#eff6ff",
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
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>
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

            {/* Submit */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setComposeType(null)}
                style={{
                  padding:      "8px 16px",
                  background:   "#f1f5f9",
                  color:        "#475569",
                  border:       "none",
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
                  padding:    "8px 20px",
                  background: submitting
                    ? "#93c5fd"
                    : (TYPE_CONFIG[composeType]?.color ?? "#2563eb"),
                  color:        "#fff",
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
        display:      "flex",
        gap:          4,
        marginBottom: 12,
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: 8,
        flexWrap:     "wrap",
      }}>
        {tabs.map((tab) => {
          const count = tab.key === "all"
            ? timeline.length
            : timeline.filter((a) => a.type === tab.key).length

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding:      "4px 12px",
                background:   activeTab === tab.key ? "#2563eb" : "transparent",
                color:        activeTab === tab.key ? "#fff" : "#64748b",
                border:       "none",
                borderRadius: 999,
                fontSize:     12,
                fontWeight:   activeTab === tab.key ? 600 : 400,
                cursor:       "pointer",
              }}
            >
              {tab.icon} {tab.label}
              {count > 0 && (
                <span style={{
                  marginLeft:   4,
                  fontSize:     10,
                  background:   activeTab === tab.key ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                  padding:      "1px 5px",
                  borderRadius: 999,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Timeline Items ────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>
          Memuat timeline...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign:    "center",
          padding:      32,
          color:        "#94a3b8",
          fontSize:     13,
          background:   "#f8fafc",
          borderRadius: 8,
          border:       "1px dashed #e2e8f0",
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
          Belum ada aktivitas. Mulai dengan menambahkan catatan atau mengirim email.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((activity, index) => {
            const cfg       = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
            const isExpanded = expandedId === activity.id
            const isLast    = index === filtered.length - 1

            return (
              <div key={activity.id} style={{ display: "flex", gap: 12 }}>
                {/* Timeline line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width:          32,
                    height:         32,
                    borderRadius:   "50%",
                    background:     cfg.bg,
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
                    <div style={{ width: 2, flex: 1, background: "#e2e8f0", minHeight: 16, marginTop: 4 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{
                  flex:          1,
                  paddingBottom: isLast ? 0 : 16,
                  paddingTop:    2,
                }}>
                  <div style={{
                    background:   "#fff",
                    borderRadius: 8,
                    border:       "1px solid #e2e8f0",
                    overflow:     "hidden",
                    opacity:      activity.isDone && activity.type === "TASK" ? 0.7 : 1,
                  }}>
                    {/* Activity header */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                      style={{
                        padding:  "10px 14px",
                        cursor:   "pointer",
                        display:  "flex",
                        alignItems: "center",
                        gap:      8,
                      }}
                    >
                      {/* Type badge */}
                      <span style={{
                        fontSize:     11,
                        fontWeight:   600,
                        padding:      "2px 8px",
                        borderRadius: 999,
                        background:   cfg.bg,
                        color:        cfg.color,
                        flexShrink:   0,
                      }}>
                        {cfg.label}
                      </span>

                      {/* Title */}
                      <span style={{
                        fontSize:       13,
                        fontWeight:     600,
                        color:          "#0f172a",
                        flex:           1,
                        textDecoration: activity.isDone && activity.type === "TASK"
                          ? "line-through"
                          : "none",
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
                          background:   EMAIL_STATUS_CONFIG[activity.email.status].bg,
                          color:        EMAIL_STATUS_CONFIG[activity.email.status].color,
                          flexShrink:   0,
                        }}>
                          {EMAIL_STATUS_CONFIG[activity.email.status].label}
                        </span>
                      )}

                      {/* Meta */}
                      <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
                        {format(
                          new Date(activity.createdAt),
                          "d MMM, HH:mm",
                          { locale: localeId }
                        )}
                      </span>

                      {/* Expand indicator */}
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div style={{
                        padding:    "0 14px 14px",
                        borderTop:  "1px solid #f1f5f9",
                        paddingTop: 12,
                      }}>
                        {/* Content / Body */}
                        {(activity.content || activity.description) && (
                          <div style={{
                            fontSize:     13,
                            color:        "#374151",
                            lineHeight:   1.7,
                            whiteSpace:   "pre-wrap",
                            marginBottom: 10,
                            padding:      10,
                            background:   "#f8fafc",
                            borderRadius: 6,
                          }}>
                            {activity.content ?? activity.description}
                          </div>
                        )}

                        {/* Email detail */}
                        {activity.email && (
                          <div style={{
                            marginBottom: 10,
                            padding:      10,
                            background:   "#f0f9ff",
                            borderRadius: 6,
                            fontSize:     12,
                            border:       "1px solid #bae6fd",
                          }}>
                            <div style={{ marginBottom: 4 }}>
                              <strong>Dari:</strong> {activity.email.fromAddress}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <strong>Kepada:</strong> {activity.email.toAddress}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                              <strong>Subjek:</strong> {activity.email.subject}
                            </div>
                            {activity.email.sentAt && (
                              <div style={{ color: "#059669" }}>
                                <strong>Terkirim:</strong>{" "}
                                {format(new Date(activity.email.sentAt), "d MMM yyyy, HH:mm", { locale: localeId })}
                              </div>
                            )}
                            {activity.email.status === "FAILED" && activity.email.errorLog && (
                              <div style={{ color: "#dc2626", marginTop: 4 }}>
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
                            marginBottom: 8,
                          }}>
                            ⏰ Due: {format(new Date(activity.dueDate), "d MMM yyyy, HH:mm", { locale: localeId })}
                          </div>
                        )}

                        {/* Author */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            oleh <strong>{activity.user.name}</strong>
                          </span>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 6 }}>
                            {activity.type === "TASK" && (
                              <button
                                onClick={() => handleToggleDone(activity)}
                                style={{
                                  padding:      "3px 10px",
                                  background:   activity.isDone ? "#f1f5f9" : "#f0fdf4",
                                  color:        activity.isDone ? "#64748b" : "#16a34a",
                                  border:       "none",
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
                                background:   "#fef2f2",
                                color:        "#dc2626",
                                border:       "none",
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

// ── Shared input style ─────────────────────────────────
const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "8px 12px",
  border:       "1px solid #d1d5db",
  borderRadius: 6,
  fontSize:     13,
  boxSizing:    "border-box",
  background:   "#fff",
}