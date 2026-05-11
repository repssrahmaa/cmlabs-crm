import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import type { RoleType } from "@/lib/permissions"
import { z } from "zod"
import { Prisma } from "@prisma/client"

const createDocSchema = z.object({
  leadId:  z.string().min(1),
  type:    z.enum(["INVOICE", "SPK", "MOU", "OTHER"]),
  title:   z.string().min(1),
  content: z.record(z.string(), z.unknown()),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!hasPermission(role, "read", "document")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const leadId      = searchParams.get("leadId")
  const statusFilter = searchParams.get("status")

  // SUPER_ADMIN, SALES_MANAGER, EXECUTIVE — lihat semua dokumen
  // ACCOUNT_EXECUTIVE — lihat semua dokumen yang sudah FINALIZED/SENT
  //                     + semua dokumen dari lead miliknya sendiri
  let whereClause: any = {}

  if (leadId) {
    whereClause.leadId = leadId
  }

  if (statusFilter) {
    whereClause.status = statusFilter
  }

  if (role === "ACCOUNT_EXECUTIVE") {
    whereClause = {
      ...whereClause,
      OR: [
        { status: { in: ["FINALIZED", "SENT"] } },      // semua yg sudah final
        { lead: { assignedToId: session.user.id } },      // atau lead miliknya
      ],
    }
  }

  const docs = await prisma.document.findMany({
    where: whereClause,
    include: {
      lead: {
        select: {
          id:            true,
          title:         true,
          clientName:    true,
          clientEmail:   true,
          clientCompany: true,
          value:         true,
          assignedTo:    { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!["SUPER_ADMIN", "SALES_MANAGER", "ACCOUNT_EXECUTIVE"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = createDocSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // AE hanya bisa buat dokumen dari lead miliknya
  if (role === "ACCOUNT_EXECUTIVE") {
    const lead = await prisma.lead.findUnique({
      where:  { id: parsed.data.leadId },
      select: { assignedToId: true },
    })
    if (lead?.assignedToId !== session.user.id) {
      return NextResponse.json(
        { error: "Anda hanya bisa membuat dokumen dari lead yang ditugaskan ke Anda" },
        { status: 403 }
      )
    }
  }

  const doc = await prisma.document.create({
    data: {
      leadId:  parsed.data.leadId,
      type:    parsed.data.type,
      title:   parsed.data.title,
      content: parsed.data.content as Prisma.InputJsonValue,
      status:  "DRAFT",
    },
    include: {
      lead: {
        select: {
          title:         true,
          clientName:    true,
          clientEmail:   true,
          clientCompany: true,
          value:         true,
        },
      },
    },
  })

  return NextResponse.json(doc, { status: 201 })
}