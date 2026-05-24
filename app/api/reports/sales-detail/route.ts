import { NextRequest, NextResponse } from "next/server"
import { auth }          from "@/lib/auth"
import { prisma }        from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { startOfMonth, endOfMonth } from "date-fns"
import type { RoleType } from "@/lib/permissions"

const DEAL_STATUS    = "DEAL"
const RECYCLE_STATUS = "RECYCLE"
const ACTIVE_STATUSES = ["APPROACH","COLD_LEAD","DECK_REQUEST","MEETING"] as const

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType
  if (!hasPermission(role, "read", "report")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const salesId = searchParams.get("salesId")
  const year    = searchParams.get("year")  ?? String(new Date().getFullYear())
  const month   = searchParams.get("month") ?? "all"

  if (!salesId) {
    return NextResponse.json({ error: "salesId wajib diisi" }, { status: 400 })
  }

  // Build date filter
  let dateFilter: any = {}
  if (month !== "all") {
    const d = new Date(Number(year), Number(month) - 1, 1)
    dateFilter = { createdAt: { gte: startOfMonth(d), lte: endOfMonth(d) } }
  } else {
    dateFilter = {
      createdAt: {
        gte: new Date(Number(year), 0,  1),
        lte: new Date(Number(year), 11, 31, 23, 59, 59),
      },
    }
  }

  // Fetch user + leads — hanya field yang diperlukan untuk modal
  // Tidak memuat _count atau relasi berat lainnya
  const [user, leads] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: salesId },
      select: { id: true, name: true, role: true, isActive: true },
    }),
    prisma.lead.findMany({
      where: {
        assignedToId: salesId,
        ...dateFilter,
      },
      select: {
        id:            true,
        title:         true,
        status:        true,
        value:         true,
        clientName:    true,
        clientCompany: true,
        createdAt:     true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // Compute stats di server — tidak dikirim raw data besar
  const won     = leads.filter((l) => l.status === DEAL_STATUS).length
  const lost    = leads.filter((l) => l.status === RECYCLE_STATUS).length
  const active  = leads.filter((l) => (ACTIVE_STATUSES as readonly string[]).includes(l.status)).length
  const revenue = leads
    .filter((l) => l.status === DEAL_STATUS)
    .reduce((s, l) => s + Number(l.value ?? 0), 0)
  const winRate = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0

  // Status distribution
  const statusDist = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return NextResponse.json({
    user:  { id: user.id, name: user.name, role: user.role },
    stats: { total: leads.length, won, lost, active, revenue, winRate },
    statusDist,
    leads: leads.map((l) => ({
      id:            l.id,
      title:         l.title,
      status:        l.status,
      value:         l.value ? Number(l.value) : null,
      clientName:    l.clientName,
      clientCompany: l.clientCompany,
    })),
  })
}