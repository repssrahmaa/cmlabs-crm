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

     <div className="dashboard-layout">

  {/* Sidebar */}
  <aside className="dashboard-sidebar sidebar-desktop">
    <Sidebar />
  </aside>

  {/* Main */}
  <div className="dashboard-main">

    {/* Header */}
    <div className="hide-mobile">
      <Header />
    </div>

    {/* Page Content */}
    <main className="dashboard-content">
      {children}
    </main>

  </div>

</div>
    </SessionProvider>
  )
}
<style>{`
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