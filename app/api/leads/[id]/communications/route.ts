import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import {
  createInternalNote,
  sendEmailFromLead,
  createCallActivity,
} from "@/lib/services/activityService"
import { notifyDashboardRefresh } from "@/lib/services/broadcastService"

const noteSchema = z.object({
  type:    z.literal("INTERNAL_NOTE"),
  title:   z.string().min(1),
  content: z.string().min(1),
})

const emailSchema = z.object({
  type:      z.literal("EMAIL_SENT"),
  toAddress: z.string().email(),
  subject:   z.string().min(1),
  body:      z.string().min(1),
})

const callSchema = z.object({
  type:        z.enum(["CALL", "MEETING", "TASK"]),
  title:       z.string().min(1),
  description: z.string().optional(),
  dueDate:     z.string().optional(),
})

const communicationSchema = z.discriminatedUnion("type", [
  noteSchema,
  emailSchema,
  callSchema,
])

// POST /api/leads/[id]/communications
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: leadId } = await context.params

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 })
  }

  const parsed = communicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    let result

    if (parsed.data.type === "INTERNAL_NOTE") {
      result = await createInternalNote({
        leadId,
        userId:  session.user.id,
        title:   parsed.data.title,
        content: parsed.data.content,
      })
      return NextResponse.json(result, { status: 201 })
    }

    if (parsed.data.type === "EMAIL_SENT") {
      result = await sendEmailFromLead({
        leadId,
        userId:    session.user.id,
        toAddress: parsed.data.toAddress,
        subject:   parsed.data.subject,
        body:      parsed.data.body,
      })
      return NextResponse.json(result, { status: 201 })
    }

    // CALL, MEETING, TASK
    result = await createCallActivity({
      leadId,
      userId:      session.user.id,
      title:       parsed.data.title,
      description: parsed.data.description,
      dueDate:     parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    })
    notifyDashboardRefresh(session.user.id)

    return NextResponse.json(result, { status: 201 })

  } catch (err: any) {
    console.error("Communication error:", err)
    return NextResponse.json(
      { error: err.message ?? "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}