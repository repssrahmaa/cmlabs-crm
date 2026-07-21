// ── Role definitions untuk RBAC sistem CMLabs CRM ────────────

export type RoleType =
  | "ADMIN"
  | "EXECUTIVE"
  | "SALES_MANAGER"
  | "ACCOUNT_EXECUTIVE"
// ── 1. ROLES array — untuk UI badges dan display ──────────────

export interface RoleConfig {
  value:       RoleType
  label:       string
  description: string
  color:       string
  bg:          string
}

export const ROLES: RoleConfig[] = [
  {
    value:       "ADMIN",
    label:       "Admin",
    description: "Akses penuh ke seluruh sistem termasuk konfigurasi dan manajemen user",
    color:       "#dc2626",
    bg:          "#fef2f2",
  },
  {
    value:       "EXECUTIVE",
    label:       "Executive",
    description: "Akses read-only ke semua data untuk keperluan monitoring dan keputusan strategis",
    color:       "#7c3aed",
    bg:          "#f5f3ff",
  },
  {
    value:       "SALES_MANAGER",
    label:       "Sales Manager",
    description: "Mengelola tim sales, melihat semua leads, dan mengakses laporan performa",
    color:       "#2563eb",
    bg:          "#eff6ff",
  },
  {
    value:       "ACCOUNT_EXECUTIVE",
    label:       "Account Executive",
    description: "Mengelola leads yang ditugaskan dan berkomunikasi dengan klien",
    color:       "#059669",
    bg:          "#ecfdf5",
  },
]

// ── 2. ROLE_HIERARCHY — level 1 paling tinggi ─────────────────

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  ADMIN:       1,
  EXECUTIVE:         2,
  SALES_MANAGER:     3,
  ACCOUNT_EXECUTIVE: 4,
}

// ── 3. canManage — cek apakah actor bisa manage target ────────
// Returns true hanya jika level actor LEBIH RENDAH dari target
// (angka lebih kecil = level lebih tinggi)
// Contoh: SALES_MANAGER (3) TIDAK bisa manage EXECUTIVE (2)
//         ADMIN (1) BISA manage semua role

export function canManage(
  actorRole:  RoleType,
  targetRole: RoleType
): boolean {
  const actorLevel  = ROLE_HIERARCHY[actorRole]
  const targetLevel = ROLE_HIERARCHY[targetRole]

  // Actor harus punya level lebih tinggi (angka lebih kecil)
  // dari target untuk bisa manage
  return actorLevel < targetLevel
}

// ── 4. Helper functions ───────────────────────────────────────

// Cek apakah role punya akses admin (bisa manage user)
export function isAdminLevel(role: RoleType): boolean {
  return ROLE_HIERARCHY[role] <= ROLE_HIERARCHY["SALES_MANAGER"]
}

// Cek apakah role bisa mengakses laporan
export function canAccessReports(role: RoleType): boolean {
  return ROLE_HIERARCHY[role] <= ROLE_HIERARCHY["SALES_MANAGER"]
}

// Cek apakah role bisa menghapus data
export function canDelete(role: RoleType): boolean {
  return role === "ADMIN" || role === "SALES_MANAGER"
}

// Ambil config role berdasarkan value
export function getRoleConfig(role: RoleType): RoleConfig {
  return ROLES.find((r) => r.value === role) ?? ROLES[3]
}

// Ambil semua role yang bisa dikelola oleh actor
export function getManageableRoles(actorRole: RoleType): RoleConfig[] {
  return ROLES.filter((r) => canManage(actorRole, r.value))
}