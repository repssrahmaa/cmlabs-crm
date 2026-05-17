// lib/services/documentGenerator.ts
// Generate dokumen Word (.docx) yang bisa diedit

export interface DocData {
  type:    "INVOICE" | "SPK" | "MOU" | "OTHER"
  title:   string
  number:  string
  date:    string
  lead: {
    clientName:     string
    clientEmail?:   string | null
    clientPhone?:   string | null
    clientCompany?: string | null
    clientPosition?: string | null
    value?:         number | null
    assignedTo?:    { name: string; email?: string } | null
  }
  content: Record<string, any>
}

function formatRp(v: number): string {
  return `Rp ${v.toLocaleString("id-ID")}`
}

export async function generateDocxDocument(doc: DocData): Promise<void> {
  // Dynamic import untuk avoid SSR issues
  const { Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, AlignmentType, BorderStyle,
    WidthType, ShadingType } = await import("docx")

  const BRAND_COLOR = "1a6fd4"
  const DARK_COLOR  = "1a2332"
  const GRAY_COLOR  = "64748b"

  // ── Helper functions ─────────────────────────────────────────
  const heading = (text: string, level = 1) => new Paragraph({
    text,
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
  })

  const para = (text: string, opts?: { bold?: boolean; color?: string; size?: number; center?: boolean }) => new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing:   { after: 80 },
    children:  [new TextRun({
      text,
      bold:   opts?.bold,
      color:  opts?.color ?? DARK_COLOR,
      size:   (opts?.size ?? 11) * 2,
      font:   "Calibri",
    })],
  })

  const divider = () => new Paragraph({
    border: { bottom: { color: BRAND_COLOR, size: 4, style: BorderStyle.SINGLE } },
    spacing: { before: 120, after: 120 },
    children: [],
  })

  const labelValue = (label: string, value: string) => new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: "Calibri", color: GRAY_COLOR }),
      new TextRun({ text: value, size: 22, font: "Calibri", color: DARK_COLOR }),
    ],
  })

  const spacer = (lines = 1) => new Paragraph({ spacing: { after: 200 * lines }, children: [] })

  // ── Build sections based on type ─────────────────────────────
  let sections: any[] = []

  // ── HEADER ────────────────────────────────────────────────────
  const header = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({
        text: "CMLABS",
        bold: true, size: 52,
        color: BRAND_COLOR, font: "Calibri",
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({
        text: "Customer Relationship Management System",
        size: 20, color: GRAY_COLOR, font: "Calibri",
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { color: BRAND_COLOR, size: 8, style: BorderStyle.SINGLE } },
      spacing: { after: 300 },
      children: [new TextRun({
        text: doc.title.toUpperCase(),
        bold: true, size: 32,
        color: DARK_COLOR, font: "Calibri",
      })],
    }),
  ]

  // ── META INFO ─────────────────────────────────────────────────
  const meta = [
    spacer(),
    labelValue("Nomor Dokumen", doc.number),
    labelValue("Tanggal",       doc.date),
    labelValue("Klien",         `${doc.lead.clientName}${doc.lead.clientCompany ? ` — ${doc.lead.clientCompany}` : ""}`),
    ...(doc.lead.clientEmail    ? [labelValue("Email Klien",   doc.lead.clientEmail)]    : []),
    ...(doc.lead.clientPhone    ? [labelValue("Telepon Klien", doc.lead.clientPhone)]    : []),
    ...(doc.lead.clientPosition ? [labelValue("Jabatan",       doc.lead.clientPosition)] : []),
    ...(doc.lead.assignedTo     ? [labelValue("PIC CMLabs",    doc.lead.assignedTo.name)] : []),
    divider(),
  ]

  // ── CONTENT by type ───────────────────────────────────────────
  let content: any[] = []

  if (doc.type === "INVOICE") {
    const items = doc.content.items ?? []
    content = [
      heading("Rincian Tagihan", 2),

      // Tabel item
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Header row
          new TableRow({
            children: ["No", "Deskripsi Layanan", "Qty", "Satuan", "Harga", "Total"].map((h) =>
              new TableCell({
                shading: { fill: BRAND_COLOR, type: ShadingType.CLEAR, color: "auto" },
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })],
                })],
              })
            ),
          }),
          // Data rows
          ...items.map((item: any, i: number) =>
            new TableRow({
              children: [
                String(item.no ?? i + 1),
                item.description ?? "-",
                String(item.qty ?? 1),
                item.unit ?? "Paket",
                formatRp(item.price ?? 0),
                formatRp(item.total ?? 0),
              ].map((text) => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Calibri" })] })],
              })),
            })
          ),
        ],
      }),

      spacer(),

      // Summary
      ...([
        ["Subtotal",   formatRp(doc.content.subtotal ?? 0)],
        ["PPN (11%)",  formatRp(doc.content.tax ?? 0)],
        ["Total",      formatRp(doc.content.grandTotal ?? 0)],
      ].map(([l, v]) => new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `${l}: `, bold: l === "Total", size: 22, font: "Calibri", color: GRAY_COLOR }),
          new TextRun({ text: v, bold: l === "Total", size: l === "Total" ? 26 : 22, font: "Calibri", color: l === "Total" ? BRAND_COLOR : DARK_COLOR }),
        ],
      }))),

      spacer(),
      heading("Informasi Pembayaran", 2),
      labelValue("Bank",       doc.content.bankName    ?? "Bank BCA"),
      labelValue("Rekening",   doc.content.accountNo   ?? "-"),
      labelValue("Atas Nama",  doc.content.accountName ?? "PT CMLabs Indonesia"),

      ...(doc.content.notes ? [spacer(), para(`*${doc.content.notes}`, { color: GRAY_COLOR, size: 10 })] : []),
    ]
  }

  if (doc.type === "SPK") {
    content = [
      heading("Ruang Lingkup Pekerjaan", 2),
      para(
        `Berdasarkan kesepakatan bersama, pekerjaan yang akan dilaksanakan mencakup hal-hal berikut ini:`
      ),
      ...(doc.content.scope ?? []).map((item: string) => new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 80 },
        children: [new TextRun({ text: item, size: 22, font: "Calibri", color: DARK_COLOR })],
      })),

      spacer(),
      heading("Nilai dan Pembayaran", 2),
      labelValue("Nilai Pekerjaan",   formatRp(doc.content.value ?? 0)),
      labelValue("Termin Pembayaran", doc.content.payment ?? "-"),
      labelValue("Tanggal Mulai",     doc.content.startDate ?? "-"),
      labelValue("Tanggal Selesai",   doc.content.endDate   ?? "-"),

      spacer(),
      heading("Sanksi dan Ketentuan", 2),
      para(doc.content.penalty ?? "-"),

      ...(doc.content.notes ? [spacer(), para(doc.content.notes, { color: GRAY_COLOR })] : []),
    ]
  }

  if (doc.type === "MOU") {
    content = [
      heading("Para Pihak", 2),
      labelValue("Pihak Pertama", `${doc.content.party1?.name ?? "PT CMLabs Indonesia"} — ${doc.content.party1?.rep ?? "Direktur Utama"}`),
      labelValue("Pihak Kedua",   `${doc.content.party2?.name ?? doc.lead.clientCompany ?? doc.lead.clientName} — ${doc.content.party2?.rep ?? doc.lead.clientName}`),

      spacer(),
      heading("Tujuan Kerjasama", 2),
      ...(doc.content.purposePoints ?? []).map((p: string) => new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 80 },
        children: [new TextRun({ text: p, size: 22, font: "Calibri", color: DARK_COLOR })],
      })),

      spacer(),
      heading("Ketentuan Umum", 2),
      ...(doc.content.terms ?? []).map((t: string, i: number) => new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true, size: 22, font: "Calibri", color: BRAND_COLOR }),
          new TextRun({ text: t, size: 22, font: "Calibri", color: DARK_COLOR }),
        ],
      })),

      labelValue("Berlaku Hingga", doc.content.validUntil ?? "-"),
    ]
  }

  // ── SIGNATURE ─────────────────────────────────────────────────
  const signature = [
    spacer(2),
    divider(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Tanda Tangan Para Pihak", bold: true, size: 24, color: DARK_COLOR, font: "Calibri" })],
    }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ["Pihak Pertama — PT CMLabs Indonesia", `Pihak Kedua — ${doc.lead.clientCompany ?? doc.lead.clientName}`].map((label) =>
            new TableCell({
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, bold: true, size: 20, color: DARK_COLOR, font: "Calibri" })] }),
                ...Array(5).fill(null).map(() => new Paragraph({ children: [new TextRun({ text: " " })] })),
                new Paragraph({
                  border: { top: { color: BRAND_COLOR, size: 4, style: BorderStyle.SINGLE } },
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Materai & Tanda Tangan", size: 18, color: GRAY_COLOR, font: "Calibri" })],
                }),
              ],
            })
          ),
        }),
      ],
    }),
  ]

  // ── Assemble document ─────────────────────────────────────────
  const docxDoc = new Document({
    sections: [{
      properties: {},
      children: [...header, ...meta, ...content, ...signature],
    }],
  })

  const blob = await Packer.toBlob(docxDoc)
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement("a"), {
    href:     url,
    download: `${doc.type}_${doc.number.replace(/\//g, "-")}.docx`,
  })
  a.click()
  URL.revokeObjectURL(url)
}

export function generateDocumentNumber(type: string): string {
  const now = new Date()

  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = now.getFullYear()

  const random = Math.floor(Math.random() * 1000)

  return `${type}/${month}/${year}/${random}`
}

export function buildDefaultContent(
  type: string,
  leadData?: any,
  number?: string
) {
  return {
    documentNumber:
      number ?? generateDocumentNumber(type),

    date: new Date().toLocaleDateString("id-ID"),

    title: leadData?.title ?? "",

    clientName: leadData?.clientName ?? "",

    clientEmail: leadData?.clientEmail ?? "",

    clientCompany: leadData?.clientCompany ?? "",

    value: leadData?.value ?? 0,

    assignedTo: leadData?.assignedTo ?? null,

    notes: "",
  }
}