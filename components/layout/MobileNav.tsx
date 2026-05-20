"use client"

import { useState }       from "react"
import Link               from "next/link"
import { usePathname }    from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRoleGuard }   from "@/hooks/useRoleGuard"
import ThemeToggle        from "@/components/layout/ThemeToggle"

// ── SVG Icons (same as sidebar) ────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Leads: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Forecast: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Report: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Performance: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Team: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Guide: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Bars: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6"  y2="18"/>
      <line x1="6"  y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

function MobileNavItem({ href, label, Icon, isActive, badge, onClick }: {
  href: string; label: string; Icon: React.FC
  isActive: boolean; badge?: string; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            10,
        padding:        "10px 14px",
        borderRadius:   9,
        marginBottom:   2,
        textDecoration: "none",
        fontSize:       13,
        fontWeight:     isActive ? 600 : 400,
        color:          isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
        background:     isActive
          ? "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(29,78,216,0.85))"
          : "transparent",
        boxShadow:      isActive ? "0 2px 10px rgba(59,130,246,0.3)" : "none",
        transition:     "all 0.15s",
      }}
    >
      <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55, display: "flex", alignItems: "center" }}>
        <Icon />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999,
          background: isActive ? "rgba(255,255,255,0.25)" : "#f59e0b", color: "#fff",
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
      fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)",
      letterSpacing: "0.12em", textTransform: "uppercase",
      padding: "12px 14px 5px",
    }}>
      {label}
    </div>
  )
}

export default function MobileNav() {
  const [open, setOpen]   = useState(false)
  const pathname          = usePathname()
  const { data: session } = useSession()
  const { role, is, canAccessForecasting, canAccessTeam, canAccessReports } = useRoleGuard()

  const close = () => setOpen(false)

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator", EXECUTIVE: "Executive",
    SALES_MANAGER: "Sales Manager", ACCOUNT_EXECUTIVE: "Account Executive", VIEWER: "Viewer",
  }
  const ROLE_COLOR: Record<string, string> = {
    SUPER_ADMIN: "#ef4444", EXECUTIVE: "#8b5cf6",
    SALES_MANAGER: "#3b82f6", ACCOUNT_EXECUTIVE: "#10b981", VIEWER: "#94a3b8",
  }

  const userRole      = role ?? "VIEWER"
  const userRoleLabel = ROLE_LABEL[userRole] ?? userRole
  const userRoleColor = ROLE_COLOR[userRole] ?? "#94a3b8"
  const userName      = session?.user?.name ?? "User"
  const userInitial   = userName.charAt(0).toUpperCase()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      {/* ── Mobile Top Bar ──────────────────────────── */}
      <div className="mobile-topbar" style={{
        background: "linear-gradient(90deg, #07111e, #0a1628)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(59,130,246,0.4)",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f6fc", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              CMLabs CRM
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sales Management
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle compact />
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              cursor: "pointer", color: "rgba(255,255,255,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            <Icons.Bars />
          </button>
        </div>
      </div>

      {/* ── Drawer ──────────────────────────────────── */}
      {open && (
        <>
          {/* Overlay */}
          <div
            onClick={close}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 60, backdropFilter: "blur(2px)",
            }}
          />

          {/* Drawer panel — same structure as sidebar */}
          <div style={{
            position:      "fixed",
            top:           0, right: 0, bottom: 0,
            width:         280,
            background:    "linear-gradient(180deg, #07111e 0%, #0a1628 60%, #060e1a 100%)",
            zIndex:        70,
            display:       "flex",
            flexDirection: "column",
            boxShadow:     "-4px 0 24px rgba(0,0,0,0.5)",
            animation:     "slideInRight 0.25s ease",
          }}>

            {/* Drawer Header */}
            <div style={{
              padding: "18px 16px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 3px 12px rgba(59,130,246,0.4)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f6fc", letterSpacing: "-0.01em" }}>CMLabs CRM</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Sales Management</div>
                </div>
              </div>
              <button
                onClick={close}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer", color: "rgba(255,255,255,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icons.X />
              </button>
            </div>

            {/* User profile card */}
            <div style={{
              margin: "10px 12px 4px",
              padding: "11px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `linear-gradient(135deg, ${userRoleColor}30, ${userRoleColor}15)`,
                  border: `1px solid ${userRoleColor}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: userRoleColor, flexShrink: 0,
                }}>
                  {userInitial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e8f0f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName}
                  </div>
                  <div style={{
                    display: "inline-flex", marginTop: 3,
                    padding: "1px 6px", borderRadius: 999,
                    background: userRoleColor + "18", border: `1px solid ${userRoleColor}30`,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: userRoleColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {userRoleLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav Links — same structure as sidebar */}
            <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto" }}>
              <SectionLabel label="Menu Utama" />
              <MobileNavItem href="/dashboard"   label="Dashboard"    Icon={Icons.Dashboard}   isActive={isActive("/dashboard", true)} onClick={close} />
              <MobileNavItem href="/leads"       label="Leads"        Icon={Icons.Leads}       isActive={isActive("/leads")}           onClick={close} />
              {is("SUPER_ADMIN","SALES_MANAGER","ACCOUNT_EXECUTIVE","EXECUTIVE") && (
                <MobileNavItem href="/mails"     label="Komunikasi"   Icon={Icons.Mail}        isActive={isActive("/mails")}           onClick={close} />
              )}

              {(canAccessForecasting || canAccessReports) && (
                <SectionLabel label="Analitik" />
              )}
              {canAccessForecasting && (
                <MobileNavItem href="/forecasting"        label="Forecasting"       Icon={Icons.Forecast}     isActive={isActive("/forecasting")}        onClick={close} />
              )}
              {canAccessReports && (
                <MobileNavItem href="/reports"            label="Laporan & Dokumen" Icon={Icons.Report}       isActive={isActive("/reports")}            onClick={close} />
              )}
              {is("SALES_MANAGER","ACCOUNT_EXECUTIVE") && canAccessReports && (
                <MobileNavItem href="/reports/personal"   label="Performa Saya"     Icon={Icons.Performance}  isActive={isActive("/reports/personal")}   onClick={close} />
              )}

              <SectionLabel label="Manajemen" />
              {canAccessTeam && (
                <MobileNavItem href="/team"    label="Tim"         Icon={Icons.Team}    isActive={isActive("/team")}         onClick={close} />
              )}
              <MobileNavItem href="/profile" label="Profil Saya" Icon={Icons.Profile} isActive={isActive("/profile", true)} onClick={close} />

              <SectionLabel label="Pengujian" />
              <MobileNavItem href="/uat-guide" label="Panduan UAT" Icon={Icons.Guide} isActive={isActive("/uat-guide")} badge="UAT" onClick={close} />
            </nav>

            {/* Footer */}
            <div style={{
              padding: "10px 10px 18px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0, display: "flex", flexDirection: "column", gap: 7,
            }}>
              <div style={{ padding: "0 4px" }}>
                <ThemeToggle />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "9px 12px",
                  background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: 9, color: "rgba(248,113,113,0.8)",
                  fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background  = "rgba(239,68,68,0.15)"
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
                  e.currentTarget.style.color       = "#f87171"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background  = "rgba(239,68,68,0.07)"
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"
                  e.currentTarget.style.color       = "rgba(248,113,113,0.8)"
                }}
              >
                <Icons.Logout />
                Keluar dari Akun
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}