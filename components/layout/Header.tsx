"use client"

import { usePathname } from "next/navigation"
import ThemeToggle     from "@/components/layout/ThemeToggle"

const pageTitles: Record<string, string> = {
  "/dashboard":        "Dashboard",
  "/leads":            "Manajemen Leads",
  "/mails":            "Pesan Internal",
  "/forecasting":      "Dashboard Forecasting",
  "/team":             "Manajemen Tim",
  "/reports":          "Laporan & Dokumen",
  "/reports/personal": "Performa Saya",
  "/profile":          "Profil Saya",
}

export default function Header() {
  const pathname = usePathname()
  const title    = pageTitles[pathname] ?? "CMLabs CRM"

  return (
    <header style={{
      height:        64,
      background:    "var(--bg-card)",
      borderBottom:  "1px solid var(--border)",
      display:       "flex",
      alignItems:    "center",
      justifyContent: "space-between",
      padding:       "0 24px",
      position:      "sticky",
      top:           0,
      zIndex:        30,
      backdropFilter: "blur(12px)",
      boxShadow:     "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Breadcrumb indicator */}
        <div style={{
          width:        4, height: 20,
          borderRadius: 999,
          background:   "linear-gradient(180deg, var(--primary), var(--primary-dark))",
        }} />
        <h1 style={{
          fontSize:   17,
          fontWeight: 700,
          color:      "var(--text-primary)",
          margin:     0,
        }}>
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ThemeToggle />
      </div>
    </header>
  )
}