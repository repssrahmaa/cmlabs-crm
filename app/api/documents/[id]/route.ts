import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

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

// PUT /api/documents/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const body   = await req.json()
  const parsed = updateDocSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal" },
      { status: 400 }
    )
  }

  const doc = await prisma.document.update({
    where: { id },
    data:  parsed.data,
    include: {
      lead: { select: { title: true, clientName: true } },
    },
  })

  return NextResponse.json(doc)
}

// DELETE /api/documents/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  await prisma.document.delete({ where: { id } })

  return NextResponse.json({ message: "Dokumen dihapus" })
}