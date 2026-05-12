"use client"

import { usePathname } from "next/navigation"
import ThemeToggle     from "@/components/layout/ThemeToggle"

const pageTitles: Record<string, { title: string; icon: string }> = {
  "/dashboard":        { title: "Dashboard",           icon: "📊" },
  "/leads":            { title: "Manajemen Leads",     icon: "🎯" },
  "/mails":            { title: "Pesan Internal",      icon: "✉️"  },
  "/forecasting":      { title: "Dashboard Forecasting", icon: "📈" },
  "/team":             { title: "Manajemen Tim",       icon: "👥" },
  "/reports":          { title: "Laporan & Dokumen",   icon: "📋" },
  "/reports/personal": { title: "Performa Saya",       icon: "⭐" },
  "/profile":          { title: "Profil Saya",         icon: "👤" },
}

export default function Header() {
  const pathname = usePathname()
  const page     = pageTitles[pathname] ?? { title: "CMLabs CRM", icon: "🏠" }

  return (
    <header style={{
      height:         60,
      background:     "var(--bg-card)",
      borderBottom:   "1px solid var(--border)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 20px",
      position:       "sticky",
      top:            0,
      zIndex:         30,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width:        4, height: 22,
          borderRadius: 999,
          background:   "linear-gradient(180deg, var(--primary), var(--primary-dark))",
        }} />
        <span style={{ fontSize: 18 }}>{page.icon}</span>
        <h1 style={{
          fontSize:   16, fontWeight: 700,
          color:      "var(--text-primary)",
          margin:     0, letterSpacing: "-0.01em",
        }}>
          {page.title}
        </h1>
      </div>
      <ThemeToggle />
    </header>
  )
}