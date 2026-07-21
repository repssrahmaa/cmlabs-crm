import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"
import type { RoleType } from "@/lib/permissions"

const updateDocSchema = z.object({
  title:   z.string().min(1).optional(),
  content: z.record(z.any(), z.string()).optional(),
  status:  z.enum(["DRAFT", "FINALIZED", "SENT"]).optional(),
})

// GET /api/documents/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const doc = await prisma.document.findUnique({
    where:   { id },
    include: {
      lead: {
        select: {
          id:            true,
          title:         true,
          clientName:    true,
          clientEmail:   true,
          clientPhone:   true,
          clientCompany: true,
          value:         true,
          assignedTo:    { select: { name: true, email: true } },
          createdBy:     { select: { name: true } },
        },
      },
    },
  })

  if (!doc) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json(doc)
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id }  = await context.params
  const body    = await req.json()
  const role    = session.user.role as RoleType

  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })

  // Status transition validation
  const VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFT:     ["FINALIZED"],
    FINALIZED: ["SENT"],
    SENT:      [],
  }

  if (body.status && !VALID_TRANSITIONS[doc.status]?.includes(body.status)) {
    return NextResponse.json(
      { error: `Tidak bisa mengubah status dari ${doc.status} ke ${body.status}` },
      { status: 400 }
    )
  }

  const updated = await prisma.document.update({
    where: { id },
    data:  { status: body.status ?? doc.status },
    include: {
      lead: {
        select: {
          id: true, title: true, clientName: true,
          clientEmail: true, clientPhone: true,
          clientCompany: true, value: true,
          assignedTo: { select: { name: true } },
        },
      },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const role   = session.user.role as RoleType

  // Hanya ADMIN dan SALES_MANAGER yang bisa hapus
  if (!["ADMIN", "SALES_MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.document.delete({ where: { id } })
  return NextResponse.json({ message: "Dokumen berhasil dihapus" })
}