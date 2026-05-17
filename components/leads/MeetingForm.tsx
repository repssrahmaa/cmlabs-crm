"use client"

import { useState } from "react"
import RichTextEditor from "@/components/ui/RichTextEditor"

interface MeetingFormProps {
  leadEmail?:  string | null
  onSubmit:    (data: MeetingData) => Promise<void>
  onCancel:    () => void
}

export interface MeetingData {
  title:       string
  description: string
  startDate:   string
  startTime:   string
  endTime:     string
  invites:     string[]
  createMeet:  boolean
}

export default function MeetingForm({ leadEmail, onSubmit, onCancel }: MeetingFormProps) {
  const [title, setTitle]             = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate]     = useState("")
  const [startTime, setStartTime]     = useState("09:00")
  const [endTime, setEndTime]         = useState("10:00")
  const [inviteInput, setInviteInput] = useState("")
  const [invites, setInvites]         = useState<string[]>(leadEmail ? [leadEmail] : [])
  const [createMeet, setCreateMeet]   = useState(true)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  function addInvite() {
    const email = inviteInput.trim().toLowerCase()
    if (!email || invites.includes(email)) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid")
      return
    }
    setInvites((prev) => [...prev, email])
    setInviteInput("")
    setError("")
  }

  function removeInvite(email: string) {
    setInvites((prev) => prev.filter((e) => e !== email))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !startDate || !startTime || !endTime) {
      setError("Judul, tanggal, dan waktu wajib diisi")
      return
    }
    setLoading(true)
    try {
      await onSubmit({ title, description, startDate, startTime, endTime, invites, createMeet })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error && (
        <div style={{
          padding:      "10px 14px",
          background:   "var(--danger-pale)",
          border:       "1px solid rgba(239,68,68,0.2)",
          borderRadius: 8,
          fontSize:     13,
          color:        "var(--danger)",
        }}>
          {error}
        </div>
      )}

      {/* Judul Meeting */}
      <div>
        <label style={{
          display: "block", fontSize: 11, fontWeight: 700,
          color: "var(--text-muted)", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          Judul Meeting *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Presentasi Proposal SEO — PT ABC"
          required
          style={{
            width: "100%", padding: "9px 12px",
            background: "var(--input-bg)", color: "var(--input-text)",
            border: "1px solid var(--input-border)", borderRadius: 8,
            fontSize: 13, boxSizing: "border-box",
          }}
        />
      </div>

      {/* Tanggal & Waktu */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Tanggal *", type: "date", value: startDate, onChange: setStartDate },
          { label: "Mulai *", type: "time", value: startTime, onChange: setStartTime },
          { label: "Selesai *", type: "time", value: endTime, onChange: setEndTime },
        ].map((f) => (
          <div key={f.label}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--text-muted)", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {f.label}
            </label>
            <input
              type={f.type}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              required
              style={{
                width: "100%", padding: "9px 10px",
                background: "var(--input-bg)", color: "var(--input-text)",
                border: "1px solid var(--input-border)", borderRadius: 8,
                fontSize: 13, boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      {/* Deskripsi (Rich Text) */}
      <RichTextEditor
        label="Agenda Meeting"
        value={description}
        onChange={setDescription}
        placeholder="Tulis agenda, topik, atau catatan persiapan meeting..."
        minHeight={100}
      />

      {/* Undangan (Invitees) */}
      <div>
        <label style={{
          display: "block", fontSize: 11, fontWeight: 700,
          color: "var(--text-muted)", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          Undang Peserta
        </label>

        {/* Input tambah email */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            type="email"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInvite() } }}
            placeholder="email@cmlabs.co"
            style={{
              flex: 1, padding: "8px 12px",
              background: "var(--input-bg)", color: "var(--input-text)",
              border: "1px solid var(--input-border)", borderRadius: 8,
              fontSize: 13, boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={addInvite}
            style={{
              padding:      "8px 14px",
              background:   "var(--primary)",
              color:        "#fff",
              border:       "none", borderRadius: 8,
              fontSize:     12, fontWeight: 600, cursor: "pointer",
            }}
          >
            Tambah
          </button>
        </div>

        {/* Daftar invitees */}
        {invites.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {invites.map((email) => (
              <div key={email} style={{
                display:      "flex", alignItems: "center", gap: 6,
                padding:      "4px 10px",
                background:   "var(--primary-pale)",
                border:       "1px solid var(--primary-glow)",
                borderRadius: 999,
                fontSize:     12, color: "var(--primary)",
              }}>
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => removeInvite(email)}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", color: "var(--primary)",
                    fontSize: 14, lineHeight: 1, padding: 0,
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle Google Meet */}
      <div style={{
        display:      "flex", alignItems: "center",
        justifyContent: "space-between",
        padding:      "12px 16px",
        background:   createMeet ? "rgba(66,133,244,0.08)" : "var(--bg-card2)",
        border:       `1px solid ${createMeet ? "rgba(66,133,244,0.25)" : "var(--border)"}`,
        borderRadius: 10,
        cursor:       "pointer",
      }}
        onClick={() => setCreateMeet(!createMeet)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Google Meet icon (SVG) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M17.5 10.5V7.5C17.5 6.4 16.6 5.5 15.5 5.5H4.5C3.4 5.5 2.5 6.4 2.5 7.5v9c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-3l4 3v-9l-4 3z" fill="#00897B"/>
            <rect x="2.5" y="5.5" width="13" height="13" rx="2" fill="#00BCD4" opacity="0.3"/>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              Buat Google Meet
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Link meeting + undangan Google Calendar dikirim ke semua peserta
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          width:        44, height: 24,
          borderRadius: 999,
          background:   createMeet ? "#4285f4" : "var(--border-strong)",
          position:     "relative",
          transition:   "background 0.2s",
          flexShrink:   0,
        }}>
          <div style={{
            position:     "absolute",
            top:          3,
            left:         createMeet ? 23 : 3,
            width:        18, height: 18,
            borderRadius: "50%",
            background:   "#fff",
            boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
            transition:   "left 0.2s",
          }} />
        </div>
      </div>

      {createMeet && (
        <div style={{
          padding:      "10px 14px",
          background:   "rgba(66,133,244,0.06)",
          border:       "1px solid rgba(66,133,244,0.15)",
          borderRadius: 8,
          fontSize:     12,
          color:        "var(--text-secondary)",
          lineHeight:   1.6,
        }}>
          <strong style={{ color: "#4285f4" }}>Catatan:</strong> Link Google Meet dan undangan Google Calendar
          akan dikirimkan ke semua email peserta secara otomatis setelah meeting dijadwalkan.
          Pastikan akun Google yang digunakan memiliki izin untuk membuat event Calendar.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding:      "9px 18px",
            background:   "var(--bg-card2)",
            border:       "1px solid var(--border)",
            borderRadius: 8,
            fontSize:     13, fontWeight: 600,
            color:        "var(--text-secondary)",
            cursor:       "pointer",
          }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding:    "9px 20px",
            background: loading ? "var(--border)" : "linear-gradient(135deg, #4285f4, #1a6fd4)",
            color:      loading ? "var(--text-muted)" : "#fff",
            border:     "none", borderRadius: 8,
            fontSize:   13, fontWeight: 600,
            cursor:     loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Menjadwalkan..." : createMeet ? "Buat Meeting + Google Meet" : "Simpan Jadwal Meeting"}
        </button>
      </div>
    </form>
  )
}