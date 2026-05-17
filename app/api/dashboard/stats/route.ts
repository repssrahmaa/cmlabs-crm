import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!hasPermission(role, "read", "dashboard")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ✅ Tidak ada whereClause filter by user — semua role lihat data yang sama
  const [totalLeads, DEALLeads, RECYCLELeads, activeLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "DEAL"  } }),
    prisma.lead.count({ where: { status: "RECYCLE" } }),
    prisma.lead.count({ where: { status: { notIn: ["DEAL", "RECYCLE"] } } }),
  ])

  const revenueResult = await prisma.lead.aggregate({
    where: { status: "DEAL" },
    _sum:  { value: true },
  })
  const totalRevenue = Number(revenueResult._sum.value ?? 0)

  const pipelineResult = await prisma.lead.aggregate({
    where: { status: { notIn: ["DEAL", "RECYCLE"] } },
    _sum:  { value: true },
  })
  const pipelineValue = Number(pipelineResult._sum.value ?? 0)

  const closedLeads = DEALLeads + RECYCLELeads
  const winRate     = closedLeads > 0
    ? Math.round((DEALLeads / closedLeads) * 100)
    : 0

  // Leads per Status
  const leadsByStatusRaw = await prisma.lead.groupBy({
    by:     ["status"],
    _count: true,
  })
  const leadsByStatus = leadsByStatusRaw.map((d) => ({
    status: d.status,
    _count: d._count,
  }))

  // Monthly Data 6 bulan terakhir
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date  = subMonths(new Date(), i)
    const start = startOfMonth(date)
    const end   = endOfMonth(date)

    const [created, DEAL] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.lead.count({ where: { status: "DEAL", closedAt: { gte: start, lte: end } } }),
    ])

    monthlyData.push({ month: format(date, "MMM"), created, DEAL })
  }

  // Monthly Revenue
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const date   = subMonths(new Date(), i)
    const start  = startOfMonth(date)
    const end    = endOfMonth(date)

    const result = await prisma.lead.aggregate({
      where: { status: "DEAL", closedAt: { gte: start, lte: end } },
      _sum:  { value: true },
    })

    monthlyRevenue.push({
      month:   format(date, "MMM"),
      revenue: Number(result._sum.value ?? 0),
    })
  }

  // Sales Performance — semua sales dan AE
  const salesUsers = await prisma.user.findMany({
    where:  { role: { in: ["SALES_MANAGER", "ACCOUNT_EXECUTIVE"] }, isActive: true },
    select: {
      id:   true,
      name: true,
      role: true,
      assignedLeads: { select: { status: true, value: true } },
    },
  })

  const salesPerformance = salesUsers.map((u) => {
    const total   = u.assignedLeads.length
    const DEAL     = u.assignedLeads.filter((l) => l.status === "DEAL").length
    const revenue = u.assignedLeads
      .filter((l) => l.status === "DEAL")
      .reduce((s, l) => s + Number(l.value ?? 0), 0)

    return {
      name:    u.name,
      role:    u.role,
      total,
      DEAL,
      winRate: total > 0 ? Math.round((DEAL / total) * 100) : 0,
      revenue,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  const leadsByPriorityRaw = await prisma.lead.groupBy({
    by:     ["priority"],
    _count: true,
  })
  const leadsByPriority = leadsByPriorityRaw.map((d) => ({
    priority: d.priority,
    _count:   d._count,
  }))

  return NextResponse.json({
    kpi: {
      totalLeads, DEALLeads, RECYCLELeads,
      activeLeads, totalRevenue, pipelineValue, winRate,
    },
    charts: {
      leadsByStatus, monthlyData,
      monthlyRevenue, salesPerformance, leadsByPriority,
    },
  })
}