// app/api/leads/[id]/communications/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import { z } from "zod"
import type { RoleType } from "@/lib/permissions"

// Schema sederhana — tidak discriminated union
const activitySchema = z.object({
  title:      z.string().min(1, "Judul tidak boleh kosong"),
  content:    z.string().optional().nullable(),
  isDone:     z.boolean().optional(),
  dueDate:    z.string().optional().nullable(),
  meetLink:   z.string().optional().nullable(),
  meetStart:  z.string().optional().nullable(),
  meetEnd:    z.string().optional().nullable(),
  meetInvites: z.array(z.string()).optional().default([]),
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: leadId } = await context.params
  const role = session.user.role as RoleType

  if (!hasPermission(role, "create", "activity")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId }, select: { id: true, assignedToId: true },
  })
  if (!lead) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })

  if (role === "ACCOUNT_EXECUTIVE" && lead.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Hanya bisa menambah aktivitas di lead sendiri" }, { status: 403 })
  }

  let body: any
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })
  }

  const parsed = activitySchema.safeParse(body)
  if (!parsed.success) {
  return NextResponse.json(
    { errors: parsed.error.issues },
    { status: 400 }
  )
}

const d = parsed.data

try {
  const activity = await prisma.activity.create({
    data: {
      leadId,
      userId: session.user.id,

      type: "NOTE",

      title: d.title,

      content: d.content ?? null,

      dueDate: d.dueDate
        ? new Date(d.dueDate)
        : null,

      isDone: d.isDone ?? false,

      metadata: {
        meetLink: d.meetLink ?? null,
        meetStart: d.meetStart ?? null,
        meetEnd: d.meetEnd ?? null,
        meetInvites: d.meetInvites ?? [],
      },
    },
  })

  return NextResponse.json({
    success: true,
    data: activity,
  })
} catch (error) {
  console.error("CREATE ACTIVITY ERROR:", error)

  return NextResponse.json(
    {
      success: false,
      error: "Gagal membuat activity",
    },
    { status: 500 }
  )
}
}