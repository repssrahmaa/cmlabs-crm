"use client"

import Link            from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRoleGuard } from "@/hooks/useRoleGuard"
import { useTheme }    from "@/hooks/useTheme"
import type { RoleType } from "@/lib/permissions"

const ROLE_LABEL: Record<RoleType, string> = {
  SUPER_ADMIN: "Super Admin", EXECUTIVE: "Executive",
  SALES_MANAGER: "Sales Manager",
  ACCOUNT_EXECUTIVE: "Account Executive", VIEWER: "Viewer",
}

const ROLE_COLOR: Record<RoleType, string> = {
  SUPER_ADMIN: "#ef4444", EXECUTIVE: "#8b5cf6",
  SALES_MANAGER: "#4B9EF3",
  ACCOUNT_EXECUTIVE: "#10b981", VIEWER: "#64748b",
}

function NavItem({ href, label, icon, isActive, badge }: {
  href: string; label: string; icon: string
  isActive: boolean; badge?: number
}) {
  return (
    <Link href={href} style={{
      display:        "flex", alignItems: "center",
      justifyContent: "space-between",
      padding:        "9px 12px",
      borderRadius:   10,
      marginBottom:   2,
      textDecoration: "none",
      fontSize:       13,
      fontWeight:     isActive ? 600 : 400,
      color:          isActive ? "#f8fafc" : "rgba(255,255,255,0.5)",
      background:     isActive
        ? "linear-gradient(135deg, #4B9EF3, #1a6fd4)"
        : "transparent",
      transition:     "all 0.15s",
      boxShadow:      isActive ? "0 4px 12px rgba(75,158,243,0.35)" : "none",
    }}
    onMouseEnter={(e) => {
      if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"
    }}
    onMouseLeave={(e) => {
      if (!isActive) e.currentTarget.style.background = "transparent"
    }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize:       15,
          width:          22, textAlign: "center",
          filter:         isActive ? "none" : "grayscale(0.3) opacity(0.7)",
        }}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge != null && badge > 0 && (
        <span style={{
          fontSize:     10, fontWeight: 700,
          padding:      "1px 6px", borderRadius: 999,
          background:   isActive ? "rgba(255,255,255,0.25)" : "#4B9EF3",
          color:        "#fff",
        }}>
          {badge}
        </span>
      )}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize:      9, fontWeight: 700,
      color:         "rgba(255,255,255,0.2)",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      padding:       "14px 12px 4px",
    }}>
      {label}
    </div>
  )
}

export default function Sidebar() {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const { isDark }        = useTheme()
  const { role, isLoading, is, canAccessForecasting, canAccessTeam, canAccessReports } = useRoleGuard()

  const isActive = (href: string): boolean => {
    if (href === "/dashboard")        return pathname === "/dashboard"
    if (href === "/reports")          return pathname === "/reports"
    if (href === "/reports/personal") return pathname === "/reports/personal"
    if (href === "/profile")          return pathname === "/profile"
    return pathname.startsWith(href)
  }

  const roleCfg = role ? ROLE_COLOR[role] : "#4B9EF3"

  if (isLoading) return (
    <aside style={{
      width: 240, position: "fixed",
      top: 0, left: 0, bottom: 0, zIndex: 40,
      background: "#0d1117",
    }} />
  )

  return (
    <aside style={{
      width:         240,
      position:      "fixed",
      top:           0, left: 0, bottom: 0,
      zIndex:        40,
      display:       "flex",
      flexDirection: "column",
      background:    "linear-gradient(180deg, #0d1117 0%, #111827 100%)",
      borderRight:   "1px solid rgba(255,255,255,0.06)",
      overflowY:     "auto",
    }}>

      {/* ── Logo ──────────────────────────────────────── */}
      <div style={{
        padding:      "20px 16px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width:        36, height: 36,
            borderRadius: 10,
            background:   "linear-gradient(135deg, #4B9EF3, #1a6fd4)",
            display:      "flex", alignItems: "center",
            justifyContent: "center",
            fontSize:     16, fontWeight: 800,
            color:        "#fff",
            boxShadow:    "0 4px 12px rgba(75,158,243,0.4)",
          }}>
            C
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              CMLabs
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              CRM System
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "8px 10px" }}>
        <SectionLabel label="Menu Utama" />
        <NavItem href="/dashboard" label="Dashboard"   icon="📊" isActive={isActive("/dashboard")} />
        <NavItem href="/leads"     label="Leads"       icon="🎯" isActive={isActive("/leads")} />

        {(canAccessForecasting || canAccessReports) && (
          <SectionLabel label="Analitik" />
        )}

        {canAccessForecasting && (
          <NavItem href="/forecasting" label="Forecasting" icon="📈" isActive={isActive("/forecasting")} />
        )}

        {canAccessReports && (
          <NavItem href="/reports" label="Laporan & Dokumen" icon="📋" isActive={isActive("/reports")} />
        )}

        {is("SALES_MANAGER", "ACCOUNT_EXECUTIVE") && canAccessReports && (
          <NavItem href="/reports/personal" label="Performa Saya" icon="⭐" isActive={isActive("/reports/personal")} />
        )}

        {canAccessTeam && (
          <>
            <SectionLabel label="Manajemen" />
            <NavItem href="/team" label="Tim" icon="👥" isActive={isActive("/team")} />
          </>
        )}

        <SectionLabel label="Akun" />
        <NavItem href="/profile" label="Profil" icon="👤" isActive={isActive("/profile")} />
      </nav>

      {/* ── User Card ─────────────────────────────────── */}
      <div style={{
        margin:       "0 10px 12px",
        padding:      "12px",
        borderRadius: 12,
        background:   "rgba(255,255,255,0.04)",
        border:       "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          {/* Avatar */}
          <div style={{
            width:          32, height: 32,
            borderRadius:   "50%",
            background:     `linear-gradient(135deg, ${roleCfg}, ${roleCfg}99)`,
            display:        "flex", alignItems: "center",
            justifyContent: "center",
            fontSize:       13, fontWeight: 700, color: "#fff",
            flexShrink:     0,
            boxShadow:      `0 2px 8px ${roleCfg}50`,
          }}>
            {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: "#f8fafc",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {session?.user?.name}
            </div>
            <div style={{
              fontSize: 9, color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {role ? ROLE_LABEL[role] : ""}
            </div>
          </div>
          {/* Online dot */}
          <div style={{
            width:     8, height: 8,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 0 2px rgba(16,185,129,0.25)",
            flexShrink: 0,
          }} />
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width:        "100%",
            padding:      "7px",
            background:   "transparent",
            border:       "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color:        "rgba(255,255,255,0.4)",
            fontSize:     11, fontWeight: 500,
            cursor:       "pointer",
            display:      "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
            transition:   "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background   = "rgba(239,68,68,0.15)"
            e.currentTarget.style.borderColor  = "rgba(239,68,68,0.4)"
            e.currentTarget.style.color        = "#f87171"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background   = "transparent"
            e.currentTarget.style.borderColor  = "rgba(255,255,255,0.1)"
            e.currentTarget.style.color        = "rgba(255,255,255,0.4)"
          }}
        >
          <span style={{ fontSize: 12 }}>⎋</span>
          Keluar
        </button>
      </div>
    </aside>
  )
}