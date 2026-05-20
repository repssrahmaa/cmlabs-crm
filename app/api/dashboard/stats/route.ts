import { NextResponse }  from "next/server"
import { prisma }        from "@/lib/prisma"
import { auth }          from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

// ── Status enum terbaru ────────────────────────────────────────
const DEAL_STATUS     = "DEAL"
const RECYCLE_STATUS  = "RECYCLE"
const ACTIVE_STATUSES = ["APPROACH","COLD_LEAD","DECK_REQUEST","MEETING"] as const

// ── Helper: build date filter ──────────────────────────────────
function buildDateFilter(year: string, month: string) {
  if (month !== "all") {
    const d = new Date(Number(year), Number(month) - 1, 1)
    return {
      createdAt: {
        gte: startOfMonth(d),
        lte: endOfMonth(d),
      },
    }
  }
  return {
    createdAt: {
      gte: new Date(Number(year), 0,  1),
      lte: new Date(Number(year), 11, 31, 23, 59, 59),
    },
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType
  if (!hasPermission(role, "read", "dashboard")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const year    = searchParams.get("year")    ?? String(new Date().getFullYear())
  const month   = searchParams.get("month")   ?? "all"
  const section = searchParams.get("section") ?? "all"

  const df      = buildDateFilter(year, month)
  const result: any = {}

  // ────────────────────────────────────────────────────────────
  // KPI
  // ────────────────────────────────────────────────────────────
  if (section === "all" || section === "kpi") {
    const [
      totalLeads,
      dealLeads,
      recycleLeads,
      activeLeads,
      approachCount,
      coldLeadCount,
      deckCount,
      meetingCount,
    ] = await Promise.all([
      prisma.lead.count({ where: df }),
      prisma.lead.count({ where: { ...df, status: DEAL_STATUS    } }),
      prisma.lead.count({ where: { ...df, status: RECYCLE_STATUS } }),
      prisma.lead.count({ where: { ...df, status: { in: [...ACTIVE_STATUSES] } } }),
      prisma.lead.count({ where: { ...df, status: "APPROACH"     } }),
      prisma.lead.count({ where: { ...df, status: "COLD_LEAD"    } }),
      prisma.lead.count({ where: { ...df, status: "DECK_REQUEST" } }),
      prisma.lead.count({ where: { ...df, status: "MEETING"      } }),
    ])

    // Revenue dari DEAL leads
    const revenueAgg = await prisma.lead.aggregate({
      where: { ...df, status: DEAL_STATUS },
      _sum:  { value: true },
      _avg:  { value: true },
      _max:  { value: true },
    })

    // Pipeline value dari leads aktif
    const pipelineAgg = await prisma.lead.aggregate({
      where: { ...df, status: { in: [...ACTIVE_STATUSES] } },
      _sum:  { value: true },
      _avg:  { value: true },
    })

    const totalRevenue      = Number(revenueAgg._sum.value  ?? 0)
    const avgDealValue      = Number(revenueAgg._avg.value  ?? 0)
    const maxDealValue      = Number(revenueAgg._max.value  ?? 0)
    const pipelineValue     = Number(pipelineAgg._sum.value ?? 0)
    const avgPipelineValue  = Number(pipelineAgg._avg.value ?? 0)

    const closedLeads = dealLeads + recycleLeads
    const winRate     = closedLeads > 0
      ? Math.round((dealLeads / closedLeads) * 100)
      : 0

    // Revenue per status breakdown (untuk detail Pipeline Value card)
    const pipelineByStatus = await Promise.all(
      ACTIVE_STATUSES.map(async (status) => {
        const agg = await prisma.lead.aggregate({
          where: { ...df, status },
          _sum:  { value: true },
          _count: true,
        })
        return {
          status,
          count: agg._count,
          totalValue: Number(agg._sum.value ?? 0),
        }
      })
    )

    result.kpi = {
      // Counts
      totalLeads,
      dealLeads,
      recycleLeads,
      activeLeads,
      approachCount,
      coldLeadCount,
      deckCount,
      meetingCount,
      // Revenue
      totalRevenue,
      avgDealValue:     Math.round(avgDealValue),
      maxDealValue,
      pipelineValue,
      avgPipelineValue: Math.round(avgPipelineValue),
      // Rates
      winRate,
      closedLeads,
      // Breakdown pipeline per stage
      pipelineByStatus,
      // backward compat
      wonLeads:  dealLeads,
      lostLeads: recycleLeads,
    }
  }

  // ────────────────────────────────────────────────────────────
  // TREND — 12 bulan rolling
  // ────────────────────────────────────────────────────────────
  if (section === "all" || section === "trend") {
    const monthlyData: any[]    = []
    const monthlyRevenue: any[] = []

    for (let i = 11; i >= 0; i--) {
      const d   = subMonths(new Date(), i)
      const s   = startOfMonth(d)
      const e   = endOfMonth(d)
      const mth = format(d, "MMM")

      const [created, won, lost] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: s, lte: e } } }),
        prisma.lead.count({ where: { status: DEAL_STATUS,    createdAt: { gte: s, lte: e } } }),
        prisma.lead.count({ where: { status: RECYCLE_STATUS, createdAt: { gte: s, lte: e } } }),
      ])
      const rev = await prisma.lead.aggregate({
        where: { status: DEAL_STATUS, createdAt: { gte: s, lte: e } },
        _sum:  { value: true },
      })

      monthlyData.push({ month: mth, year: d.getFullYear(), created, won, lost })
      monthlyRevenue.push({ month: mth, revenue: Number(rev._sum.value ?? 0) })
    }

    if (!result.charts) result.charts = {}
    result.charts.monthlyData    = monthlyData
    result.charts.monthlyRevenue = monthlyRevenue
  }

  // ────────────────────────────────────────────────────────────
  // STATUS distribution
  // ────────────────────────────────────────────────────────────
  if (section === "all" || section === "status") {
    const byStatus = await prisma.lead.groupBy({
      by:    ["status"],
      where: df,
      _count: true,
    })

    if (!result.charts) result.charts = {}
    result.charts.leadsByStatus = byStatus.map((d) => ({
      status: d.status,
      count:  d._count,
      _count: d._count,   // backward compat
    }))
  }

  // ────────────────────────────────────────────────────────────
  // SALES performance
  // ────────────────────────────────────────────────────────────
  if (section === "all" || section === "sales") {
    const salesUsers = await prisma.user.findMany({
      where: {
        role:     { in: ["SALES_MANAGER","ACCOUNT_EXECUTIVE"] },
        isActive: true,
      },
      select: {
        id: true, name: true, role: true,
        assignedLeads: {
          where:  df,
          select: {
            id: true, title: true, status: true,
            value: true, clientName: true, clientCompany: true,
          },
        },
      },
    })

    const salesPerformance = salesUsers.map((u) => {
      const leads   = u.assignedLeads
      const won     = leads.filter((l) => l.status === DEAL_STATUS).length
      const lost    = leads.filter((l) => l.status === RECYCLE_STATUS).length
      const active  = leads.filter((l) =>
        (ACTIVE_STATUSES as readonly string[]).includes(l.status)
      ).length

      const revenue = leads
        .filter((l) => l.status === DEAL_STATUS)
        .reduce((s, l) => s + Number(l.value ?? 0), 0)

      const avgDeal  = won > 0 ? Math.round(revenue / won) : 0
      const winRate  = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0

      return {
        id:       u.id,
        name:     u.name,
        role:     u.role,
        total:    leads.length,
        won,
        lost,
        active,
        winRate,
        revenue,
        avgDeal,
        leads,  // untuk detail modal
      }
    }).sort((a, b) => b.revenue - a.revenue)

    if (!result.charts) result.charts = {}
    result.charts.salesPerformance = salesPerformance
  }

  return NextResponse.json(result)
}