"use client"

import { usePathname } from "next/navigation"
import ThemeToggle     from "@/components/layout/ThemeToggle"

// ── SVG Icons ──────────────────────────────────────────────────
const IconDot = () => (
  <svg width="4" height="16" viewBox="0 0 4 16">
    <rect width="4" height="16" rx="2"
      fill="url(#dotGrad)"/>
    <defs>
      <linearGradient id="dotGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="var(--primary)"/>
        <stop offset="100%" stopColor="var(--primary-dark)"/>
      </linearGradient>
    </defs>
  </svg>
)

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/dashboard":        { title: "Dashboard",             sub: "Ringkasan performa tim" },
  "/leads":            { title: "Manajemen Leads",        sub: "Pipeline & Kanban Board" },
  "/forecasting":      { title: "Forecasting",            sub: "Proyeksi revenue pipeline" },
  "/team":             { title: "Manajemen Tim",          sub: "Anggota & performa sales" },
  "/reports":          { title: "Laporan & Dokumen",      sub: "Performa & generate dokumen" },
  "/reports/personal": { title: "Performa Saya",          sub: "Statistik kinerja personal" },
  "/profile":          { title: "Profil",                 sub: "Pengaturan akun" },
  "/uat-guide":        { title: "Panduan UAT",            sub: "Petunjuk pengujian sistem" },
}

export default function Header() {
  const pathname = usePathname()
  const meta     = PAGE_META[pathname] ?? { title: "CMLabs CRM", sub: "" }

  return (
    <header style={{
      height:         60,
      background:     "var(--bg-card)",
      borderBottom:   "1px solid var(--border)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 22px",
      position:       "sticky",
      top:            0,
      zIndex:         30,
      backdropFilter: "blur(12px)",
      boxShadow:      "var(--shadow-xs)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconDot />
        <div>
          <h1 style={{
            margin:       0,
            fontSize:     15,
            fontWeight:   700,
            color:        "var(--text-primary)",
            lineHeight:   1.2,
            letterSpacing: "-0.01em",
          }}>
            {meta.title}
          </h1>
          {meta.sub && (
            <p style={{
              margin:   0,
              fontSize: 11,
              color:    "var(--text-muted)",
              lineHeight: 1,
            }}>
              {meta.sub}
            </p>
          )}
        </div>
      </div>

      <ThemeToggle />
    </header>
  )
}