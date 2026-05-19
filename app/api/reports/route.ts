import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

// Enum status yang benar
const DEAL_STATUS    = "DEAL"
const RECYCLE_STATUS = "RECYCLE"
const ACTIVE_STATUSES = ["APPROACH", "COLD_LEAD", "DECK_REQUEST", "MEETING"] as const

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as RoleType
  if (!hasPermission(role, "read", "report")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year  = searchParams.get("year")  ?? String(new Date().getFullYear())
  const month = searchParams.get("month") ?? "all"

  // Build date filter
  let dateFilter: any = {}
  if (month !== "all") {
    const d = new Date(Number(year), Number(month) - 1, 1)
    dateFilter = { createdAt: { gte: startOfMonth(d), lte: endOfMonth(d) } }
  } else {
    dateFilter = {
      createdAt: {
        gte: new Date(Number(year), 0, 1),
        lte: new Date(Number(year), 11, 31),
      },
    }
  }

  // KPI — pakai status enum terbaru
  const [totalLeads, wonLeads, lostLeads, activeLeads] = await Promise.all([
    prisma.lead.count({ where: dateFilter }),
    prisma.lead.count({ where: { ...dateFilter, status: DEAL_STATUS    } }),
    prisma.lead.count({ where: { ...dateFilter, status: RECYCLE_STATUS } }),
    prisma.lead.count({ where: { ...dateFilter, status: { in: [...ACTIVE_STATUSES] } } }),
  ])

  const revenueAgg = await prisma.lead.aggregate({
    where: { ...dateFilter, status: DEAL_STATUS },
    _sum:  { value: true },
    _avg:  { value: true },
  })
  const totalRevenue = Number(revenueAgg._sum.value ?? 0)
  const avgDealSize  = Number(revenueAgg._avg.value ?? 0)
  const winRate      = (wonLeads + lostLeads) > 0
    ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) : 0

  // Leads per status
  const byStatusRaw = await prisma.lead.groupBy({
  by: ["status"],
  where: dateFilter,
  _count: {
    status: true,
  },
})

const leadsByStatus = byStatusRaw.map((d) => ({
  status: d.status,
  count: d._count.status,
}))
  // Monthly breakdown
  const monthlyBreakdown = []
  const months = month === "all" ? 12 : 1
  const baseDate = month === "all"
    ? new Date(Number(year), 11, 1)
    : new Date(Number(year), Number(month) - 1, 1)

  for (let i = months - 1; i >= 0; i--) {
    const d    = subMonths(baseDate, i)
    const s    = startOfMonth(d)
    const e    = endOfMonth(d)
    const [created, won, lost] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: s, lte: e } } }),
      prisma.lead.count({ where: { status: DEAL_STATUS,    createdAt: { gte: s, lte: e } } }),
      prisma.lead.count({ where: { status: RECYCLE_STATUS, createdAt: { gte: s, lte: e } } }),
    ])
    const rev = await prisma.lead.aggregate({
      where: { status: DEAL_STATUS, createdAt: { gte: s, lte: e } },
      _sum:  { value: true },
    })
    monthlyBreakdown.push({
      month:   format(d, "MMM yyyy"),
      created, won, lost,
      revenue: Number(rev._sum.value ?? 0),
    })
  }

  // Sales performance — lengkap dengan leads detail
  const salesUsers = await prisma.user.findMany({
    where:  { role: { in: ["SALES_MANAGER", "ACCOUNT_EXECUTIVE"] }, isActive: true },
    select: {
      id: true, name: true, role: true,
      assignedLeads: {
        where:  dateFilter,
        select: {
          id: true, title: true, status: true, value: true,
          clientName: true, clientCompany: true, createdAt: true,
        },
      },
    },
  })

  const salesPerformance = salesUsers.map((u) => {
    const leads   = u.assignedLeads
    const total   = leads.length
    const won     = leads.filter((l) => l.status === DEAL_STATUS).length
    const lost    = leads.filter((l) => l.status === RECYCLE_STATUS).length
    const active  = leads.filter((l) => (ACTIVE_STATUSES as readonly string[]).includes(l.status)).length
    const revenue = leads
      .filter((l) => l.status === DEAL_STATUS)
      .reduce((s, l) => s + Number(l.value ?? 0), 0)

    return {
      id: u.id, name: u.name, role: u.role,
      total, won, lost, active,
      winRate: (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0,
      revenue,
      leads,   // untuk detail modal
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return NextResponse.json({
    summary: {
      totalLeads, wonLeads, lostLeads, activeLeads,
      totalRevenue, avgDealSize, winRate,
      // backward compat
      dealLeads: wonLeads, recycleLeads: lostLeads,
    },
    charts: {
      leadsByStatus,
      monthlyBreakdown,
    },
    salesPerformance,
  })
}