"use client"

import Link               from "next/link"
import { usePathname }    from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRoleGuard }   from "@/hooks/useRoleGuard"

// ── SVG Icons ──────────────────────────────────────────────────
const NavIcons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Leads: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Forecast: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Report: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Performance: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
  Team: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

// ── NavItem ────────────────────────────────────────────────────
function NavItem({ href, label, Icon, isActive, badge }: {
  href:     string
  label:    string
  Icon:     React.FC
  isActive: boolean
  badge?:   string
}) {
  return (
    <Link
      href={href}
      className="nav-item"
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            10,
        padding:        "9px 12px",
        borderRadius:   9,
        marginBottom:   2,
        textDecoration: "none",
        fontSize:       13,
        fontWeight:     isActive ? 600 : 400,
        color:          isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
        background:     isActive
          ? "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(29,78,216,0.85))"
          : "transparent",
        transition:     "all 0.15s ease",
        boxShadow:      isActive ? "0 2px 10px rgba(59,130,246,0.3)" : "none",
        whiteSpace:     "nowrap",
        overflow:       "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)"
          e.currentTarget.style.color      = "rgba(255,255,255,0.75)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.color      = "rgba(255,255,255,0.45)"
        }
      }}
    >
      <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55, display: "flex", alignItems: "center" }}>
        <Icon />
      </span>
      <span className="nav-label" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      {badge && (
        <span style={{
          fontSize:     9,
          fontWeight:   800,
          padding:      "2px 6px",
          borderRadius: 999,
          background:   isActive ? "rgba(255,255,255,0.25)" : "#f59e0b",
          color:        "#fff",
          flexShrink:   0,
        }}>
          {badge}
        </span>
      )}
    </Link>
  )
}

// ── Section Label ──────────────────────────────────────────────
function NavSection({ label }: { label: string }) {
  return (
    <div
      className="nav-section"
      style={{
        fontSize:      9,
        fontWeight:    700,
        color:         "rgba(255,255,255,0.2)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding:       "14px 12px 6px",
        whiteSpace:    "nowrap",
      }}
    >
      {label}
    </div>
  )
}

