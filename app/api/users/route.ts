import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import type { RoleType } from "@/lib/permissions"
import { z } from "zod"
import bcrypt from "bcryptjs"

const createUserSchema = z.object({
  name:     z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(["ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE", "VIEWER"]),
  phone:    z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!hasPermission(role, "read", "user")) {
    return NextResponse.json(
      { error: "Forbidden", required: "SALES_MANAGER" },
      { status: 403 }
    )
  }

  const users = await prisma.user.findMany({
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      phone:     true,
      isActive:  true,
      createdAt: true,
      _count: { select: { assignedLeads: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = session.user.role as RoleType

  if (!hasPermission(role, "create", "user")) {
    return NextResponse.json(
      { error: "Forbidden", required: "SALES_MANAGER" },
      { status: 403 }
    )
  }

  const body   = await req.json()
  const parsed = createUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // SALES_MANAGER tidak bisa membuat user dengan role lebih tinggi
  const actorLevel = { ADMIN: 1, EXECUTIVE: 2, SALES_MANAGER: 3, ACCOUNT_EXECUTIVE: 4, VIEWER: 5 }
  if (
    role === "SALES_MANAGER" &&
    actorLevel[parsed.data.role as RoleType] <= actorLevel["SALES_MANAGER"]
  ) {
    return NextResponse.json(
      { error: "Forbidden: Tidak bisa membuat user dengan role lebih tinggi" },
      { status: 403 }
    )
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10)
  const user   = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}