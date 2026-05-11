import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/mail/mailService"
import { buildHtmlEmail } from "@/lib/mail/emailTemplates"
import { ActivityType } from "@prisma/client"

// ── Types ─────────────────────────────────────────────

export interface CreateNoteInput {
  leadId:  string
  userId:  string
  title:   string
  content: string
}

export interface CreateEmailInput {
  leadId:    string
  userId:    string
  toAddress: string
  subject:   string
  body:      string
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
      user:  { select: { id: true, name: true, avatar: true } },
      email: true,
    },
  })

  return activity
}

// ── 2. Send Email (Create Activity + Send) ────────────
export async function sendEmailFromLead(input: CreateEmailInput) {
  // Ambil data lead dan user untuk template
  const [lead, user] = await Promise.all([
    prisma.lead.findUnique({
      where:  { id: input.leadId },
      select: { title: true, clientName: true },
    }),
    prisma.user.findUnique({
      where:  { id: input.userId },
      select: { name: true, email: true },
    }),
  ])

  if (!lead || !user) {
    throw new Error("Lead atau user tidak ditemukan")
  }

  // Build HTML email
  const htmlBody = buildHtmlEmail({
    clientName:  lead.clientName,
    senderName:  user.name,
    subject:     input.subject,
    body:        input.body,
    leadTitle:   lead.title,
    companyName: "CMLabs",
  })

  // 1. Buat Activity dulu (status PENDING)
  const activity = await prisma.activity.create({
    data: {
      leadId:  input.leadId,
      userId:  input.userId,
      type:    ActivityType.EMAIL_SENT,
      title:   input.subject,
      content: input.body,
      isDone:  false, // akan di-update setelah send
      metadata: {
        toAddress:   input.toAddress,
        fromAddress: user.email,
        subject:     input.subject,
      },
      email: {
        create: {
          toAddress:   input.toAddress,
          fromAddress: user.email,
          subject:     input.subject,
          body:        input.body,
          htmlBody,
          status:      "PENDING",
        },
      },
    },
    include: {
      user:  { select: { id: true, name: true, avatar: true } },
      email: true,
    },
  })

  // 2. Kirim email
  const result = await sendEmail({
    to:      input.toAddress,
    from:    user.email,
    subject: input.subject,
    body:    input.body,
    html:    htmlBody,
  })

  // 3. Update status berdasarkan hasil
  const updatedEmail = await prisma.email.update({
    where: { activityId: activity.id },
    data:  {
      status:   result.success ? "SENT" : "FAILED",
      sentAt:   result.success ? new Date() : null,
      errorLog: result.error ?? null,
    },
  })

  // 4. Update activity isDone
  await prisma.activity.update({
    where: { id: activity.id },
    data:  { isDone: result.success },
  })

  return {
    activity: { ...activity, email: updatedEmail },
    emailResult: result,
  }
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
      user:  { select: { id: true, name: true, avatar: true } },
      email: true,
    },
  })

  return activity
}

// ── 4. Get Timeline by Lead ───────────────────────────
export async function getLeadTimeline(leadId: string) {
  const activities = await prisma.activity.findMany({
    where:   { leadId },
    include: {
      user:  { select: { id: true, name: true, avatar: true, role: true } },
      email: true,
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
      user:  { select: { id: true, name: true } },
      email: true,
    },
  })
}

// ── 6. Delete Activity ────────────────────────────────
export async function deleteActivity(activityId: string) {
  return prisma.activity.delete({
    where: { id: activityId },
  })
}