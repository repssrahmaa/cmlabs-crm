import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role   = session.user.role as RoleType
  const userId = session.user.id

  // Hanya SM dan AE yang akses personal stats
  if (!["SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const userLeads = await prisma.lead.findMany({
    where:  { assignedToId: userId },
    select: {
      id:       true,
      title:    true,
      status:   true,
      priority: true,
      value:    true,
      closedAt: true,
      clientName: true,
      clientCompany: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  // ── KPI Personal ──────────────────────────────────────────
  const totalLeads  = userLeads.length
  const DEALLeads    = userLeads.filter((l) => l.status === "DEAL").length
  const RECYCLELeads   = userLeads.filter((l) => l.status === "RECYCLE").length
  const activeLeads = userLeads.filter(
    (l) => !["DEAL", "RECYCLE"].includes(l.status)
  ).length

  const totalRevenue = userLeads
    .filter((l) => l.status === "DEAL")
    .reduce((s, l) => s + Number(l.value ?? 0), 0)

  const pipelineValue = userLeads
    .filter((l) => !["DEAL", "RECYCLE"].includes(l.status))
    .reduce((s, l) => s + Number(l.value ?? 0), 0)

  const winRate = (DEALLeads + RECYCLELeads) > 0
    ? Math.round((DEALLeads / (DEALLeads + RECYCLELeads)) * 100)
    : 0

  const avgDealSize = DEALLeads > 0
    ? Math.round(totalRevenue / DEALLeads)
    : 0

  // ── Activity stats ────────────────────────────────────────
  const activities = await prisma.activity.findMany({
    where:  { userId },
    select: { type: true, isDone: true, createdAt: true },
  })

  const activityByType = activities.reduce(
    (acc, a) => {
      acc[a.type] = (acc[a.type] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const completedTasks = activities.filter(
    (a) => a.type === "TASK" && a.isDone
  ).length
  const totalTasks = activities.filter((a) => a.type === "TASK").length

  // ── Monthly personal breakdown ────────────────────────────
  const monthlyPersonal = []
  for (let i = 5; i >= 0; i--) {
    const date  = subMonths(new Date(), i)
    const start = startOfMonth(date)
    const end   = endOfMonth(date)

    const monthLeads = userLeads.filter((l) => {
      const d = new Date(l.createdAt)
      return d >= start && d <= end
    })

    const monthDEAL = userLeads.filter((l) => {
      if (l.status !== "DEAL" || !l.closedAt) return false
      const d = new Date(l.closedAt)
      return d >= start && d <= end
    })

    const monthRevenue = monthDEAL.reduce(
      (s, l) => s + Number(l.value ?? 0), 0
    )

    monthlyPersonal.push({
      month:   format(date, "MMM"),
      created: monthLeads.length,
      DEAL:     monthDEAL.length,
      revenue: monthRevenue,
    })
  }

  // ── Leads by status ───────────────────────────────────────
  const statusBreakdown = userLeads.reduce(
    (acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // ── Pipeline value per status ─────────────────────────────
  const pipelineByStatus = userLeads
    .filter((l) => !["DEAL", "RECYCLE"].includes(l.status))
    .reduce(
      (acc, l) => {
        const existing = acc.find((a) => a.status === l.status)
        if (existing) {
          existing.value += Number(l.value ?? 0)
          existing.count++
        } else {
          acc.push({ status: l.status, value: Number(l.value ?? 0), count: 1 })
        }
        return acc
      },
      [] as { status: string; value: number; count: number }[]
    )

  // ── Recent DEAL leads ──────────────────────────────────────
  const recentDEAL = userLeads
    .filter((l) => l.status === "DEAL")
    .sort((a, b) =>
      new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime()
    )
    .slice(0, 5)

  // ── Active leads detail ───────────────────────────────────
  const activeLeadsDetail = userLeads
    .filter((l) => !["DEAL", "RECYCLE"].includes(l.status))
    .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))
    .slice(0, 10)

  return NextResponse.json({
    kpi: {
      totalLeads,
      DEALLeads,
      RECYCLELeads,
      activeLeads,
      totalRevenue,
      pipelineValue,
      winRate,
      avgDealSize,
      totalActivities: activities.length,
      completedTasks,
      totalTasks,
      taskCompletionRate: totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
    },
    charts: {
      monthlyPersonal,
      statusBreakdown,
      pipelineByStatus,
      activityByType,
    },
    recentDEAL,
    activeLeadsDetail,
  })
}