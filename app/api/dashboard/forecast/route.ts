import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"
import { STATUS_PROBABILITY } from "@/types/lead"
import type { RoleType } from "@/lib/permissions"
import { LeadStatus } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role as RoleType
  if (!hasPermission(role, "read", "forecast")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") ?? "all"
  const year   = searchParams.get("year")   ?? String(new Date().getFullYear())
  const month  = searchParams.get("month")  ?? ""

  // ── Build date filter ─────────────────────────────────────
  let dateFilter: any = {}
  if (period === "month" && month) {
    const d = new Date(Number(year), Number(month) - 1, 1)
    dateFilter = { createdAt: { gte: startOfMonth(d), lte: endOfMonth(d) } }
  } else if (period === "year") {
    dateFilter = {
      createdAt: {
        gte: new Date(Number(year), 0, 1),
        lte: new Date(Number(year), 11, 31),
      },
    }
  }
  // period === "all" → tidak ada filter tanggal

  // ── Ambil SEMUA leads (bukan hanya aktif) ────────────────
  const allLeads = await prisma.lead.findMany({
    where: dateFilter,
    include: {
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  // ── Hitung tiap lead ──────────────────────────────────────
  const leadsWithCalc = allLeads.map((lead) => {
    const probability   = STATUS_PROBABILITY[lead.status as keyof typeof STATUS_PROBABILITY] ?? 0
    const value         = Number(lead.value ?? 0)
    const weightedValue = Math.round(value * probability)
    const isDeal        = lead.status === LeadStatus.DEAL
    const isRecycle     = lead.status === LeadStatus.RECYCLE

    return {
      id:             lead.id,
      title:          lead.title,
      clientName:     lead.clientName,
      clientCompany:  lead.clientCompany,
      status:         lead.status,
      value,
      probability:    Math.round(probability * 100),
      weightedValue,
      assignedTo:     lead.assignedTo?.name ?? "-",
      assignedToId:   lead.assignedTo?.id,
      isDeal,
      isRecycle,
      createdAt:      lead.createdAt.toISOString(),
      closedAt:       lead.closedAt?.toISOString() ?? null,
      // Penjelasan perhitungan
      calculation: {
        formula:       `Rp ${value.toLocaleString("id-ID")} × ${Math.round(probability * 100)}%`,
        explanation:   getStatusExplanation(lead.status),
        valueFormatted: `Rp ${value.toLocaleString("id-ID")}`,
        probabilityPct: `${Math.round(probability * 100)}%`,
        weightedFormatted: `Rp ${weightedValue.toLocaleString("id-ID")}`,
      },
    }
  })

  // ── Summary ───────────────────────────────────────────────
  const activeLeads  = leadsWithCalc.filter((l) => !l.isRecycle)
  const dealLeads    = leadsWithCalc.filter((l) => l.isDeal)
  const recycleLeads = leadsWithCalc.filter((l) => l.isRecycle)

  const totalForecast = activeLeads.reduce((s, l) => s + l.weightedValue, 0)
  const totalPipeline = activeLeads.filter((l) => !l.isDeal).reduce((s, l) => s + l.value, 0)
  const totalRevenue  = dealLeads.reduce((s, l) => s + l.value, 0)
  const bestCase      = activeLeads.filter((l) => !l.isDeal).reduce((s, l) => s + l.value, 0)
  const worstCase     = activeLeads
    .filter((l) => l.probability >= 60)
    .reduce((s, l) => s + l.value, 0)

  // ── Pipeline by Status ────────────────────────────────────
  const byStatus: Record<string, { count: number; totalValue: number; weightedValue: number; probability: number }> = {}
  leadsWithCalc.forEach((l) => {
    if (!byStatus[l.status]) {
      byStatus[l.status] = { count: 0, totalValue: 0, weightedValue: 0, probability: l.probability }
    }
    byStatus[l.status].count++
    byStatus[l.status].totalValue    += l.value
    byStatus[l.status].weightedValue += l.weightedValue
  })

  const forecastByStatus = Object.entries(byStatus).map(([status, d]) => ({
    status,
    count:         d.count,
    totalValue:    d.totalValue,
    weightedValue: d.weightedValue,
    probability:   d.probability,
    calculation: {
      formula:      `${d.count} lead × avg value × ${d.probability}%`,
      explanation:  getStatusExplanation(status),
    },
  }))

  // ── Monthly history ───────────────────────────────────────
  const monthlyHistory = []
  for (let i = 11; i >= 0; i--) {
    const d     = subMonths(new Date(), i)
    const start = startOfMonth(d)
    const end   = endOfMonth(d)
    const monthLeads = allLeads.filter((l) => {
      const created = new Date(l.createdAt)
      return created >= start && created <= end
    })
    const deals = monthLeads.filter(
  (l) => l.status === LeadStatus.DEAL
)

const revenue = deals.reduce(
  (s, l) => s + Number(l.value ?? 0),
  0
)

const pipeline = monthLeads.filter(
  (l) =>
    l.status !== LeadStatus.DEAL &&
    l.status !== LeadStatus.RECYCLE
)

const pipelineV = pipeline.reduce(
  (s, l) => s + Number(l.value ?? 0),
  0
)
    monthlyHistory.push({
      month:         format(d, "MMM yyyy"),
      monthShort:    format(d, "MMM"),
      year:          d.getFullYear(),
      totalLeads:    monthLeads.length,
      dealLeads:     deals.length,
      revenue,
      pipelineValue: pipelineV,
    })
  }

  return NextResponse.json({
    summary: {
      totalLeads:        allLeads.length,
      activeLeads:       activeLeads.length,
      dealLeads:         dealLeads.length,
      recycleLeads:      recycleLeads.length,
      totalForecast,
      totalPipeline,
      totalRevenue,
      bestCase,
      worstCase,
    },
    leads:             leadsWithCalc,
    forecastByStatus,
    monthlyHistory,
    probabilityGuide: getProbabilityGuide(),
  })
}

function getStatusExplanation(status: string): string {
  const map: Record<string, string> = {
    APPROACH:     "Tahap awal, lead baru dikirim. Probabilitas rendah (10%) karena belum ada respons.",
    COLD_LEAD:    "Lead sudah merespons. Probabilitas naik (20%) karena ada indikasi ketertarikan awal.",
    DECK_REQUEST: "Client meminta deck/proposal. Probabilitas tinggi (35%) karena ada niat serius.",
    MEETING:      "Tahap meeting/presentasi. Probabilitas signifikan (60%) karena sudah tatap muka.",
    DEAL:         "Deal berhasil ditutup. Probabilitas 100% — nilai ini adalah revenue confirmed.",
    RECYCLE:      "Lead gagal, masuk antrian ulang. Probabilitas sangat rendah (5%).",
  }
  return map[status] ?? "Tidak ada penjelasan."
}

function getProbabilityGuide() {
  return [
    { status: "APPROACH",     label: "Approach",     probability: 10,  color: "#6366f1", explanation: "Lead baru terkirim, belum ada respons dari client." },
    { status: "COLD_LEAD",    label: "Cold Lead",    probability: 20,  color: "#4B9EF3", explanation: "Client sudah merespons — ada ketertarikan awal." },
    { status: "DECK_REQUEST", label: "Deck Request", probability: 35,  color: "#f59e0b", explanation: "Client meminta deck/proposal — niat cukup serius." },
    { status: "MEETING",      label: "Meeting",      probability: 60,  color: "#8b5cf6", explanation: "Tahap presentasi/meeting — potensi closing signifikan." },
    { status: "DEAL",         label: "Deal",         probability: 100, color: "#10b981", explanation: "Deal ditutup — revenue confirmed." },
    { status: "RECYCLE",      label: "Recycle",      probability: 5,   color: "#94a3b8", explanation: "Gagal, dijadwalkan untuk pendekatan ulang." },
  ]
}