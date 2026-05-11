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
  const [totalLeads, wonLeads, lostLeads, activeLeads] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "WON"  } }),
    prisma.lead.count({ where: { status: "LOST" } }),
    prisma.lead.count({ where: { status: { notIn: ["WON", "LOST"] } } }),
  ])

  const revenueResult = await prisma.lead.aggregate({
    where: { status: "WON" },
    _sum:  { value: true },
  })
  const totalRevenue = Number(revenueResult._sum.value ?? 0)

  const pipelineResult = await prisma.lead.aggregate({
    where: { status: { notIn: ["WON", "LOST"] } },
    _sum:  { value: true },
  })
  const pipelineValue = Number(pipelineResult._sum.value ?? 0)

  const closedLeads = wonLeads + lostLeads
  const winRate     = closedLeads > 0
    ? Math.round((wonLeads / closedLeads) * 100)
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

    const [created, won] = await Promise.all([
      prisma.lead.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.lead.count({ where: { status: "WON", closedAt: { gte: start, lte: end } } }),
    ])

    monthlyData.push({ month: format(date, "MMM"), created, won })
  }

  // Monthly Revenue
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const date   = subMonths(new Date(), i)
    const start  = startOfMonth(date)
    const end    = endOfMonth(date)

    const result = await prisma.lead.aggregate({
      where: { status: "WON", closedAt: { gte: start, lte: end } },
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
    const won     = u.assignedLeads.filter((l) => l.status === "WON").length
    const revenue = u.assignedLeads
      .filter((l) => l.status === "WON")
      .reduce((s, l) => s + Number(l.value ?? 0), 0)

    return {
      name:    u.name,
      role:    u.role,
      total,
      won,
      winRate: total > 0 ? Math.round((won / total) * 100) : 0,
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
      totalLeads, wonLeads, lostLeads,
      activeLeads, totalRevenue, pipelineValue, winRate,
    },
    charts: {
      leadsByStatus, monthlyData,
      monthlyRevenue, salesPerformance, leadsByPriority,
    },
  })
}