import { auth } from "@/lib/auth"
import type { RoleType } from "@/lib/permissions"

interface RoleGuardProps {
  children:     React.ReactNode
  allow?:       RoleType[]
  deny?:        RoleType[]
  fallback?:    React.ReactNode
  redirectTo?:  string
  requireAuth?: boolean
}

// ── Server Component Guard ─────────────────────────────────────
export default async function RoleGuard({
  children,
  allow,
  deny,
  fallback    = null,
  requireAuth = true,
}: RoleGuardProps) {
  const session  = await auth()
  const userRole = session?.user?.role as RoleType | undefined

  if (requireAuth && !session?.user) {
    return null
  }

  if (!userRole) {
    return <>{fallback}</>
  }

  // Cek deny list
  if (deny && deny.length > 0 && deny.includes(userRole)) {
    return <>{fallback}</>
  }

  // Cek allow list
  if (allow && allow.length > 0 && !allow.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ── Named exports untuk shorthand guards ──────────────────────
// Ini yang dibutuhkan Sidebar.tsx dan komponen lain

export async function CanAccessForecasting({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      allow={["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER"]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

export async function CanAccessTeam({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      allow={["SUPER_ADMIN", "SALES_MANAGER"]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

export async function CanDeleteLead({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      allow={["SUPER_ADMIN", "SALES_MANAGER"]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

export async function CanGenerateDocument({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      allow={["SUPER_ADMIN", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

export async function CanDeleteUser({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      allow={["SUPER_ADMIN"]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

export async function SuperAdminOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard allow={["SUPER_ADMIN"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export async function ManagementOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard
      allow={["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER"]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

export async function NotViewer({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <RoleGuard deny={["VIEWER"]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}