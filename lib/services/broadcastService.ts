import { broadcastUpdate, broadcastToUser } from "@/app/api/realtime/route"

// ── Event types ────────────────────────────────────────────────
export type RealtimeEvent =
  | "lead:created"
  | "lead:updated"
  | "lead:deleted"
  | "activity:created"
  | "activity:updated"
  | "activity:deleted"
  | "user:created"
  | "user:updated"
  | "dashboard:refresh"
  | "forecast:refresh"

// ── Broadcast lead change ke semua user ───────────────────────
export function notifyLeadChange(
  event:  RealtimeEvent,
  payload: {
    leadId:      string
    assignedToId?: string | null
    status?:     string
    updatedBy:   string
  }
) {
  broadcastUpdate(event, {
    ...payload,
    timestamp: new Date().toISOString(),
  })
}

// ── Broadcast dashboard refresh ───────────────────────────────
export function notifyDashboardRefresh(triggeredBy: string) {
  broadcastUpdate("dashboard:refresh", {
    triggeredBy,
    timestamp: new Date().toISOString(),
  })
}

// ── Broadcast forecast refresh ────────────────────────────────
export function notifyForecastRefresh(triggeredBy: string) {
  broadcastUpdate("forecast:refresh", {
    triggeredBy,
    timestamp: new Date().toISOString(),
  })
}

// ── Notify specific user ───────────────────────────────────────
export function notifyUser(
  userId: string,
  event:  RealtimeEvent,
  data:   Record<string, unknown>
) {
  broadcastToUser(userId, event, {
    ...data,
    timestamp: new Date().toISOString(),
  })
}