export type LeadStatus =
  | "LEAD_IN"
  | "CONTACT_MADE"
  | "NEEDS_IDENTIFIED"
  | "PROPOSAL_MADE"
  | "NEGOTIATION"
  | "CONTRACT_SENT"
  | "WON"
  | "LOST"

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH"

export interface Lead {
  id:            string
  title:         string
  clientName:    string
  clientEmail:   string | null
  clientPhone:   string | null
  clientCompany: string | null
  status:        LeadStatus
  priority:      LeadPriority
  value:         number | null
  description:   string | null
  source:        string | null
  createdAt:     string
  updatedAt:     string
  assignedTo:    { id: string; name: string; avatar: string | null } | null
  createdBy:     { id: string; name: string }
  _count:        { activities: number }
}

export const KANBAN_COLUMNS: {
  id: LeadStatus
  label: string
  color: string
  bg: string
}[] = [
  { id: "LEAD_IN",          label: "Lead Masuk",       color: "#6366f1", bg: "#eef2ff" },
  { id: "CONTACT_MADE",     label: "Dihubungi",        color: "#3b82f6", bg: "#eff6ff" },
  { id: "NEEDS_IDENTIFIED", label: "Kebutuhan",        color: "#0ea5e9", bg: "#f0f9ff" },
  { id: "PROPOSAL_MADE",    label: "Proposal",         color: "#f59e0b", bg: "#fffbeb" },
  { id: "NEGOTIATION",      label: "Negosiasi",        color: "#f97316", bg: "#fff7ed" },
  { id: "CONTRACT_SENT",    label: "Kontrak",          color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "WON",              label: "Berhasil",         color: "#10b981", bg: "#ecfdf5" },
  { id: "LOST",             label: "Gagal",            color: "#ef4444", bg: "#fef2f2" },
]

export const PRIORITY_COLOR: Record<LeadPriority, string> = {
  LOW:    "#10b981",
  MEDIUM: "#f59e0b",
  HIGH:   "#ef4444",
}

export const PRIORITY_LABEL: Record<LeadPriority, string> = {
  LOW:    "Rendah",
  MEDIUM: "Sedang",
  HIGH:   "Tinggi",
}