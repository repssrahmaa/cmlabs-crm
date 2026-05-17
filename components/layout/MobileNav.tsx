"use client"

import { useState }    from "react"
import Link            from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRoleGuard } from "@/hooks/useRoleGuard"
import ThemeToggle     from "@/components/layout/ThemeToggle"

export default function MobileNav() {
  const [open, setOpen]   = useState(false)
  const pathname          = usePathname()
  const { data: session } = useSession()
  const { role, is, canAccessForecasting, canAccessTeam, canAccessReports } = useRoleGuard()

  const LINKS = [
    { href: "/dashboard",        label: "Dashboard",          show: true },
    { href: "/leads",            label: "Leads",              show: true },
    { href: "/forecasting",      label: "Forecasting",        show: canAccessForecasting },
    { href: "/reports",          label: "Laporan",            show: canAccessReports },
    { href: "/reports/personal", label: "Performa Saya",      show: is("SALES_MANAGER","ACCOUNT_EXECUTIVE") },
    { href: "/team",             label: "Tim",                show: canAccessTeam },
    { href: "/profile",          label: "Profil",             show: true },
    { href: "/uat-guide",        label: "Panduan UAT",        show: true },
  ].filter((l) => l.show)

  return (
    <>
      {/* Top bar untuk mobile */}
      <div style={{
        display:        "none",
        position:       "fixed",
        top:            0, left: 0, right: 0,
        height:         52,
        background:     "var(--bg-card)",
        borderBottom:   "1px solid var(--border)",
        zIndex:         50,
        padding:        "0 16px",
        alignItems:     "center",
        justifyContent: "space-between",
        // Show di mobile via CSS
      }} className="mobile-topbar">
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>CMLabs CRM</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <ThemeToggle compact />
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: "var(--bg-card2)", border: "1px solid var(--border)",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            {[0,1,2].map((i) => (
              <div key={i} style={{ width: 18, height: 2, background: "var(--text-secondary)", borderRadius: 999 }} />
            ))}
          </button>
        </div>
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 60,
          }} />
          <div style={{
            position:   "fixed", top: 0, right: 0, bottom: 0,
            width:      280, background: "var(--bg-sidebar, #0d1117)",
            zIndex:     70, padding: "20px 16px",
            overflowY:  "auto",
            boxShadow:  "-4px 0 20px rgba(0,0,0,0.3)",
            animation:  "slideInRight .25s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc" }}>Menu</div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {LINKS.map((link) => {
                const isActive = link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href)
                return (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
                    padding:        "10px 14px",
                    borderRadius:   10,
                    textDecoration: "none",
                    fontSize:       13, fontWeight: isActive ? 700 : 500,
                    color:          isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    background:     isActive ? "linear-gradient(135deg, #4B9EF3, #1a6fd4)" : "transparent",
                  }}>
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                {session?.user?.name}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  width: "100%", padding: "9px", background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
                  color: "#f87171", fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                Keluar
              </button>
            </div>
          </div>
        </>
      )}

      {/* CSS untuk tampilkan di mobile */}
      <style>{`
        @media (max-width: 640px) {
          .mobile-topbar { display: flex !important; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}