import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"

const updateProfileSchema = z.object({
  name:        z.string().min(1).optional(),
  phone:       z.string().optional(),
  oldPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

// GET /api/profile
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true,
      role: true, phone: true, avatar: true,
      createdAt: true,
      _count: { select: { assignedLeads: true, activities: true } },
    },
  })

  return NextResponse.json(user)
}

// PUT /api/profile
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body   = await req.json()
  const parsed = updateProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data: any = {}

  if (parsed.data.name)  data.name  = parsed.data.name
  if (parsed.data.phone) data.phone = parsed.data.phone

  // Ganti password
  if (parsed.data.newPassword) {
    if (!parsed.data.oldPassword) {
      return NextResponse.json(
        { error: "Password lama harus diisi" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const match = await bcrypt.compare(parsed.data.oldPassword, user!.password)
    if (!match) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai" },
        { status: 400 }
      )
    }

    data.password = await bcrypt.hash(parsed.data.newPassword, 10)
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true, name: true, email: true,
      role: true, phone: true,
    },
  })

  return NextResponse.json(updated)
}