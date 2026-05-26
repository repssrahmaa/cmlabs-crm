"use client"

import { usePathname } from "next/navigation"
import ThemeToggle     from "@/components/layout/ThemeToggle"

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/dashboard":        { title: "Dashboard",          sub: "Ringkasan performa tim" },
  "/leads":            { title: "Manajemen Leads",     sub: "Pipeline & Kanban Board" },
  "/forecasting":      { title: "Forecasting",         sub: "Proyeksi revenue pipeline" },
  "/team":             { title: "Manajemen Tim",       sub: "Anggota & performa sales" },
  "/reports":          { title: "Laporan & Dokumen",   sub: "Performa & generate dokumen" },
  "/reports/personal": { title: "Performa Saya",       sub: "Statistik kinerja personal" },
  "/profile":          { title: "Profil",              sub: "Pengaturan akun" },
}

export default function Header() {
  const pathname = usePathname()

  const meta = Object.entries(PAGE_META)
    .filter(([path]) => pathname === path || pathname.startsWith(path + "/"))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1]
    ?? { title: "CMLabs CRM", sub: "" }

  return (
    <>
      <header
        className="app-header"
        style={{
          height:         56,
          background:     "var(--bg-card)",
          borderBottom:   "1px solid var(--border)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0 20px",
          /* Sticky — judul tetap terlihat saat scroll */
          position:       "sticky",
          top:            0,
          zIndex:         30,
          backdropFilter: "blur(12px)",
          boxShadow:      "0 1px 0 var(--border)",
          gap:            12,
          /* Pastikan header tidak overflow */
          minWidth:       0,
          flexShrink:     0,
        }}
      >
        {/* Left: accent bar + title */}
        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        10,
          minWidth:   0,
          flex:       1,
          overflow:   "hidden",
        }}>
          {/* Accent pill */}
          <div style={{
            width:        3,
            height:       20,
            borderRadius: 999,
            background:   "linear-gradient(180deg, var(--primary) 0%, var(--primary-dark, #1d4ed8) 100%)",
            flexShrink:   0,
          }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{
              margin:        0,
              fontSize:      15,
              fontWeight:    700,
              color:         "var(--text-primary)",
              lineHeight:    1.2,
              letterSpacing: "-0.01em",
              whiteSpace:    "nowrap",
              overflow:      "hidden",
              textOverflow:  "ellipsis",
            }}>
              {meta.title}
            </h1>
            {meta.sub && (
              <p
                className="header-sub"
                style={{
                  margin:       0,
                  fontSize:     11,
                  color:        "var(--text-muted)",
                  lineHeight:   1.2,
                  whiteSpace:   "nowrap",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {meta.sub}
              </p>
            )}
          </div>
        </div>

        {/* Right: ThemeToggle */}
        <div style={{ flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </header>

      <style>{`
        /* Tablet: sub-title masih tampil */
        @media (max-width: 1024px) {
          .app-header { padding: 0 16px !important; }
        }

        /* Mobile: sembunyikan sub-title, kecilkan title */
        @media (max-width: 640px) {
          /* Header tersembunyi di mobile — digantikan MobileNav topbar */
          .app-header { display: none !important; }
        }

        /* Layar sangat sempit (≤380px) */
        @media (max-width: 380px) {
          .app-header h1   { font-size: 13px !important; }
          .header-sub      { display: none !important; }
        }
      `}</style>
    </>
  )
}