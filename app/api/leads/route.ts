import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission, UI_PERMISSIONS } from "@/lib/permissions"
import { notifyLeadChange, notifyDashboardRefresh, notifyForecastRefresh } from "@/lib/services/broadcastService"
import type { RoleType } from "@/lib/permissions"
import { z } from "zod"

const createLeadSchema = z.object({
  title:         z.string().min(1),
  clientName:    z.string().min(1),
  clientEmail:   z.union([z.string().email(), z.string().max(0), z.null()]).optional(),
  clientPhone:   z.string().optional().nullable(),
  clientCompany: z.string().optional().nullable(),
  value:         z.union([
    z.number(),
    z.string().transform((v) => v === "" ? undefined : Number(v)),
    z.null(),
  ]).optional(),
  source:        z.string().optional().nullable(),
  description:   z.string().optional().nullable(),
  priority:      z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assignedToId:  z.string().optional().nullable(),
})


export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!hasPermission(role, "read", "lead")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const status  = searchParams.get("status")
    const search  = searchParams.get("search")
    const priority = searchParams.get("priority")

     const leads = await prisma.lead.findMany({
      where: {
        ...(status   ? { status:   status as any   } : {}),
        ...(priority ? { priority: priority as any } : {}),
        ...(search   ? {
          OR: [
            { title:         { contains: search, mode: "insensitive" } },
            { clientName:    { contains: search, mode: "insensitive" } },
            { clientCompany: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true, role: true } },
        createdBy:  { select: { id: true, name: true } },
        _count:     { select: { activities: true } },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(leads)
  } catch (err: any) {
    console.error("GET /api/leads error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!UI_PERMISSIONS.canCreateLead(role)) {
    return NextResponse.json(
      { error: "Forbidden — hanya SUPER_ADMIN, SALES_MANAGER, dan ACCOUNT_EXECUTIVE yang bisa membuat lead" },
      { status: 403 }
    )
  }

  try {
    const body    = await req.json()
    const cleaned = Object.fromEntries(
      Object.entries(body).map(([k, v]) => [k, v === "" ? null : v])
    )

    const parsed = createLeadSchema.safeParse(cleaned)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!userExists) {
      return NextResponse.json(
        { error: "Session tidak valid. Silakan logout dan login ulang." },
        { status: 401 }
      )
    }

    // AE → assignedToId otomatis ke diri sendiri
    const assignedToId = role === "ACCOUNT_EXECUTIVE"
      ? session.user.id
      : parsed.data.assignedToId ?? null

    const lead = await prisma.lead.create({
      data: {
        title:         parsed.data.title,
        clientName:    parsed.data.clientName,
        clientEmail:   parsed.data.clientEmail   ?? null,
        clientPhone:   parsed.data.clientPhone   ?? null,
        clientCompany: parsed.data.clientCompany ?? null,
        clientPosition: body.clientPosition ?? null,
        value:         parsed.data.value         ?? null,
        source:        parsed.data.source        ?? null,
        description:   parsed.data.description   ?? null,
        priority:      parsed.data.priority      ?? "MEDIUM",
        assignedToId,
        createdById:   session.user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true} },
        createdBy:  { select: { id: true, name: true } },
        _count:     { select: { activities: true } },
      },
    })

    // Broadcast ke semua user
    notifyLeadChange("lead:created", {
      leadId:       lead.id,
      assignedToId: lead.assignedToId,
      status:       lead.status,
      updatedBy:    session.user.id,
    })
    notifyDashboardRefresh(session.user.id)
    notifyForecastRefresh(session.user.id)

    return NextResponse.json(lead, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/leads error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}