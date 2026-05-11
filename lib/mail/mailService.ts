// ── Mail Service ──────────────────────────────────────
// Supports: Mock (dev) | Resend (prod)
// To use Resend: npm install resend
// Then set RESEND_API_KEY in .env

export interface SendEmailPayload {
  to:      string
  from?:   string
  subject: string
  body:    string
  html?:   string
}

export interface SendEmailResult {
  success:  boolean
  messageId?: string
  error?:   string
}

// ── Mock sender untuk development ─────────────────────
async function sendViaMock(payload: SendEmailPayload): Promise<SendEmailResult> {
  // Simulasi delay network
  await new Promise((r) => setTimeout(r, 300))

  console.log("📧 [MOCK EMAIL SENT]")
  console.log(`   To:      ${payload.to}`)
  console.log(`   From:    ${payload.from ?? "noreply@cmlabs.co"}`)
  console.log(`   Subject: ${payload.subject}`)
  console.log(`   Body:    ${payload.body.substring(0, 100)}...`)

  // Simulasi 5% failure rate untuk testing
  if (Math.random() < 0.05) {
    return { success: false, error: "Mock: Simulated send failure" }
  }

  return {
    success:   true,
    messageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  }
}

// ── Resend sender untuk production ────────────────────
async function sendViaResend(payload: SendEmailPayload): Promise<SendEmailResult> {
  try {
    // Dynamic import — hanya load kalau Resend tersedia
    const { Resend } = await import("resend").catch(() => {
      throw new Error("Resend not installed. Run: npm install resend")
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from:    payload.from ?? "CMLabs CRM <noreply@cmlabs.co>",
      to:      [payload.to],
      subject: payload.subject,
      html:    payload.html ?? `<p>${payload.body.replace(/\n/g, "<br>")}</p>`,
      text:    payload.body,
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ── Main export ───────────────────────────────────────
export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const useResend = !!(process.env.RESEND_API_KEY)

  if (useResend) {
    return sendViaResend(payload)
  } else {
    return sendViaMock(payload)
  }
}