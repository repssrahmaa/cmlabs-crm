import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { RoleType } from "@/lib/permissions"
import { hasPermission } from "@/lib/permissions"

// ── Google Meet/Calendar helper ────────────────────────────────
async function createGoogleMeetEvent(params: {
  title:      string
  description: string
  startDateTime: string
  endDateTime:   string
  invites:    string[]
}): Promise<{ meetLink: string; eventId: string } | null> {
  // Production: integrasikan dengan Google Calendar API
  // https://developers.google.com/calendar/api/v3/reference/events/insert
  // Untuk sekarang return mock meet link
  const mockMeetId = Math.random().toString(36).substring(2, 12)
  return {
    meetLink: `https://meet.google.com/${mockMeetId}`,
    eventId:  `google-event-${mockMeetId}`,
  }
  // Production implementation:
  // const { google } = require('googleapis')
  // const auth = new google.auth.OAuth2(...)
  // const calendar = google.calendar({ version: 'v3', auth })
  // const event = await calendar.events.insert({ ... })
  // return { meetLink: event.data.hangoutLink, eventId: event.data.id }
}

const baseSchema = z.object({
  title:    z.string().min(1),
  content:  z.string().optional(),
  isDone:   z.boolean().optional(),
  dueDate:  z.string().optional().nullable(),
})

const noteSchema = baseSchema.extend({
  type: z.literal("INTERNAL_NOTE"),
})

const emailSchema = baseSchema.extend({
  type:        z.literal("EMAIL_SENT"),
  emailTo:     z.string().email(),
  emailSubject: z.string().min(1),
})

const callSchema = baseSchema.extend({
  type:     z.literal("CALL"),
  duration: z.number().optional(),
  outcome:  z.string().optional(),
})

const meetingSchema = baseSchema.extend({
  type:        z.literal("MEETING"),
  startDate:   z.string(),
  startTime:   z.string(),
  endTime:     z.string(),
  description: z.string().optional(),
  invites:     z.array(z.string().email()).optional(),
  createMeet:  z.boolean().optional(),
})

const taskSchema = baseSchema.extend({
  type: z.literal("TASK"),
})

const commSchema = z.discriminatedUnion("type", [
  noteSchema, emailSchema, callSchema, meetingSchema, taskSchema,
])

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: leadId } = await context.params
  const role = session.user.role as RoleType

  if (!hasPermission(role, "create", "activity")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lead = await prisma.lead.findUnique({
    where:  { id: leadId },
    select: { id: true, assignedToId: true, clientEmail: true },
  })
  if (!lead) {
    return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 })
  }

  if (role === "ACCOUNT_EXECUTIVE" && lead.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Hanya bisa menambah aktivitas di lead sendiri" }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = commSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  let activityData: any = {
    type:    data.type,
    title:   data.title,
    content: data.content ?? null,
    isDone:  data.isDone ?? (data.type === "INTERNAL_NOTE"),
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    leadId,
    userId:  session.user.id,
  }

  // Handle Meeting + Google Meet
  if (data.type === "MEETING") {
    const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`)
    const endDateTime   = new Date(`${data.startDate}T${data.endTime}:00`)

    activityData.meetStart   = startDateTime
    activityData.meetEnd     = endDateTime
    activityData.meetInvites = data.invites ?? []
    activityData.description = data.description ?? null
    activityData.dueDate     = startDateTime

    if (data.createMeet) {
      const meetResult = await createGoogleMeetEvent({
        title:         data.title,
        description:   data.description ?? "",
        startDateTime: startDateTime.toISOString(),
        endDateTime:   endDateTime.toISOString(),
        invites:       data.invites ?? [],
      })
      if (meetResult) {
        activityData.meetLink    = meetResult.meetLink
        activityData.meetEventId = meetResult.eventId
        activityData.metadata    = {
          meetLink:    meetResult.meetLink,
          invitesSent: data.invites ?? [],
        }
      }
    }
  }

  if (data.type === "CALL") {
    const callData = data as z.infer<typeof callSchema>
    activityData.metadata = {
      duration: callData.duration ?? null,
      outcome:  callData.outcome ?? null,
    }
  }

  const activity = await prisma.activity.create({ data: activityData })
  return NextResponse.json(activity, { status: 201 })
}