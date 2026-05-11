import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns"
import type { RoleType } from "@/lib/permissions"

const PROBABILITY: Record<string, number> = {
  LEAD_IN:          0.05,
  CONTACT_MADE:     0.15,
  NEEDS_IDENTIFIED: 0.25,
  PROPOSAL_MADE:    0.40,
  NEGOTIATION:      0.65,
  CONTRACT_SENT:    0.80,
  WON:              1.00,
  LOST:             0.00,
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!hasPermission(role, "read", "forecast")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ✅ Semua role yang punya akses forecast lihat SEMUA lead aktif
  const activeLeads = await prisma.lead.findMany({
    where: {
      status: { notIn: ["WON", "LOST"] },
    },
    select: {
      id:         true,
      title:      true,
      status:     true,
      value:      true,
      priority:   true,
      assignedTo: { select: { name: true } },
    },
  })

  const forecastLeads = activeLeads.map((lead) => {
    const probability   = PROBABILITY[lead.status] ?? 0
    const value         = Number(lead.value ?? 0)
    const weightedValue = Math.round(value * probability)

    return {
      id:            lead.id,
      title:         lead.title,
      status:        lead.status,
      value,
      probability:   Math.round(probability * 100),
      weightedValue,
      priority:      lead.priority,
      assignedTo:    lead.assignedTo?.name ?? "-",
    }
  }).sort((a, b) => b.weightedValue - a.weightedValue)

  const totalForecast = forecastLeads.reduce((s, l) => s + l.weightedValue, 0)
  const totalPipeline = forecastLeads.reduce((s, l) => s + l.value, 0)
  const bestCase      = totalPipeline
  const worstCase     = forecastLeads
    .filter((l) => l.probability >= 65)
    .reduce((s, l) => s + l.value, 0)

  // Historical revenue — semua leads
  const historicalRevenue = []
  for (let i = 5; i >= 0; i--) {
    const date   = subMonths(new Date(), i)
    const start  = startOfMonth(date)
    const end    = endOfMonth(date)

    const result = await prisma.lead.aggregate({
      where: { status: "WON", closedAt: { gte: start, lte: end } },
      _sum:  { value: true },
    })

    historicalRevenue.push({
      month:   format(date, "MMM yyyy"),
      revenue: Number(result._sum.value ?? 0),
      type:    "actual" as const,
    })
  }

  // Proyeksi 3 bulan ke depan
  const last3      = historicalRevenue.slice(-3)
  const avgRevenue = last3.reduce((s, m) => s + m.revenue, 0) / 3

  const projections = []
  for (let i = 1; i <= 3; i++) {
    const date      = addMonths(new Date(), i)
    const projected = Math.max(Math.round(avgRevenue * (1 + i * 0.05)), 0)

    projections.push({
      month:   format(date, "MMM yyyy"),
      revenue: projected,
      type:    "projected" as const,
    })
  }

  // Forecast by status
  const forecastByStatusMap: Record<string, { totalValue: number; weightedValue: number; count: number }> = {}

  forecastLeads.forEach((lead) => {
    if (!forecastByStatusMap[lead.status]) {
      forecastByStatusMap[lead.status] = { totalValue: 0, weightedValue: 0, count: 0 }
    }
    forecastByStatusMap[lead.status].totalValue    += lead.value
    forecastByStatusMap[lead.status].weightedValue += lead.weightedValue
    forecastByStatusMap[lead.status].count++
  })

  const forecastByStatus = Object.entries(forecastByStatusMap).map(([status, d]) => ({
    status,
    totalValue:    d.totalValue,
    weightedValue: d.weightedValue,
    count:         d.count,
    probability:   Math.round((PROBABILITY[status] ?? 0) * 100),
  }))

  return NextResponse.json({
    summary: {
      totalForecast,
      totalPipeline,
      bestCase,
      worstCase,
      activeLeadsCount: activeLeads.length,
    },
    forecastLeads:      forecastLeads.slice(0, 10),
    historicalRevenue,
    projections,
    forecastByStatus,
  })
}