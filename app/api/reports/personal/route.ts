import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

const DEAL_STATUS    = "DEAL"
const RECYCLE_STATUS = "RECYCLE"
const ACTIVE_STATUSES = ["APPROACH", "COLD_LEAD", "DECK_REQUEST", "MEETING"]

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role   = session.user.role as RoleType
  const userId = session.user.id

  if (!["SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year      = searchParams.get("year")      ?? String(new Date().getFullYear())
  const month     = searchParams.get("month")     ?? "all"
  const actYear   = searchParams.get("actYear")   ?? String(new Date().getFullYear())
  const actMonth  = searchParams.get("actMonth")  ?? "all"

  // ── Lead date filter ─────────────────────────────────────────
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

  // ── Activity date filter ──────────────────────────────────────
  let actFilter: any = {}
  if (actMonth !== "all") {
    const d = new Date(Number(actYear), Number(actMonth) - 1, 1)
    actFilter = { createdAt: { gte: startOfMonth(d), lte: endOfMonth(d) } }
  } else {
    actFilter = {
      createdAt: {
        gte: new Date(Number(actYear), 0, 1),
        lte: new Date(Number(actYear), 11, 31),
      },
    }
  }

  // ── Fetch ALL leads (history) ─────────────────────────────────
  const allLeads = await prisma.lead.findMany({
    where: { assignedToId: userId, ...dateFilter },
    select: {
      id: true, title: true, status: true, priority: true,
      value: true, closedAt: true, clientName: true,
      clientCompany: true, createdAt: true,
    },
  })

  // KPI
  const totalLeads  = allLeads.length
  const wonLeads    = allLeads.filter((l) => l.status === DEAL_STATUS).length
  const lostLeads   = allLeads.filter((l) => l.status === RECYCLE_STATUS).length
  const activeLeads = allLeads.filter((l) => ACTIVE_STATUSES.includes(l.status)).length
  const totalRevenue = allLeads
    .filter((l) => l.status === DEAL_STATUS)
    .reduce((s, l) => s + Number(l.value ?? 0), 0)
  const pipelineValue = allLeads
    .filter((l) => ACTIVE_STATUSES.includes(l.status))
    .reduce((s, l) => s + Number(l.value ?? 0), 0)
  const winRate    = (wonLeads + lostLeads) > 0
    ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) : 0
  const avgDealSize = wonLeads > 0 ? Math.round(totalRevenue / wonLeads) : 0

  // ── Activities (dengan filter sendiri) ───────────────────────
  const activities = await prisma.activity.findMany({
    where: { userId, ...actFilter },
    select: { type: true, isDone: true, createdAt: true },
  })

  const activityByType = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const completedTasks = activities.filter((a) => a.type === "TASK" && a.isDone).length
  const totalTasks     = activities.filter((a) => a.type === "TASK").length

  // ── Monthly personal (12 bulan untuk grafik) ─────────────────
  const monthlyPersonal = []
  for (let i = 11; i >= 0; i--) {
    const d  = subMonths(new Date(), i)
    const s  = startOfMonth(d)
    const e  = endOfMonth(d)

    const monthLeads   = allLeads.filter((l) => {
      const cd = new Date(l.createdAt)
      return cd >= s && cd <= e
    })
    const monthWon     = allLeads.filter((l) => {
      if (l.status !== DEAL_STATUS) return false
      const cd = new Date(l.createdAt)
      return cd >= s && cd <= e
    })
    const monthRevenue = monthWon.reduce((sum, l) => sum + Number(l.value ?? 0), 0)

    monthlyPersonal.push({
      month:   format(d, "MMM"),
      year:    d.getFullYear(),
      created: monthLeads.length,
      won:     monthWon.length,
      revenue: monthRevenue,
    })
  }

  // ── Pipeline by status — SEMUA status (history) ──────────────
  const pipelineByStatus = Object.entries(
    allLeads.reduce((acc, l) => {
      if (!acc[l.status]) acc[l.status] = { count: 0, value: 0, status: l.status }
      acc[l.status].count++
      acc[l.status].value += Number(l.value ?? 0)
      return acc
    }, {} as Record<string, { count: number; value: number; status: string }>)
  ).map(([, v]) => v).sort((a, b) => {
    const ORDER = ["APPROACH","COLD_LEAD","DECK_REQUEST","MEETING","DEAL","RECYCLE"]
    return ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
  })

  // ── Status breakdown ──────────────────────────────────────────
  const statusBreakdown = allLeads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  // ── Recent deal leads ─────────────────────────────────────────
  const recentWon = allLeads
    .filter((l) => l.status === DEAL_STATUS)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // ── Activity monthly (untuk grafik aktivitas dengan filter) ──
  const activityMonthly = []
  for (let i = 11; i >= 0; i--) {
    const d  = subMonths(new Date(), i)
    const s  = startOfMonth(d)
    const e  = endOfMonth(d)
    const monthActs = activities.filter((a) => {
      const cd = new Date(a.createdAt)
      return cd >= s && cd <= e
    })
    activityMonthly.push({
      month: format(d, "MMM"),
      count: monthActs.length,
    })
  }

  return NextResponse.json({
    kpi: {
      totalLeads, wonLeads, lostLeads, activeLeads,
      totalRevenue, pipelineValue, winRate, avgDealSize,
      totalActivities: activities.length,
      completedTasks, totalTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    charts: {
      monthlyPersonal,
      pipelineByStatus,      // ← semua status, bukan hanya aktif
      statusBreakdown,
      activityByType,
      activityMonthly,       // ← untuk grafik aktivitas
    },
    recentWon,
    filters: { year, month, actYear, actMonth },
  })
}