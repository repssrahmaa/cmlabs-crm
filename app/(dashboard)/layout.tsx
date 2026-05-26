import { auth }            from "@/lib/auth"
import { redirect }        from "next/navigation"
import { SessionProvider } from "next-auth/react"
import Sidebar             from "@/components/layout/Sidebar"
import Header              from "@/components/layout/Header"
import MobileNav           from "@/components/layout/MobileNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <SessionProvider session={session}>
      {/* Mobile navigation (visible ≤640px) */}
      <MobileNav />

      <div style={{
        display:    "flex",
        minHeight:  "100vh",
        background: "var(--bg-page)",
      }}>
        {/* Sidebar — responsive via CSS class */}
        <Sidebar />

        {/* Main content */}
        <div
          className="main-with-sidebar"
          style={{
            display:       "flex",
            flexDirection: "column",
            minHeight:     "100vh",
            minWidth:      0,
            flex:          1,
          }}
        >
          {/* Sticky header — hidden on mobile (replaced by MobileNav topbar) */}
          <Header />

          <main
            style={{
              flex:    1,
              padding: "20px 22px 32px",
              minWidth: 0,
            }}
          >
            {children}
          </main>
        </div>
      </div>

      <style>{`
        /* Tablet: main margin mengikuti sidebar 200px */
        @media (max-width: 1024px) {
          .main-with-sidebar {
            margin-left: 200px !important;
            width: calc(100% - 200px) !important;
          }
        }

        /* Phablet: margin 180px */
        @media (max-width: 900px) {
          .main-with-sidebar {
            margin-left: 180px !important;
            width: calc(100% - 180px) !important;
          }
          main { padding: 16px 16px 28px !important; }
        }

        /* Tablet kecil: sidebar icon-only 64px */
        @media (max-width: 768px) {
          .main-with-sidebar {
            margin-left: 64px !important;
            width: calc(100% - 64px) !important;
          }
          main { padding: 14px 14px 24px !important; }
        }

        /* Mobile: sidebar hidden, full width */
        @media (max-width: 640px) {
          .main-with-sidebar {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 54px !important;
          }
          main { padding: 12px 12px 24px !important; }
        }
      `}</style>
    </SessionProvider>
  )
}