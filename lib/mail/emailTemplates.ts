// ── Email Templates ───────────────────────────────────

interface TemplateData {
  clientName:    string
  senderName:    string
  companyName?:  string
  subject:       string
  body:          string
  leadTitle?:    string
}

export function buildHtmlEmail(data: TemplateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8fafc; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #1e293b; padding: 24px 32px; }
    .header h1 { color: #f8fafc; font-size: 18px; margin: 0; }
    .header p  { color: #94a3b8; font-size: 13px; margin: 4px 0 0; }
    .body { padding: 32px; color: #374151; line-height: 1.7; font-size: 14px; }
    .lead-badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #2563eb; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.companyName ?? "CMLabs"}</h1>
      <p>Customer Relationship Management</p>
    </div>
    <div class="body">
      ${data.leadTitle ? `<div class="lead-badge">Re: ${data.leadTitle}</div>` : ""}
      <p>Yth. ${data.clientName},</p>
      <div>${data.body.replace(/\n/g, "<br>")}</div>
      <p style="margin-top: 24px;">
        Hormat kami,<br>
        <strong>${data.senderName}</strong><br>
        <span style="color: #94a3b8;">${data.companyName ?? "CMLabs"}</span>
      </p>
    </div>
    <div class="footer">
      Pesan ini dikirim melalui CMLabs CRM System.
    </div>
  </div>
</body>
</html>
  `.trim()
}