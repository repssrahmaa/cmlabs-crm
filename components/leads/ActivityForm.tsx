// components/leads/ActivityForm.tsx
"use client"

import { useState } from "react"
import RichTextEditor from "@/components/ui/RichTextEditor"
import type { ActivityType } from "@/types/lead"

interface Props {
  type:     ActivityType
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export default function ActivityForm({ type, onSubmit, onCancel }: Props) {
  const [title,    setTitle]    = useState("")
  const [content,  setContent]  = useState("")
  const [dueDate,  setDueDate]  = useState("")
  const [dueTime,  setDueTime]  = useState("")
  const [endTime,  setEndTime]  = useState("")
  const [invites,  setInvites]  = useState("")
  const [meetLink, setMeetLink] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const TYPE_CONFIG: Record<ActivityType, { label: string; icon: string; color: string }> = {
    INTERNAL_NOTE:  { label: "Catatan Internal",  icon: "N", color: "#6366f1" },
    EMAIL_SENT:     { label: "Email",             icon: "E", color: "#4B9EF3" },
    EMAIL_RECEIVED: { label: "Email Masuk",       icon: "E", color: "#0891b2" },
    CALL:           { label: "Telepon",           icon: "T", color: "#10b981" },
    MEETING:        { label: "Meeting",           icon: "M", color: "#8b5cf6" },
    TASK:           { label: "Tugas",             icon: "X", color: "#f59e0b" },
    NOTE:           { label: "Catatan",           icon: "N", color: "#94a3b8" },
  }

  const cfg = TYPE_CONFIG[type]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Judul tidak boleh kosong"); return }
    setLoading(true)
    setError("")
    try {
      const payload: any = { type, title: title.trim(), content }

      if (dueDate) {
        const dateStr = dueTime ? `${dueDate}T${dueTime}` : dueDate
        payload.dueDate = new Date(dateStr).toISOString()
      }

      if (type === "MEETING") {
        payload.meetLink    = meetLink.trim() || null
        payload.meetInvites = invites
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0)
        if (dueDate && endTime) {
          payload.meetStart = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null
          payload.meetEnd   = dueDate && endTime  ? new Date(`${dueDate}T${endTime}`).toISOString()  : null
        }
      }

      await onSubmit(payload)
    } catch (err: any) {
      setError(err.message ?? "Gagal menyimpan aktivitas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Error */}
      {error && (
        <div style={{ padding: "10px 14px", background: "var(--danger-pale)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Judul */}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Judul *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            type === "CALL"    ? "Contoh: Follow-up telepon dengan Pak Budi" :
            type === "MEETING" ? "Contoh: Presentasi proposal Q1 2025" :
            type === "TASK"    ? "Contoh: Kirim revisi dokumen kontrak" :
            "Tulis judul..."
          }
          required
          style={{
            width: "100%", padding: "9px 12px", boxSizing: "border-box",
            background: "var(--input-bg)", color: "var(--input-text)",
            border: "1px solid var(--input-border)", borderRadius: 8, fontSize: 13,
          }}
        />
      </div>

      {/* Due Date / Meeting Time */}
      {(type === "TASK" || type === "MEETING" || type === "CALL") && (
        <div style={{ display: "grid", gridTemplateColumns: type === "MEETING" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {type === "MEETING" ? "Tanggal" : "Tenggat"} {type !== "CALL" ? "*" : ""}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: "100%", padding: "9px 10px", boxSizing: "border-box",
                background: "var(--input-bg)", color: "var(--input-text)",
                border: "1px solid var(--input-border)", borderRadius: 8, fontSize: 13,
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {type === "MEETING" ? "Jam Mulai" : "Jam"}
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              style={{
                width: "100%", padding: "9px 10px", boxSizing: "border-box",
                background: "var(--input-bg)", color: "var(--input-text)",
                border: "1px solid var(--input-border)", borderRadius: 8, fontSize: 13,
              }}
            />
          </div>
          {type === "MEETING" && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: "100%", padding: "9px 10px", boxSizing: "border-box",
                  background: "var(--input-bg)", color: "var(--input-text)",
                  border: "1px solid var(--input-border)", borderRadius: 8, fontSize: 13,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Meeting-specific fields */}
      {type === "MEETING" && (
        <>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Link Meeting (opsional)
            </label>
            <input
              type="url"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              style={{
                width: "100%", padding: "9px 12px", boxSizing: "border-box",
                background: "var(--input-bg)", color: "var(--input-text)",
                border: "1px solid var(--input-border)", borderRadius: 8, fontSize: 13,
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Peserta (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={invites}
              onChange={(e) => setInvites(e.target.value)}
              placeholder="email1@cmlabs.co, klien@company.com"
              style={{
                width: "100%", padding: "9px 12px", boxSizing: "border-box",
                background: "var(--input-bg)", color: "var(--input-text)",
                border: "1px solid var(--input-border)", borderRadius: 8, fontSize: 13,
              }}
            />
          </div>
        </>
      )}

      {/* Isi / Catatan (Rich Text) */}
      <RichTextEditor
        label={type === "MEETING" ? "Agenda" : "Catatan"}
        value={content}
        onChange={setContent}
        placeholder={
          type === "CALL"    ? "Hasil telepon, poin penting yang dibahas..." :
          type === "MEETING" ? "Agenda meeting, topik yang akan dibahas..." :
          type === "TASK"    ? "Deskripsi tugas, langkah-langkah yang perlu dilakukan..." :
          "Tulis catatan di sini..."
        }
        minHeight={80}
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={{
          padding: "9px 18px", background: "var(--bg-card2)",
          border: "1px solid var(--border)", borderRadius: 8,
          fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer",
        }}>
          Batal
        </button>
        <button type="submit" disabled={loading} style={{
          padding: "9px 20px",
          background: loading ? "var(--border)" : `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`,
          color: loading ? "var(--text-muted)" : "#fff",
          border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : `0 3px 12px ${cfg.color}40`,
        }}>
          {loading ? "Menyimpan..." : `Simpan ${cfg.label}`}
        </button>
      </div>
    </form>
  )
}