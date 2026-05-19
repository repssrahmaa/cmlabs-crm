"use client"

import { useState }       from "react"
import Link               from "next/link"
import { usePathname }    from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRoleGuard }   from "@/hooks/useRoleGuard"
import ThemeToggle        from "@/components/layout/ThemeToggle"

// ── SVG Icons ──────────────────────────────────────────────────
const Bars3 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6"  y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>
)

export default function MobileNav() {
  const [open, setOpen]   = useState(false)
  const pathname          = usePathname()
  const { data: session } = useSession()
  const { role, is, canAccessForecasting, canAccessTeam, canAccessReports } = useRoleGuard()

  const LINKS = [
    { href: "/dashboard",        label: "Dashboard",       show: true },
    { href: "/leads",            label: "Leads",           show: true },
    { href: "/forecasting",      label: "Forecasting",     show: canAccessForecasting },
    { href: "/reports",          label: "Laporan",         show: canAccessReports },
    { href: "/reports/personal", label: "Performa Saya",   show: is("SALES_MANAGER","ACCOUNT_EXECUTIVE") },
    { href: "/team",             label: "Tim",             show: canAccessTeam },
    { href: "/profile",          label: "Profil",          show: true },
    { href: "/uat-guide",        label: "Panduan UAT",     show: true },
  ].filter((l) => l.show)

  const isActive = (href: string) =>
    href === "/dashboard" || href === "/profile"
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <>
      {/* ── Mobile Top Bar ────────────────────────────── */}
      <div className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#fff",
          }}>
            C
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#f0f6fc", letterSpacing: "-0.02em" }}>
            CMLabs CRM
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle compact />
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              cursor: "pointer", color: "#f0f6fc",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Bars3 />
          </button>
        </div>
      </div>

      {/* ── Drawer Overlay ────────────────────────────── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 60,
              backdropFilter: "blur(2px)",
            }}
          />
          <nav style={{
            position:   "fixed",
            top: 0, right: 0, bottom: 0,
            width:      280,
            background: "linear-gradient(180deg, #080c14 0%, #0d1117 100%)",
            zIndex:     70,
            display:    "flex",
            flexDirection: "column",
            boxShadow:  "-4px 0 24px rgba(0,0,0,0.4)",
            animation:  "slideInRight 0.25s ease",
          }}>
            {/* Drawer header */}
            <div style={{
              padding:      "18px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display:      "flex",
              justifyContent: "space-between",
              alignItems:   "center",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f6fc" }}>Menu Navigasi</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                  {session?.user?.name}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer", color: "rgba(255,255,255,0.6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <XIcon />
              </button>
            </div>

            {/* Links */}
            <div style={{ flex: 1, padding: "10px 12px", overflowY: "auto" }}>
              {LINKS.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display:        "block",
                      padding:        "11px 14px",
                      borderRadius:   10,
                      marginBottom:   4,
                      textDecoration: "none",
                      fontSize:       13,
                      fontWeight:     active ? 700 : 500,
                      color:          active ? "#fff" : "rgba(255,255,255,0.5)",
                      background:     active
                        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                        : "transparent",
                      boxShadow:      active ? "0 3px 12px rgba(59,130,246,0.35)" : "none",
                      transition:     "all 0.15s",
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Signout */}
            <div style={{ padding: "12px 12px 20px" }}>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  width:        "100%",
                  padding:      "11px",
                  background:   "rgba(239,68,68,0.1)",
                  border:       "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 10,
                  color:        "#f87171",
                  fontSize:     13, fontWeight: 500,
                  cursor:       "pointer",
                }}
              >
                Keluar dari Akun
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  )
}