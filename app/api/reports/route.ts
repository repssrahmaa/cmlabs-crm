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
  const [totalLeads, DEALLeads, RECYCLELeads, activeLeads, totalActivities] =
    await Promise.all([
      prisma.lead.count({ where: dateFilter }),
      prisma.lead.count({ where: { ...dateFilter, status: "DEAL"  } }),
      prisma.lead.count({ where: { ...dateFilter, status: "RECYCLE" } }),
      prisma.lead.count({ where: { ...dateFilter, status: { notIn: ["DEAL","RECYCLE"] } } }),
      prisma.activity.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    ])

  const revenueResult = await prisma.lead.aggregate({
    where: { ...dateFilter, status: "DEAL" },
    _sum:  { value: true },
    _avg:  { value: true },
  })

  const totalRevenue = Number(revenueResult._sum.value ?? 0)
  const avgDealSize  = Number(revenueResult._avg.value ?? 0)
  const winRate      = (DEALLeads + RECYCLELeads) > 0
    ? Math.round((DEALLeads / (DEALLeads + RECYCLELeads)) * 100)
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

    const [created, DEAL, RECYCLE] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.lead.count({ where: { status: "DEAL",  closedAt: { gte: start, lte: end } } }),
      prisma.lead.count({ where: { status: "RECYCLE", closedAt: { gte: start, lte: end } } }),
    ])

    const rev = await prisma.lead.aggregate({
      where: { status: "DEAL", closedAt: { gte: start, lte: end } },
      _sum:  { value: true },
    })

    monthlyBreakdown.push({
      month:   format(date, "MMM yyyy"),
      created, DEAL, RECYCLE,
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
    const DEAL     = u.assignedLeads.filter((l) => l.status === "DEAL").length
    const RECYCLE    = u.assignedLeads.filter((l) => l.status === "RECYCLE").length
    const revenue = u.assignedLeads
      .filter((l) => l.status === "DEAL")
      .reduce((s, l) => s + Number(l.value ?? 0), 0)

    return {
      name:    u.name,
      role:    u.role,
      total,
      DEAL,
      RECYCLE,
      active:  total - DEAL - RECYCLE,
      winRate: total > 0 ? Math.round((DEAL / total) * 100) : 0,
      revenue,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const recentDEALLeads = await prisma.lead.findMany({
    where:   { status: "DEAL", closedAt: { gte: startDate, lte: endDate } },
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
      totalLeads, DEALLeads, RECYCLELeads, activeLeads,
      totalRevenue, avgDealSize, winRate, totalActivities,
    },
    charts: {
      leadsByStatus:   leadsByStatusRaw.map((d) => ({ status:   d.status,   count: d._count })),
      leadsByPriority: leadsByPriorityRaw.map((d) => ({ priority: d.priority, count: d._count })),
      leadsBySource:   leadsBySourceRaw.map((d) => ({ source:   d.source ?? "Tidak diketahui", count: d._count })),
      monthlyBreakdown,
    },
    salesPerformance,
    recentDEALLeads,
  })
}