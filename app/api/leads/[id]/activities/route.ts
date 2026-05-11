import { NextRequest, NextResponse } from "next/server"
import { ActivityType } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createActivitySchema = z.object({
  type:        z.nativeEnum(ActivityType),
  title:       z.string().min(1),
  description: z.string().optional(),
  dueDate:     z.string().optional(),
  isDone:      z.boolean().optional(),
})

// GET /api/leads/[id]/activities
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params   // ← await params

  const activities = await prisma.activity.findMany({
    where:   { leadId: id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(activities)
}

// POST /api/leads/[id]/activities
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params   // ← await params

  const body   = await req.json()
  const parsed = createActivitySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const activity = await prisma.activity.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      leadId:  id,
      userId:  session.user.id,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  return NextResponse.json(activity, { status: 201 })
}