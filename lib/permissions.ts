export type RoleType =
  | "ADMIN"
  | "EXECUTIVE"
  | "SALES_MANAGER"
  | "ACCOUNT_EXECUTIVE"

export type ActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "assign"

export type ResourceType =
  | "lead"
  | "activity"
  | "user"
  | "report"
  | "document"
  | "forecast"
  | "dashboard"

export type PermissionScope =
  | "FULL"
  | "WRITE"
  | "OWN_WRITE"   // bisa lihat semua, tapi edit hanya milik sendiri
  | "VIEW"
  | "NONE"

// ── Runtime constants ─────────────────────────────────────────
export const ALL_ROLES: RoleType[] = [
  "ADMIN",
  "EXECUTIVE",
  "SALES_MANAGER",
  "ACCOUNT_EXECUTIVE"
]

// ── Permission Matrix ─────────────────────────────────────────
//
// ADMIN     → FULL semua
// EXECUTIVE       → VIEW semua (bisa lihat semua fitur, tidak bisa edit)
// SALES_MANAGER   → FULL lead/activity/doc, WRITE user (no delete/role change)
// ACCOUNT_EXECUTIVE → VIEW semua lead (sama isinya), OWN_WRITE untuk edit

export const ROLE_PERMISSIONS: Record<RoleType, Record<ResourceType, PermissionScope>> = {
  ADMIN: {
    dashboard: "FULL",
    forecast:  "FULL",
    lead:      "FULL",
    activity:  "FULL",
    user:      "FULL",
    report:    "FULL",
    document:  "FULL",
  },
  EXECUTIVE: {
    dashboard: "VIEW",   // lihat semua
    forecast:  "VIEW",   // lihat semua forecast
    lead:      "VIEW",   // lihat semua lead, tidak bisa edit
    activity:  "VIEW",   // lihat semua timeline
    user:      "VIEW",   // lihat tim
    report:    "VIEW",   // lihat semua laporan
    document:  "VIEW",   // lihat semua dokumen
  },
  SALES_MANAGER: {
    dashboard: "FULL",
    forecast:  "FULL",
    lead:      "FULL",   // CRUD semua lead + assign
    activity:  "FULL",   // CRUD semua activity
    user:      "WRITE",  // tambah/edit/toggle aktif, tidak bisa hapus/ganti role
    report:    "FULL",
    document:  "FULL",
  },
  ACCOUNT_EXECUTIVE: {
    dashboard: "VIEW",      // lihat semua data sama seperti role lain
    forecast:  "VIEW",      // lihat semua forecast
    lead:      "OWN_WRITE", // lihat semua lead, edit hanya yang ditugaskan
    activity:  "OWN_WRITE", // lihat semua timeline, tambah/edit hanya di lead sendiri
    user:      "NONE",
    report:    "VIEW",      // lihat laporan (dibatasi di UI ke personal stats)
    document:  "OWN_WRITE", // generate dari lead sendiri
  },
}

// ── Scope → Actions mapping ───────────────────────────────────
const SCOPE_ACTIONS: Record<PermissionScope, ActionType[]> = {
  FULL:      ["create", "read", "update", "delete", "assign"],
  WRITE:     ["create", "read", "update"],
  OWN_WRITE: ["create", "read", "update"],  // read = semua, write = own saja
  VIEW:      ["read"],
  NONE:      [],
}

// ── Core hasPermission ─────────────────────────────────────────
export function hasPermission(
  role:      RoleType,
  action:    ActionType,
  resource:  ResourceType,
  context?: {
    ownerId?:       string | null
    currentUserId?: string
  }
): boolean {
  const scope = ROLE_PERMISSIONS[role]?.[resource]
  if (!scope || scope === "NONE") return false

  const allowedActions = SCOPE_ACTIONS[scope]
  if (!allowedActions.includes(action)) return false

  // OWN_WRITE scope:
  // - READ → selalu boleh (lihat semua)
  // - CREATE/UPDATE/DELETE → hanya kalau ownerId cocok
  if (scope === "OWN_WRITE") {
    if (action === "read") return true   // ← bisa lihat semua

    if (action === "create") return true  // ← bisa buat baru

    // Untuk update/delete → cek ownership
    if (!context?.currentUserId) return false
    if (context.ownerId === null || context.ownerId === undefined) return false
    return context.currentUserId === context.ownerId
  }

  // SALES_MANAGER tidak bisa delete user atau ganti role
  if (role === "SALES_MANAGER" && resource === "user" && action === "delete") {
    return false
  }

  return true
}

// ── Route access ──────────────────────────────────────────────
const ROUTE_ALLOW_MAP: Record<string, RoleType[]> = {
  "/dashboard":   ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  "/leads":       ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  "/forecasting": ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  "/mails":       ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  "/team":        ["ADMIN", "EXECUTIVE", "SALES_MANAGER"],
  "/reports":     ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
  "/profile":     ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"],
}

export function canAccessRoute(role: RoleType, route: string): boolean {
  const allowedRoles = ROUTE_ALLOW_MAP[route]
  if (!allowedRoles) return true
  return allowedRoles.includes(role)
}

// ── Role hierarchy ────────────────────────────────────────────
export const ROLE_HIERARCHY: Record<RoleType, number> = {
  ADMIN:       1,
  EXECUTIVE:         2,
  SALES_MANAGER:     3,
  ACCOUNT_EXECUTIVE: 4
}

export function canManage(actorRole: RoleType, targetRole: RoleType): boolean {
  return ROLE_HIERARCHY[actorRole] < ROLE_HIERARCHY[targetRole]
}

// ── UI Permissions ────────────────────────────────────────────
export const UI_PERMISSIONS = {
  // Lead actions
  canCreateLead:   (role: RoleType) =>
    ["ADMIN", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role),

  canDeleteLead:   (role: RoleType) =>
    ["ADMIN", "SALES_MANAGER"].includes(role),

  canAssignLead:   (role: RoleType) =>
    ["ADMIN", "SALES_MANAGER"].includes(role),

  canEditLead:     (role: RoleType, ownerId?: string | null, userId?: string) => {
    if (["ADMIN", "SALES_MANAGER"].includes(role)) return true
    if (role === "ACCOUNT_EXECUTIVE") {
      return !!userId && !!ownerId && userId === ownerId
    }
    return false
  },

  // Navigation access
  canAccessForecasting: (role: RoleType) =>
    ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role),

  canAccessTeam:   (role: RoleType) =>
    ["ADMIN", "EXECUTIVE", "SALES_MANAGER"].includes(role),

  canAccessReports: (role: RoleType) =>
    ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role),

  canAccessMails:  (role: RoleType) =>
    ["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role),

  // Document & report
  canGenerateDoc:  (role: RoleType) =>
    ["ADMIN", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role),

  // User management
  canDeleteUser:   (role: RoleType) => role === "ADMIN",
  canChangeRole:   (role: RoleType) => role === "ADMIN",

  // Read-only roles
  isReadOnly:      (role: RoleType) =>
    ["EXECUTIVE"].includes(role),
}