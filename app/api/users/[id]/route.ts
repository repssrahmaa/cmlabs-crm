import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hasPermission, canManage, UI_PERMISSIONS } from "@/lib/permissions"
import type { RoleType } from "@/lib/permissions"
import { z } from "zod"
import bcrypt from "bcryptjs"

const updateUserSchema = z.object({
  name:     z.string().min(1).optional(),
  email:    z.string().email().optional(),
  role:     z.enum(["SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER", "ACCOUNT_EXECUTIVE", "VIEWER"]).optional(),
  phone:    z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
})
const toggleActiveSchema = z.object({
  isActive: z.boolean(),
})


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id }  = await context.params
  const role    = session.user.role as RoleType
  const isSelf  = session.user.id === id

  // Hanya bisa edit diri sendiri atau punya permission manage user
  if (!isSelf && !hasPermission(role, "update", "user")) {
    return NextResponse.json(
      { error: "Forbidden", required: "SALES_MANAGER" },
      { status: 403 }
    )
  }

  const body   = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Cek target user
  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // SALES_MANAGER tidak bisa ubah role
  if (!isSelf && parsed.data.role && !UI_PERMISSIONS.canChangeRole(role)) {
    return NextResponse.json(
      { error: "Forbidden: Tidak bisa mengubah role user" },
      { status: 403 }
    )
  }

  // Tidak bisa manage user dengan level lebih tinggi
 if (!isSelf && !canManage(role, targetUser.role as RoleType)) {
    return NextResponse.json(
      { error: "Forbidden: Tidak bisa mengelola user dengan role lebih tinggi" },
      { status: 403 }
    )
  }

  // Cegah menonaktifkan akun sendiri meski punya permission — supaya tidak terkunci
  if (isSelf && parsed.data.isActive === false) {
    return NextResponse.json(
      { error: "Tidak bisa menonaktifkan akun sendiri" },
      { status: 400 }
    )
  }

  const data: any = { ...parsed.data }
  if (parsed.data.password) {
    data.password = await bcrypt.hash(parsed.data.password, 10)
  }

  if (isSelf && !hasPermission(role, "update", "user")) {
    delete data.role
    delete data.isActive
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
  })

  return NextResponse.json(user)
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

  if (!UI_PERMISSIONS.canDeleteUser(role)) {
    return NextResponse.json(
      { error: "Forbidden", required: "SUPER_ADMIN" },
      { status: 403 }
    )
  }

  const { id } = await context.params

  if (session.user.id === id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 }
    )
  }

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: "User berhasil dihapus" })
}