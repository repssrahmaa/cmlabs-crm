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

// ── SVG Nav Icons ──────────────────────────────────────────────
const NavIcons = {
  Dashboard: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Leads: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Mail: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Chart: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  Report: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Star: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Team: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Profile: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Guide: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
}

function NavItem({ href, label, Icon, isActive }: {
  href: string; label: string; Icon: React.FC; isActive: boolean
}) {
  return (
    <Link href={href} style={{
      display:        "flex",
      alignItems:     "center",
      gap:            10,
      padding:        "9px 12px",
      borderRadius:   10,
      marginBottom:   2,
      textDecoration: "none",
      fontSize:       13,
      fontWeight:     isActive ? 600 : 400,
      color:          isActive ? "#fff" : "rgba(255,255,255,0.45)",
      background:     isActive
        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
        : "transparent",
      transition:     "all 0.15s",
      boxShadow:      isActive ? "0 3px 10px rgba(59,130,246,0.35)" : "none",
    }}>
      <span style={{
        flexShrink: 0,
        opacity:    isActive ? 1 : 0.6,
        color:      isActive ? "#fff" : "rgba(255,255,255,0.6)",
      }}>
        <Icon />
      </span>
      <span>{label}</span>
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

  // Build sidebar links
  const SIDEBAR_LINKS = [
    { href: "/dashboard",        label: "Dashboard",     Icon: NavIcons.Dashboard, show: true },
    { href: "/leads",            label: "Leads",         Icon: NavIcons.Leads,     show: true },
    { href: "/mails",            label: "Komunikasi",    Icon: NavIcons.Mail,      show: is("SUPER_ADMIN","SALES_MANAGER","ACCOUNT_EXECUTIVE","EXECUTIVE") },
    { href: "/forecasting",      label: "Forecasting",   Icon: NavIcons.Chart,     show: canAccessForecasting },
    { href: "/reports",          label: "Laporan",       Icon: NavIcons.Report,    show: canAccessReports },
    { href: "/reports/personal", label: "Performa Saya", Icon: NavIcons.Star,      show: is("SALES_MANAGER","ACCOUNT_EXECUTIVE") && canAccessReports },
    { href: "/team",             label: "Tim",           Icon: NavIcons.Team,      show: canAccessTeam },
    { href: "/profile",          label: "Profil",        Icon: NavIcons.Profile,   show: true },
    { href: "/uat-guide",        label: "Panduan UAT",   Icon: NavIcons.Guide,     show: true },
  ]

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

        {SIDEBAR_LINKS.filter((l) => l.show).map((link) => {
          // Insert section labels before specific items
          const sections: Record<string, string> = {
            "/forecasting": "Analitik",
            "/team":        "Manajemen",
            "/profile":     "Akun",
          }
          return (
            <div key={link.href}>
              {sections[link.href] && <SectionLabel label={sections[link.href]} />}
              <NavItem
                href={link.href}
                label={link.label}
                Icon={link.Icon}
                isActive={isActive(link.href)}
              />
            </div>
          )
        })}
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