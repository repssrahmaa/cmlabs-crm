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
      {/* Mobile navigation (visible only on mobile) */}
      <MobileNav />

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-page)" }}>
        {/* Sidebar — hidden on mobile via CSS */}
        <div className="sidebar-desktop" style={{ width: 240, flexShrink: 0 }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div
  className="main-with-sidebar"
  style={{
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    minHeight:     "100vh",
    minWidth:      0,
    transition:    "all .3s ease",
  }}
>
          <div className="hide-mobile">
            <Header />
          </div>
          <main
            style={{
              flex:    1,
              padding: "20px 24px 32px",
              minWidth: 0,
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
<style jsx>{`
  .sidebar-desktop {
    display: block;
  }

  .main-with-sidebar {
    margin-left: 0;
    width: calc(100% - 240px);
  }

  @media (max-width: 1024px) {
    .sidebar-desktop {
      display: none;
    }

    .main-with-sidebar {
      width: 100% !important;
    }
  }

  @media (max-width: 768px) {
    .main-with-sidebar main {
      padding: 16px 14px 24px !important;
    }
  }
`}</style>