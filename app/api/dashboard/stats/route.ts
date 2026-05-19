import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

// ── Status baru yang sesuai dengan enum terbaru ────────────────
const ACTIVE_STATUSES = ["APPROACH", "COLD_LEAD", "DECK_REQUEST", "MEETING"]
const DEAL_STATUS     = "DEAL"
const RECYCLE_STATUS  = "RECYCLE"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as RoleType
  if (!hasPermission(role, "read", "dashboard")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year  = searchParams.get("year")  ?? String(new Date().getFullYear())
  const month = searchParams.get("month") ?? "all"

  // Date filter
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

  // ── KPI ───────────────────────────────────────────────────────
  const [totalLeads, dealLeads, recycleLeads, activeLeads] = await Promise.all([
    prisma.lead.count({ where: dateFilter }),
    prisma.lead.count({ where: { ...dateFilter, status: DEAL_STATUS } }),
    prisma.lead.count({ where: { ...dateFilter, status: RECYCLE_STATUS } }),
    prisma.lead.count({ where: { ...dateFilter, status: { in: ACTIVE_STATUSES } } }),
  ])

  const revenueResult = await prisma.lead.aggregate({
    where: { ...dateFilter, status: DEAL_STATUS },
    _sum:  { value: true },
  })
  const totalRevenue = Number(revenueResult._sum.value ?? 0)

  const pipelineResult = await prisma.lead.aggregate({
    where: { ...dateFilter, status: { in: ACTIVE_STATUSES } },
    _sum:  { value: true },
  })
  const pipelineValue = Number(pipelineResult._sum.value ?? 0)

  const closedLeads = dealLeads + recycleLeads
  const winRate     = closedLeads > 0 ? Math.round((dealLeads / closedLeads) * 100) : 0

  // ── Leads per Status — pakai enum terbaru ─────────────────────
  const leadsByStatusRaw = await prisma.lead.groupBy({
    by:     ["status"],
    where:  dateFilter,
    _count: true,
  })
  const leadsByStatus = leadsByStatusRaw.map((d) => ({
    status: d.status,
    _count: d._count,
  }))

  // ── Monthly Data 12 bulan ─────────────────────────────────────
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const d    = subMonths(new Date(), i)
    const s    = startOfMonth(d)
    const e    = endOfMonth(d)
    const [created, deal, recycle] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: s, lte: e } } }),
      prisma.lead.count({ where: { status: DEAL_STATUS,    createdAt: { gte: s, lte: e } } }),
      prisma.lead.count({ where: { status: RECYCLE_STATUS, createdAt: { gte: s, lte: e } } }),
    ])
    monthlyData.push({ month: format(d, "MMM"), year: d.getFullYear(), created, won: deal, lost: recycle })
  }

  // ── Monthly Revenue ───────────────────────────────────────────
  const monthlyRevenue = []
  for (let i = 11; i >= 0; i--) {
    const d   = subMonths(new Date(), i)
    const res = await prisma.lead.aggregate({
      where: { status: DEAL_STATUS, createdAt: { gte: startOfMonth(d), lte: endOfMonth(d) } },
      _sum:  { value: true },
    })
    monthlyRevenue.push({ month: format(d, "MMM"), revenue: Number(res._sum.value ?? 0) })
  }

  // ── Sales Performance ─────────────────────────────────────────
  const salesUsers = await prisma.user.findMany({
    where:  { role: { in: ["SALES_MANAGER", "ACCOUNT_EXECUTIVE"] }, isActive: true },
    select: {
      id: true, name: true, role: true,
      assignedLeads: {
        where:  dateFilter,
        select: { id: true, title: true, status: true, value: true, clientName: true, clientCompany: true },
      },
    },
  })

  const salesPerformance = salesUsers.map((u) => {
    const total   = u.assignedLeads.length
    const won     = u.assignedLeads.filter((l) => l.status === DEAL_STATUS).length
    const lost    = u.assignedLeads.filter((l) => l.status === RECYCLE_STATUS).length
    const active  = u.assignedLeads.filter((l) => ACTIVE_STATUSES.includes(l.status)).length
    const revenue = u.assignedLeads
      .filter((l) => l.status === DEAL_STATUS)
      .reduce((s, l) => s + Number(l.value ?? 0), 0)

    return {
      name: u.name, role: u.role, total, won, lost, active,
      winRate: (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0,
      revenue,
      leads: u.assignedLeads,    // ← untuk detail modal
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return NextResponse.json({
    kpi: { totalLeads, dealLeads, recycleLeads, activeLeads, totalRevenue, pipelineValue, winRate,
      // backward compat
      wonLeads: dealLeads, lostLeads: recycleLeads,
    },
    charts: { leadsByStatus, monthlyData, monthlyRevenue, salesPerformance },
  })
}


