import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

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
  const period = searchParams.get("period") ?? "this_month"

  let startDate: Date
  let endDate:   Date

  switch (period) {
    case "last_month":
      startDate = startOfMonth(subMonths(new Date(), 1))
      endDate   = endOfMonth(subMonths(new Date(), 1))
      break
    case "last_3_months":
      startDate = startOfMonth(subMonths(new Date(), 3))
      endDate   = endOfMonth(new Date())
      break
    case "last_6_months":
      startDate = startOfMonth(subMonths(new Date(), 6))
      endDate   = endOfMonth(new Date())
      break
    case "this_year":
      startDate = new Date(new Date().getFullYear(), 0, 1)
      endDate   = new Date(new Date().getFullYear(), 11, 31)
      break
    default:
      startDate = startOfMonth(new Date())
      endDate   = endOfMonth(new Date())
  }

  const dateFilter = { createdAt: { gte: startDate, lte: endDate } }

  // ✅ Semua role yang punya akses lihat data SEMUA lead (no filter by user)
  const [totalLeads, wonLeads, lostLeads, activeLeads, totalActivities] =
    await Promise.all([
      prisma.lead.count({ where: dateFilter }),
      prisma.lead.count({ where: { ...dateFilter, status: "WON"  } }),
      prisma.lead.count({ where: { ...dateFilter, status: "LOST" } }),
      prisma.lead.count({ where: { ...dateFilter, status: { notIn: ["WON","LOST"] } } }),
      prisma.activity.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    ])

  const revenueResult = await prisma.lead.aggregate({
    where: { ...dateFilter, status: "WON" },
    _sum:  { value: true },
    _avg:  { value: true },
  })

  const totalRevenue = Number(revenueResult._sum.value ?? 0)
  const avgDealSize  = Number(revenueResult._avg.value ?? 0)
  const winRate      = (wonLeads + lostLeads) > 0
    ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100)
    : 0

  // Leads per Status
  const leadsByStatusRaw = await prisma.lead.groupBy({
    by:     ["status"],
    where:  dateFilter,
    _count: true,
  })

  // Leads per Priority
  const leadsByPriorityRaw = await prisma.lead.groupBy({
    by:     ["priority"],
    where:  dateFilter,
    _count: true,
  })

  // Leads per Source
  const leadsBySourceRaw = await prisma.lead.groupBy({
    by:     ["source"],
    where:  { ...dateFilter, source: { not: null } },
    _count: true,
  })

  // Monthly breakdown
  const months = period === "this_month" || period === "last_month" ? 1
    : period === "last_3_months" ? 3
    : period === "last_6_months" ? 6 : 12

  const monthlyBreakdown = []
  for (let i = months - 1; i >= 0; i--) {
    const date  = subMonths(endDate, i)
    const start = startOfMonth(date)
    const end   = endOfMonth(date)

    const [created, won, lost] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.lead.count({ where: { status: "WON",  closedAt: { gte: start, lte: end } } }),
      prisma.lead.count({ where: { status: "LOST", closedAt: { gte: start, lte: end } } }),
    ])

    const rev = await prisma.lead.aggregate({
      where: { status: "WON", closedAt: { gte: start, lte: end } },
      _sum:  { value: true },
    })

    monthlyBreakdown.push({
      month:   format(date, "MMM yyyy"),
      created, won, lost,
      revenue: Number(rev._sum.value ?? 0),
    })
  }

  // ✅ Sales Performance — SEMUA sales & AE
  const salesUsers = await prisma.user.findMany({
    where:  { role: { in: ["SALES_MANAGER", "ACCOUNT_EXECUTIVE"] }, isActive: true },
    select: {
      id:   true,
      name: true,
      role: true,
      assignedLeads: {
        where:  dateFilter,
        select: { status: true, value: true },
      },
    },
  })

  const salesPerformance = salesUsers.map((u) => {
    const total   = u.assignedLeads.length
    const won     = u.assignedLeads.filter((l) => l.status === "WON").length
    const lost    = u.assignedLeads.filter((l) => l.status === "LOST").length
    const revenue = u.assignedLeads
      .filter((l) => l.status === "WON")
      .reduce((s, l) => s + Number(l.value ?? 0), 0)

    return {
      name:    u.name,
      role:    u.role,
      total,
      won,
      lost,
      active:  total - won - lost,
      winRate: total > 0 ? Math.round((won / total) * 100) : 0,
      revenue,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const recentWonLeads = await prisma.lead.findMany({
    where:   { status: "WON", closedAt: { gte: startDate, lte: endDate } },
    include: {
      assignedTo: { select: { name: true } },
      createdBy:  { select: { name: true } },
    },
    orderBy: { closedAt: "desc" },
    take:    10,
  })

  return NextResponse.json({
    period:  { label: period, startDate, endDate },
    summary: {
      totalLeads, wonLeads, lostLeads, activeLeads,
      totalRevenue, avgDealSize, winRate, totalActivities,
    },
    charts: {
      leadsByStatus:   leadsByStatusRaw.map((d) => ({ status:   d.status,   count: d._count })),
      leadsByPriority: leadsByPriorityRaw.map((d) => ({ priority: d.priority, count: d._count })),
      leadsBySource:   leadsBySourceRaw.map((d) => ({ source:   d.source ?? "Tidak diketahui", count: d._count })),
      monthlyBreakdown,
    },
    salesPerformance,
    recentWonLeads,
  })
}