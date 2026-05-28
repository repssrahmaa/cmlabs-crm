export type LeadStatus =
  | "APPROACH"
  | "COLD_LEAD"
  | "DECK_REQUEST"
  | "MEETING"
  | "DEAL"
  | "RECYCLE"

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH"

export interface Lead {
  id:             string
  title:          string
  clientName:     string
  clientEmail?:   string | null
  clientPhone?:   string | null
  clientCompany?: string | null
  clientPosition?: string | null  // ← BARU
  clientLinkedIn?: string | null  // ← BARU
  clientNotes?:   string | null   // ← BARU
  value?:         number | null
  source?:        string | null
  description?:   string | null
  status:         LeadStatus
  priority:       LeadPriority
  assignedToId?:  string | null
  closedAt?:      string | null
  createdAt:      string
  updatedAt:      string
  assignedTo?:    { id: string; name: string; avatar?: string | null; role: string } | null
  createdBy?:     { id: string; name: string } | null
  _count:         { activities: number }
}

export interface Activity {
  id:          string
  type:        ActivityType
  title:       string
  content?:    string | null
  description?: string | null
  isDone:      boolean
  dueDate?:    string | null
  meetStart?:  string | null   // ← BARU
  meetEnd?:    string | null   // ← BARU
  meetInvites?: string[]       // ← BARU
  metadata?:   Record<string, any> | null
  userId:      string
  leadId:      string
  createdAt:   string
  user?:       { id: string; name: string; avatar?: string | null }
}

export type ActivityType =
  | "INTERNAL_NOTE"
  | "EMAIL_SENT"
  | "EMAIL_RECEIVED"
  | "CALL"
  | "MEETING"
  | "TASK"
  | "NOTE"

// ── Kanban Columns — 6 kategori baru ──────────────────────────
export const KANBAN_COLUMNS: {
  id:     LeadStatus
  label:  string
  color:  string
  bg:     string
  desc:   string
}[] = [
  {
    id: "APPROACH", label: "Approach",
    color: "#6366f1", bg: "#eef2ff",
    desc: "Lead terkirim, listing awal",
  },
  {
    id: "COLD_LEAD", label: "Cold Lead",
    color: "#4B9EF3", bg: "#eff6ff",
    desc: "Lead sudah membalas",
  },
  {
    id: "DECK_REQUEST", label: "Deck Request",
    color: "#f59e0b", bg: "#fffbeb",
    desc: "Client meminta deck/proposal",
  },
  {
    id: "MEETING", label: "Meeting",
    color: "#8b5cf6", bg: "#f5f3ff",
    desc: "Tahap presentasi/meeting",
  },
  {
    id: "DEAL", label: "Deal",
    color: "#10b981", bg: "#ecfdf5",
    desc: "Deal berhasil / closing",
  },
  {
    id: "RECYCLE", label: "Recycle",
    color: "#94a3b8", bg: "#f8fafc",
    desc: "Gagal, bisa di-approach ulang",
  },
]

export const STATUS_LABEL: Record<LeadStatus, string> = {
  APPROACH:     "Approach",
  COLD_LEAD:    "Cold Lead",
  DECK_REQUEST: "Deck Request",
  MEETING:      "Meeting",
  DEAL:         "Deal",
  RECYCLE:      "Recycle",
}

export const STATUS_COLOR: Record<LeadStatus, string> = {
  APPROACH:     "#6366f1",
  COLD_LEAD:    "#4B9EF3",
  DECK_REQUEST: "#f59e0b",
  MEETING:      "#8b5cf6",
  DEAL:         "#10b981",
  RECYCLE:      "#94a3b8",
}

export const PRIORITY_LABEL: Record<LeadPriority, string> = {
  LOW: "Rendah", MEDIUM: "Sedang", HIGH: "Tinggi",
}

export const PRIORITY_COLOR: Record<LeadPriority, string> = {
  LOW: "#94a3b8", MEDIUM: "#f59e0b", HIGH: "#ef4444",
}

// Probability per status untuk forecasting
export const STATUS_PROBABILITY: Record<LeadStatus, number> = {
  APPROACH:     0.10,
  COLD_LEAD:    0.20,
  DECK_REQUEST: 0.35,
  MEETING:      0.60,
  DEAL:         1.00,
  RECYCLE:      0.05,
}