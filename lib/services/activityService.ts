import { prisma } from "@/lib/prisma"
import { ActivityType } from "@prisma/client"

// ── Types ─────────────────────────────────────────────

export interface CreateNoteInput {
  leadId:  string
  userId:  string
  title:   string
  content: string
}

export interface CreateCallInput {
  leadId:      string
  userId:      string
  title:       string
  description?: string
  dueDate?:    Date
}

// ── 1. Create Internal Note ───────────────────────────
export async function createInternalNote(input: CreateNoteInput) {
  const activity = await prisma.activity.create({
    data: {
      leadId:  input.leadId,
      userId:  input.userId,
      type:    ActivityType.INTERNAL_NOTE,
      title:   input.title,
      content: input.content,
      isDone:  true, // notes are always "done"
    },
    include: {
      user:  { select: { id: true, name: true, avatar: true } }
    },
  })

  return activity
}


// ── 3. Create Call/Meeting/Task ───────────────────────
export async function createCallActivity(input: CreateCallInput) {
  const activity = await prisma.activity.create({
    data: {
      leadId:      input.leadId,
      userId:      input.userId,
      type:        ActivityType.CALL,
      title:       input.title,
      description: input.description,
      dueDate:     input.dueDate,
      isDone:      false,
    },
    include: {
      user:  { select: { id: true, name: true, avatar: true } }
    },
  })

  return activity
}

// ── 4. Get Timeline by Lead ───────────────────────────
export async function getLeadTimeline(leadId: string) {
  const activities = await prisma.activity.findMany({
    where:   { leadId },
    include: {
      user:  { select: { id: true, name: true, avatar: true, role: true } }
    },
    orderBy: { createdAt: "desc" },
  })

  return activities
}

// ── 5. Mark Activity Done ─────────────────────────────
export async function markActivityDone(activityId: string, isDone: boolean) {
  return prisma.activity.update({
    where: { id: activityId },
    data:  { isDone },
    include: {
      user:  { select: { id: true, name: true } }
    },
  })
}

// ── 6. Delete Activity ────────────────────────────────
export async function deleteActivity(activityId: string) {
  return prisma.activity.delete({
    where: { id: activityId },
  })
}