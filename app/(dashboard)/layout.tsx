import { auth }            from "@/lib/auth"
import { redirect }        from "next/navigation"
import { SessionProvider } from "next-auth/react"
import Sidebar             from "@/components/layout/Sidebar"
import Header              from "@/components/layout/Header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <SessionProvider session={session}>
      <div style={{
        display:    "flex",
        minHeight:  "100vh",
        background: "var(--bg-page)",
      }}>
        <Sidebar />
        <div style={{
          flex:          1,
          marginLeft:    240,
          display:       "flex",
          flexDirection: "column",
          minHeight:     "100vh",
        }}>
          <Header />
          <main style={{
            flex:    1,
            padding: "20px 24px 32px",
          }}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}