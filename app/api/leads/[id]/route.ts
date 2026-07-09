import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission, UI_PERMISSIONS } from "@/lib/permissions"
import { notifyLeadChange, notifyDashboardRefresh, notifyForecastRefresh } from "@/lib/services/broadcastService"
import type { RoleType } from "@/lib/permissions"
import { z } from "zod"

const updateLeadSchema = z.object({
  title:         z.string().min(1).optional(),
  clientName:    z.string().min(1).optional(),
  clientEmail:   z.union([z.string().email(), z.string().max(0), z.null()]).optional(),
  clientPhone:   z.string().optional().nullable(),
  clientCompany: z.string().optional().nullable(),
  clientPosition:z.string().optional().nullable(),

  status:        z.enum([
    "APPROACH",
    "COLD_LEAD",
    "NEEDS_IDENTIFIED",
    "DECK_REQUEST",
    "MEETING",
    "CONTRACT_SENT",
    "DEAL",
    "RECYCLE"
  ]).optional(),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH"
  ]).optional(),

  value: z.union([
    z.number(),
    z.string().transform((v) => v === "" ? undefined : Number(v)),
    z.null(),
  ]).optional(),

  source:        z.string().optional().nullable(),
  description:   z.string().optional().nullable(),
  assignedToId:  z.string().optional().nullable(),
})
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const role   = session.user.role as RoleType

  if (!hasPermission(role, "read", "lead")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, role: true } },
      createdBy:  { select: { id: true, name: true } },
      activities: {
        include: {
          user:  { select: { id: true, name: true} }
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { activities: true } },
    },
  })

  if (!lead) {
    return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const role   = session.user.role as RoleType

  const existing = await prisma.lead.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })
  }

  // Cek permission update dengan ownership check untuk AE
  const canEdit = hasPermission(role, "update", "lead", {
    ownerId:       existing.assignedToId,
    currentUserId: session.user.id,
  })

  if (!canEdit) {
    return NextResponse.json(
      {
        error: role === "ACCOUNT_EXECUTIVE"
          ? "Anda hanya bisa mengubah lead yang ditugaskan ke Anda"
          : "Forbidden",
      },
      { status: 403 }
    )
  }

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })
  }

  const cleaned = Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, v === "" ? null : v])
  )

  const parsed = updateLeadSchema.safeParse(cleaned)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // AE tidak bisa re-assign lead ke orang lain
  if (role === "ACCOUNT_EXECUTIVE") {
    delete parsed.data.assignedToId
  }

  const closedAt =
    parsed.data.status === "DEAL" || parsed.data.status === "RECYCLE"
      ? new Date()
      : parsed.data.status && !["DEAL", "RECYCLE"].includes(parsed.data.status)
      ? null
      : undefined

  const dataToUpdate = Object.fromEntries(
    Object.entries({
      ...parsed.data,
      ...(closedAt !== undefined ? { closedAt } : {}),
    }).filter(([, v]) => v !== undefined)
  )

  const lead = await prisma.lead.update({
    where: { id },
    data:  dataToUpdate,
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy:  { select: { id: true, name: true } },
      _count:     { select: { activities: true } },
    },
  })

  notifyLeadChange("lead:updated", {
    leadId:       lead.id,
    assignedToId: lead.assignedToId,
    status:       lead.status,
    updatedBy:    session.user.id,
  })
  notifyDashboardRefresh(session.user.id)
  notifyForecastRefresh(session.user.id)

  return NextResponse.json(lead)
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!UI_PERMISSIONS.canDeleteLead(role)) {
    return NextResponse.json(
      { error: "Forbidden — hanya SUPER_ADMIN dan SALES_MANAGER yang bisa menghapus lead" },
      { status: 403 }
    )
  }

  const { id } = await context.params
  const existing = await prisma.lead.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })
  }

  await prisma.lead.delete({ where: { id } })

  notifyLeadChange("lead:deleted", {
    leadId:    id,
    updatedBy: session.user.id,
  })
  notifyDashboardRefresh(session.user.id)
  notifyForecastRefresh(session.user.id)

  return NextResponse.json({ message: "Lead berhasil dihapus" })
}