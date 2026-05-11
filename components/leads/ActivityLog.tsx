"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface Activity {
  id:          string
  type:        string
  title:       string
  description: string | null
  dueDate:     string | null
  isDone:      boolean
  createdAt:   string
  user:        { id: string; name: string; avatar: string | null }
}

interface Props {
  leadId: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  NOTE:    { label: "Catatan",  color: "#6366f1", bg: "#eef2ff", icon: "📝" },
  CALL:    { label: "Telepon",  color: "#0891b2", bg: "#ecfeff", icon: "📞" },
  EMAIL:   { label: "Email",    color: "#2563eb", bg: "#eff6ff", icon: "✉️"  },
  MEETING: { label: "Meeting",  color: "#7c3aed", bg: "#f5f3ff", icon: "🤝" },
  TASK:    { label: "Tugas",    color: "#f59e0b", bg: "#fffbeb", icon: "✅" },
}

export default function ActivityLog({ leadId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({
    type:        "NOTE",
    title:       "",
    description: "",
    dueDate:     "",
  })

  const fetchActivities = useCallback(async () => {
    const res  = await fetch(`/api/leads/${leadId}/activities`)
    const data = await res.json()
    setActivities(data)
    setLoading(false)
  }, [leadId])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) return
    setSubmitting(true)

    await fetch(`/api/leads/${leadId}/activities`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    })

    setForm({ type: "NOTE", title: "", description: "", dueDate: "" })
    setShowForm(false)
    setSubmitting(false)
    fetchActivities()
  }

  async function handleToggleDone(activity: Activity) {
    await fetch(`/api/activities/${activity.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isDone: !activity.isDone }),
    })
    fetchActivities()
  }

  async function handleDelete(activityId: string) {
    if (!confirm("Hapus aktivitas ini?")) return
    await fetch(`/api/activities/${activityId}`, { method: "DELETE" })
    fetchActivities()
  }

  return (
    <div style={{ marginTop: 24 }}>
      {/* Header */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        marginBottom:   16,
      }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
          Aktivitas ({activities.length})
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding:      "6px 14px",
            background:   showForm ? "#f1f5f9" : "#2563eb",
            color:        showForm ? "#475569" : "#fff",
            border:       "none",
            borderRadius: 6,
            fontSize:     13,
            fontWeight:   500,
            cursor:       "pointer",
          }}
        >
          {showForm ? "Batal" : "+ Tambah Aktivitas"}
        </button>
      </div>

      {/* Form Tambah Aktivitas */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background:   "#f8fafc",
            borderRadius: 8,
            padding:      16,
            marginBottom: 16,
            border:       "1px solid #e2e8f0",
            display:      "flex",
            flexDirection: "column",
            gap:          12,
          }}
        >
          {/* Tipe Aktivitas */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: key }))}
                style={{
                  padding:      "5px 12px",
                  borderRadius: 999,
                  border:       `1px solid ${form.type === key ? cfg.color : "#e2e8f0"}`,
                  background:   form.type === key ? cfg.bg : "#fff",
                  color:        form.type === key ? cfg.color : "#64748b",
                  fontSize:     12,
                  fontWeight:   form.type === key ? 600 : 400,
                  cursor:       "pointer",
                }}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>

          {/* Judul */}
          <input
            type="text"
            placeholder="Judul aktivitas *"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{
              padding:      "8px 12px",
              border:       "1px solid #d1d5db",
              borderRadius: 6,
              fontSize:     14,
              width:        "100%",
              boxSizing:    "border-box",
            }}
          />

          {/* Deskripsi */}
          <textarea
            placeholder="Deskripsi (opsional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            style={{
              padding:      "8px 12px",
              border:       "1px solid #d1d5db",
              borderRadius: 6,
              fontSize:     14,
              resize:       "vertical",
              boxSizing:    "border-box",
              width:        "100%",
            }}
          />

          {/* Due Date */}
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>
              Due Date (opsional)
            </label>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              style={{
                padding:      "7px 12px",
                border:       "1px solid #d1d5db",
                borderRadius: 6,
                fontSize:     13,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding:      "9px",
              background:   submitting ? "#93c5fd" : "#2563eb",
              color:        "#fff",
              border:       "none",
              borderRadius: 6,
              fontSize:     14,
              fontWeight:   500,
              cursor:       "pointer",
            }}
          >
            {submitting ? "Menyimpan..." : "Simpan Aktivitas"}
          </button>
        </form>
      )}

      {/* List Aktivitas */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>
          Memuat aktivitas...
        </div>
      ) : activities.length === 0 ? (
        <div style={{
          textAlign:    "center",
          padding:      32,
          color:        "#94a3b8",
          fontSize:     13,
          background:   "#f8fafc",
          borderRadius: 8,
          border:       "1px dashed #e2e8f0",
        }}>
          Belum ada aktivitas. Tambahkan aktivitas pertama!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activities.map((activity) => {
            const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.NOTE
            return (
              <div
                key={activity.id}
                style={{
                  background:   "#fff",
                  borderRadius: 8,
                  padding:      14,
                  border:       "1px solid #e2e8f0",
                  borderLeft:   `3px solid ${cfg.color}`,
                  opacity:      activity.isDone ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {/* Type badge + Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize:     11,
                        fontWeight:   600,
                        padding:      "2px 8px",
                        borderRadius: 999,
                        background:   cfg.bg,
                        color:        cfg.color,
                      }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span style={{
                        fontSize:        13,
                        fontWeight:      600,
                        color:           "#0f172a",
                        textDecoration:  activity.isDone ? "line-through" : "none",
                      }}>
                        {activity.title}
                      </span>
                    </div>

                    {/* Description */}
                    {activity.description && (
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0", lineHeight: 1.5 }}>
                        {activity.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        oleh {activity.user.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {format(new Date(activity.createdAt), "d MMM yyyy, HH:mm", { locale: localeId })}
                      </span>
                      {activity.dueDate && (
                        <span style={{
                          fontSize:   11,
                          fontWeight: 500,
                          color:      new Date(activity.dueDate) < new Date() && !activity.isDone
                            ? "#ef4444"
                            : "#f59e0b",
                        }}>
                          Due: {format(new Date(activity.dueDate), "d MMM yyyy, HH:mm", { locale: localeId })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    <button
                      onClick={() => handleToggleDone(activity)}
                      title={activity.isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      style={{
                        padding:      "4px 10px",
                        background:   activity.isDone ? "#f1f5f9" : "#f0fdf4",
                        color:        activity.isDone ? "#64748b" : "#16a34a",
                        border:       "none",
                        borderRadius: 6,
                        fontSize:     12,
                        cursor:       "pointer",
                        fontWeight:   500,
                      }}
                    >
                      {activity.isDone ? "Buka" : "Selesai"}
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      style={{
                        padding:      "4px 10px",
                        background:   "#fef2f2",
                        color:        "#dc2626",
                        border:       "none",
                        borderRadius: 6,
                        fontSize:     12,
                        cursor:       "pointer",
                      }}
                    >
                      Hapus
                    </button>
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