// ── Main Sidebar ───────────────────────────────────────────────
export default function Sidebar() {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const {
    role, is,
    canAccessForecasting,
    canAccessTeam,
    canAccessReports,
  } = useRoleGuard()

  const ROLE_LABEL: Record<string, string> = {
    ADMIN:       "Administrator",
    EXECUTIVE:         "Executive",
    SALES_MANAGER:     "Sales Manager",
    ACCOUNT_EXECUTIVE: "Account Executive",
    VIEWER:            "Viewer",
  }
  const ROLE_COLOR: Record<string, string> = {
    ADMIN:       "#ef4444",
    EXECUTIVE:         "#8b5cf6",
    SALES_MANAGER:     "#3b82f6",
    ACCOUNT_EXECUTIVE: "#10b981",
    VIEWER:            "#94a3b8",
  }

  const userRole      = role ?? "VIEWER"
  const userRoleLabel = ROLE_LABEL[userRole] ?? userRole
  const userRoleColor = ROLE_COLOR[userRole] ?? "#94a3b8"
  const userName      = session?.user?.name  ?? "User"
  const userEmail     = session?.user?.email ?? ""
  const userInitial   = userName.charAt(0).toUpperCase()

  // Performa Saya: hanya tampil untuk SM dan AE, TAPI
  // pastikan tidak bertabrakan dengan Laporan & Dokumen
  // dengan meletakkannya SESUDAH Reports dalam urutan
  const showReports     = canAccessReports
  const showPersonal    = is("SALES_MANAGER", "ACCOUNT_EXECUTIVE") && canAccessReports
  const showForecasting = canAccessForecasting
  const showTeam        = canAccessTeam

  const isActive = (href: string, exact = false) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/")

  const reportsActive = isActive("/reports") && !isActive("/reports/personal")
  const personalActive = isActive("/reports/personal")

  return (
    <>
      <aside
        className="sidebar-desktop"
        style={{
          background:    "linear-gradient(180deg, #07111e 0%, #0a1628 60%, #060e1a 100%)",
          borderRight:   "1px solid rgba(255,255,255,0.06)",
          display:       "flex",
          flexDirection: "column",
          overflowY:     "auto",
          overflowX:     "hidden",
          height:        "100vh",
          /* width dikontrol CSS */
        }}
      >
        {/* ── Brand ──────────────────────────────────── */}
        <div style={{
          padding:      "18px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink:   0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width:          34, height: 34, borderRadius: 9,
              background:     "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display:        "flex", alignItems: "center", justifyContent: "center",
              flexShrink:     0,
              boxShadow:      "0 3px 12px rgba(59,130,246,0.4)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z"  stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5"             stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5"             stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="brand-text" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f6fc", letterSpacing: "-0.02em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                CMLabs CRM
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Sales Management
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto", overflowX: "hidden" }}>

          <NavSection label="Menu Utama" />
          <NavItem href="/dashboard" label="Dashboard"   Icon={NavIcons.Dashboard}   isActive={isActive("/dashboard", true)} />
          <NavItem href="/leads"     label="Leads"       Icon={NavIcons.Leads}       isActive={isActive("/leads")} />

          {(showForecasting || showReports) && (
            <NavSection label="Analitik" />
          )}
          {showForecasting && (
            <NavItem href="/forecasting" label="Forecasting"       Icon={NavIcons.Forecast}     isActive={isActive("/forecasting")} />
          )}
          {showReports && (
            <NavItem
              href="/reports"
              label="Laporan & Dokumen"
              Icon={NavIcons.Report}
              isActive={reportsActive}
            />
          )}
          {showPersonal && (
            <NavItem
              href="/reports/personal"
              label="Performa Saya"
              Icon={NavIcons.Performance}
              isActive={personalActive}
            />
          )}

          <NavSection label="Manajemen" />

          {showTeam && (
            <NavItem href="/team"    label="Tim"         Icon={NavIcons.Team}    isActive={isActive("/team")} />
          )}
          <NavItem href="/profile"   label="Profil Saya" Icon={NavIcons.Profile} isActive={isActive("/profile", true)} />

        </nav>

        {/* ── Footer ─────────────────────────────────── */}
        <div style={{
          borderTop:     "1px solid rgba(255,255,255,0.06)",
          flexShrink:    0,
          display:       "flex",
          flexDirection: "column",
          gap:           0,
        }}>
          
          {/* User card */}
          <div
  className="user-card"
  style={{
            margin:       "4px 10px 8px",
            padding:      "10px 12px",
            background:   "rgba(255,255,255,0.04)",
            border:       "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
  className="user-avatar"
  style={{
                width:          32, height: 32, borderRadius: 8, flexShrink: 0,
                background:     `linear-gradient(135deg, ${userRoleColor}30, ${userRoleColor}15)`,
                border:         `1px solid ${userRoleColor}40`,
                display:        "flex", alignItems: "center", justifyContent: "center",
                fontSize:       13, fontWeight: 800, color: userRoleColor,
              }}>
                {userInitial}
              </div>
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e8f0f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                  {userName}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                  {userEmail}
                </div>
                <div style={{ display: "inline-flex", padding: "1px 6px", borderRadius: 999, background: userRoleColor + "18", border: `1px solid ${userRoleColor}30` }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: userRoleColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {userRoleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div style={{ padding: "0 10px 14px" }}>
            <button
  className="logout-btn"
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                display:      "flex", alignItems: "center", gap: 8,
                width:        "100%", padding: "9px 12px",
                background:   "rgba(239,68,68,0.07)",
                border:       "1px solid rgba(239,68,68,0.15)",
                borderRadius: 9, color: "rgba(248,113,113,0.8)",
                fontSize:     12, fontWeight: 500,
                cursor:       "pointer", textAlign: "left",
                transition:   "all 0.15s",
                whiteSpace:   "nowrap",
                overflow:     "hidden",
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
              <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                <NavIcons.Logout />
              </span>
              <span className="logout-label">Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Responsive sidebar styles ───────────────── */}
      <style>{`
        /* Desktop ≥1025px : 240px */
        .sidebar-desktop {
          width: 240px;
        }

        /* Tablet 641–1024px : 200px, sembunyikan label teks */
        @media (max-width: 1024px) {
          .sidebar-desktop   { width: 200px !important; }
          .brand-text div:last-child { display: none; }
        }

        /* Phablet 769–900px : 180px */
        @media (max-width: 900px) {
          .sidebar-desktop { width: 180px !important; }
        }

        /* Tablet kecil 641–768px : compact icon sidebar */
@media (max-width: 768px) {

  .sidebar-desktop {
    width: 72px !important;
    padding-top: 4px;
  }

  /* Hide text */
  .nav-label,
  .brand-text,
  .user-info,
  .logout-label,
  .nav-section {
    display: none !important;
  }

  /* Nav items */
  .nav-item {
    justify-content: center !important;
    align-items: center !important;
    padding: 12px 0 !important;
    border-radius: 12px !important;
    margin-bottom: 6px !important;
  }

  /* Navigation spacing */
  .sidebar-desktop nav {
    padding: 8px 6px !important;
  }

  /* Theme toggle wrapper */
  .sidebar-desktop .theme-toggle-wrap {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 8px 0 !important;
  }

  /* Force theme button compact */
  .sidebar-desktop .theme-toggle-wrap button {
    width: 42px !important;
    height: 42px !important;
    padding: 0 !important;
    border-radius: 12px !important;
    justify-content: center !important;
  }

  /* User card compact */
  .sidebar-desktop .user-card {
    margin: 6px auto !important;
    padding: 8px !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 14px !important;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* Avatar only */
  .sidebar-desktop .user-avatar {
    width: 32px !important;
    height: 32px !important;
    margin: 0 !important;
  }

  /* Logout compact */
  .sidebar-desktop .logout-btn {
    width: 44px !important;
    height: 44px !important;
    padding: 0 !important;
    margin: 0 auto !important;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    border-radius: 12px !important;
  }
}

        /* Mobile ≤640px : hidden completely */
        @media (max-width: 640px) {
          .sidebar-desktop { display: none !important; }
        }
      `}</style>
    </>
  )
}