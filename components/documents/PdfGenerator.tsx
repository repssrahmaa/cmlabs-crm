"use client"

import { useCallback } from "react"

interface DocumentData {
  type:    string
  title:   string
  content: Record<string, any>
  lead: {
    clientName:     string
    clientEmail?:   string | null
    clientPhone?:   string | null
    clientCompany?: string | null
    assignedTo?:    { name: string } | null
  }
}

// ── CMLabs Brand Colors ────────────────────────────────────────
const C = {
  primary:    "#4B9EF3",
  primaryDark:"#1a6fd4",
  dark:       "#1a2332",
  darkMid:    "#2c3e55",
  gray:       "#64748b",
  grayLight:  "#94a3b8",
  grayBg:     "#f8fafc",
  border:     "#e2e8f0",
  white:      "#ffffff",
  text:       "#1e293b",
  textMid:    "#334155",
  green:      "#10b981",
  red:        "#ef4444",
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

// ── PDF Generation ─────────────────────────────────────────────
async function generatePDF(doc: DocumentData) {
  const { default: jsPDF } = await import("jspdf")
  const { default: autoTable } = await import("jspdf-autotable")

  const pdf    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const W      = 210
  const H      = 297
  const ml     = 20   // margin left
  const mr     = 20   // margin right
  const cw     = W - ml - mr  // content width

  // ── Helper functions ─────────────────────────────────────────
  const rgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  const setFill  = (hex: string) => pdf.setFillColor(...rgb(hex))
  const setDraw  = (hex: string) => pdf.setDrawColor(...rgb(hex))
  const setColor = (hex: string) => pdf.setTextColor(...rgb(hex))

  const setFont = (
    size:  number,
    style: "normal" | "bold" = "normal",
    font:  string = "helvetica"
  ) => {
    pdf.setFont(font, style)
    pdf.setFontSize(size)
  }

  // ── HEADER BLOCK ─────────────────────────────────────────────
  // Background header gradient (simulasi dengan dua rect)
  setFill(C.dark)
  pdf.rect(0, 0, W, 38, "F")

  setFill(C.primary)
  pdf.rect(0, 32, W, 6, "F")

  // Logo text
  setFont(20, "bold")
  setColor(C.white)
  pdf.text("CMLabs", ml, 18)

  // Tagline
  setFont(8, "normal")
  setColor(C.primaryDark.replace("#1a6fd4", "#93c5fd"))
  setColor("#93c5fd")
  pdf.text("Customer Relationship Management", ml, 24)

  // Doc type badge (kanan)
  const docTypeLabel = {
    INVOICE: "INVOICE",
    SPK:     "SURAT PERINTAH KERJA",
    MOU:     "MEMORANDUM OF UNDERSTANDING",
    OTHER:   "DOKUMEN",
  }[doc.type] ?? "DOKUMEN"

  setFont(9, "bold")
  setColor(C.white)
  pdf.text(docTypeLabel, W - mr, 16, { align: "right" })

  // Doc number
  if (doc.content.documentNumber) {
    setFont(7, "normal")
    setColor(C.primaryDark.replace("#1a6fd4", "#bfdbfe"))
    setColor("#bfdbfe")
    pdf.text(`No. ${doc.content.documentNumber}`, W - mr, 22, { align: "right" })
  }

  // Tanggal
  if (doc.content.date) {
    setFont(7, "normal")
    setColor("#bfdbfe")
    pdf.text(doc.content.date, W - mr, 28, { align: "right" })
  }

  let y = 48

  // ── DOCUMENT TITLE ────────────────────────────────────────────
  setFont(14, "bold")
  setColor(C.text)
  pdf.text(doc.title, W / 2, y, { align: "center" })
  y += 5

  // Garis bawah judul
  setDraw(C.primary)
  pdf.setLineWidth(0.5)
  const titleWidth = pdf.getTextWidth(doc.title)
  pdf.line(
    W / 2 - titleWidth / 2,
    y,
    W / 2 + titleWidth / 2,
    y
  )
  y += 10

  // ── CLIENT INFO BLOCK ─────────────────────────────────────────
  setFill(C.grayBg)
  setDraw(C.border)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(ml, y, cw, 32, 3, 3, "FD")

  // Label "Kepada"
  setFill(C.primary)
  pdf.roundedRect(ml, y, 22, 7, 2, 2, "F")
  setFont(7, "bold")
  setColor(C.white)
  pdf.text("KEPADA", ml + 11, y + 4.8, { align: "center" })

  y += 9

  // Grid info klien — 2 kolom
  const col1x = ml + 4
  const col2x = ml + cw / 2 + 4

  const clientRows: [string, string][] = [
    ["Nama",       doc.lead.clientName],
    ["Perusahaan", doc.lead.clientCompany ?? "-"],
  ]
  const clientRows2: [string, string][] = [
    ["Email",      doc.lead.clientEmail   ?? "-"],
    ["Telepon",    doc.lead.clientPhone   ?? "-"],
  ]

  const drawInfoRow = (x: number, label: string, value: string, rowY: number) => {
    setFont(7, "bold")
    setColor(C.gray)
    pdf.text(label, x, rowY)

    setFont(7, "normal")
    setColor(C.text)
    pdf.text(value.length > 30 ? value.substring(0, 28) + "…" : value, x + 22, rowY)
  }

  clientRows.forEach(([label, value], i) => {
    drawInfoRow(col1x, label, value, y + i * 7)
  })
  clientRows2.forEach(([label, value], i) => {
    drawInfoRow(col2x, label, value, y + i * 7)
  })

  y += 16

  // PIC row
  if (doc.lead.assignedTo) {
    setFont(7, "bold")
    setColor(C.gray)
    pdf.text("PIC", col1x, y)
    setFont(7, "normal")
    setColor(C.text)
    pdf.text(doc.lead.assignedTo.name, col1x + 22, y)
    y += 5
  } else {
    y += 2
  }

  y += 10

  // ── CONTENT SECTION ───────────────────────────────────────────
  if (doc.type === "INVOICE") {
    y = await buildInvoicePDF(pdf, doc.content, y, ml, mr, cw, W, autoTable, { rgb, setFill, setDraw, setColor, setFont, formatRupiah, C })
  } else if (doc.type === "SPK") {
    y = buildSPKPDF(pdf, doc.content, y, ml, mr, cw, W, { rgb, setFill, setDraw, setColor, setFont, formatRupiah, C })
  } else if (doc.type === "MOU") {
    y = buildMOUPDF(pdf, doc.content, y, ml, mr, cw, W, { rgb, setFill, setDraw, setColor, setFont, C })
  }

  // ── FOOTER ────────────────────────────────────────────────────
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)

    // Garis footer
    setDraw(C.primary)
    pdf.setLineWidth(0.5)
    pdf.line(ml, H - 16, W - mr, H - 16)

    setFont(7, "normal")
    setColor(C.grayLight)
    pdf.text(
      `Dokumen ini diterbitkan oleh CMLabs CRM System  •  ${doc.content.date ?? ""}`,
      W / 2, H - 11, { align: "center" }
    )
    pdf.text(
      `Halaman ${i} dari ${pageCount}`,
      W - mr, H - 11, { align: "right" }
    )

    // Primary accent bottom
    setFill(C.primary)
    pdf.rect(0, H - 5, W, 5, "F")
  }

  pdf.save(`${doc.type}_${doc.content.documentNumber ?? Date.now()}.pdf`)
}

// ── INVOICE Content ────────────────────────────────────────────
async function buildInvoicePDF(
  pdf:       any,
  content:   any,
  startY:    number,
  ml:        number,
  mr:        number,
  cw:        number,
  W:         number,
  autoTable: any,
  h:         any
): Promise<number> {
  let y = startY

  // Section title
  h.setFill(h.C.primary)
  pdf.rect(ml, y, 3, 7, "F")
  h.setFont(10, "bold")
  h.setColor(h.C.text)
  pdf.text("Rincian Tagihan", ml + 6, y + 5.5)
  y += 13

  // Items table
  autoTable(pdf, {
    startY: y,
    head:   [["No", "Deskripsi Layanan", "Qty", "Satuan", "Harga Satuan", "Total"]],
    body:   (content.items ?? []).map((item: any) => [
      item.no,
      item.description,
      item.qty,
      item.unit,
      h.formatRupiah(item.price),
      h.formatRupiah(item.total),
    ]),
    theme:       "plain",
    headStyles:  {
      fillColor:   h.rgb(h.C.dark),
      textColor:   h.rgb(h.C.white),
      fontStyle:   "bold",
      fontSize:    8,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize:    8,
      cellPadding: 4,
      textColor:   h.rgb(h.C.text),
    },
    alternateRowStyles: {
      fillColor: h.rgb("#f0f7ff"),
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      2: { halign: "center", cellWidth: 12 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "right",  cellWidth: 36 },
      5: { halign: "right",  cellWidth: 36 },
    },
    tableLineColor: h.rgb(h.C.border),
    tableLineWidth: 0.2,
    margin: { left: ml, right: mr },
  })

  y = pdf.lastAutoTable.finalY + 6

  // Summary box
  const bx = W - mr - 75
  const bw = 75
  const bh = 38

  h.setFill(h.C.grayBg)
  h.setDraw(h.C.border)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(bx, y, bw, bh, 2, 2, "FD")

  // Rows
  const sumRows: [string, string, boolean][] = [
    ["Subtotal",   h.formatRupiah(content.subtotal ?? 0), false],
    ["PPN (11%)",  h.formatRupiah(content.tax ?? 0),      false],
  ]

  let sy = y + 6
  sumRows.forEach(([label, value]) => {
    h.setFont(7, "normal")
    h.setColor(h.C.gray)
    pdf.text(label, bx + 4, sy)
    h.setFont(7, "bold")
    h.setColor(h.C.text)
    pdf.text(value, bx + bw - 4, sy, { align: "right" })
    sy += 7
  })

  // Divider
  h.setDraw(h.C.border)
  pdf.line(bx + 4, sy - 2, bx + bw - 4, sy - 2)

  // Grand total
  h.setFill(h.C.primary)
  pdf.roundedRect(bx, sy, bw, 10, 2, 2, "F")
  h.setFont(8, "bold")
  h.setColor(h.C.white)
  pdf.text("TOTAL", bx + 4, sy + 6.5)
  pdf.text(h.formatRupiah(content.grandTotal ?? 0), bx + bw - 4, sy + 6.5, { align: "right" })

  y += bh + 12

  // Payment info
  h.setFill(h.C.primary)
  pdf.rect(ml, y, 3, 7, "F")
  h.setFont(10, "bold")
  h.setColor(h.C.text)
  pdf.text("Informasi Pembayaran", ml + 6, y + 5.5)
  y += 12

  h.setFill("#f0f7ff")
  h.setDraw(h.C.primary)
  pdf.setLineWidth(0.3)
  pdf.roundedRect(ml, y, cw, 24, 2, 2, "FD")

  const payRows: [string, string][] = [
    ["Bank",        content.bankName    ?? "-"],
    ["No. Rekening", content.accountNo  ?? "-"],
    ["Atas Nama",   content.accountName ?? "-"],
  ]

  payRows.forEach(([label, value], i) => {
    h.setFont(7, "bold")
    h.setColor(h.C.gray)
    pdf.text(label, ml + 4, y + 6 + i * 6)
    h.setFont(7, "normal")
    h.setColor(h.C.text)
    pdf.text(value, ml + 38, y + 6 + i * 6)
  })

  y += 32

  // Notes
  if (content.notes) {
    h.setFont(7, "normal")
    h.setColor(h.C.grayLight)
    pdf.text(`* ${content.notes}`, ml, y)
    y += 6
  }

  return y
}

// ── SPK Content ────────────────────────────────────────────────
function buildSPKPDF(
  pdf:    any,
  content: any,
  startY:  number,
  ml:      number,
  mr:      number,
  cw:      number,
  W:       number,
  h:       any
): number {
  let y = startY

  // Pembukaan
  const openText = `Berdasarkan kesepakatan yang telah dicapai, dengan ini diterbitkan Surat Perintah Kerja dengan rincian sebagai berikut:`
  h.setFont(8.5, "normal")
  h.setColor(h.C.textMid ?? "#334155")
  const lines = pdf.splitTextToSize(openText, cw)
  pdf.text(lines, ml, y)
  y += lines.length * 5.5 + 8

  const sections = [
    {
      title: "Periode Pekerjaan",
      color: h.C.primary,
      rows:  [
        ["Tanggal Mulai",   content.startDate ?? "-"],
        ["Tanggal Selesai", content.endDate   ?? "-"],
      ],
    },
    {
      title: "Nilai & Pembayaran",
      color: h.C.primary,
      rows:  [
        ["Nilai Pekerjaan",    h.formatRupiah(content.value ?? 0)],
        ["Termin Pembayaran",  content.payment ?? "-"],
      ],
    },
  ]

  sections.forEach((section) => {
    if (y > 230) { pdf.addPage(); y = 20 }

    // Section header
    h.setFill(section.color)
    pdf.rect(ml, y, 3, 7, "F")
    h.setFont(10, "bold")
    h.setColor(h.C.text)
    pdf.text(section.title, ml + 6, y + 5.5)
    y += 11

    // Rows
    h.setFill(h.C.grayBg)
    h.setDraw(h.C.border)
    pdf.setLineWidth(0.2)
    pdf.roundedRect(ml, y, cw, section.rows.length * 9 + 4, 2, 2, "FD")

    section.rows.forEach(([label, value], i) => {
      h.setFont(7.5, "bold")
      h.setColor(h.C.gray)
      pdf.text(label, ml + 4, y + 8 + i * 9)
      h.setFont(7.5, "normal")
      h.setColor(h.C.text)
      pdf.text(value, ml + 50, y + 8 + i * 9)
    })

    y += section.rows.length * 9 + 10
  })

  // Scope
  if (y > 200) { pdf.addPage(); y = 20 }

  h.setFill(h.C.primary)
  pdf.rect(ml, y, 3, 7, "F")
  h.setFont(10, "bold")
  h.setColor(h.C.text)
  pdf.text("Ruang Lingkup Pekerjaan", ml + 6, y + 5.5)
  y += 12

  ;(content.scope ?? []).forEach((item: string, i: number) => {
    if (y > 250) { pdf.addPage(); y = 20 }

    h.setFill(h.C.primary)
    pdf.circle(ml + 2, y + 1.5, 1.5, "F")
    h.setFont(8, "normal")
    h.setColor(h.C.text)
    const scopeLines = pdf.splitTextToSize(`${item}`, cw - 8)
    pdf.text(scopeLines, ml + 7, y + 3)
    y += scopeLines.length * 5 + 4
  })

  y += 4

  // Sanksi
  if (y > 240) { pdf.addPage(); y = 20 }

  h.setFill("#fff7ed")
  h.setDraw("#fed7aa")
  pdf.setLineWidth(0.3)
  pdf.roundedRect(ml, y, cw, 14, 2, 2, "FD")

  h.setFill("#f97316")
  pdf.rect(ml, y, 3, 14, "F")

  h.setFont(7.5, "bold")
  h.setColor("#9a3412")
  pdf.text("Sanksi Keterlambatan", ml + 6, y + 5.5)
  h.setFont(7.5, "normal")
  h.setColor("#7c2d12")
  const penLines = pdf.splitTextToSize(content.penalty ?? "-", cw - 10)
  pdf.text(penLines, ml + 6, y + 10.5)

  y += 22

  // Notes
  if (content.notes) {
    h.setFont(7, "normal")
    h.setColor(h.C.grayLight)
    pdf.text(`* ${content.notes}`, ml, y)
    y += 6
  }

  y += 6

  // Tanda tangan
  y = addSignatures(pdf, y, ml, cw, W, h,
    { title: "Pihak Pertama",   name: "PT CMLabs Indonesia",           role: "Direktur Utama"   },
    { title: "Pihak Kedua",     name: content.clientName ?? "Klien",   role: "Pimpinan / Direktur" }
  )

  return y
}

// ── MOU Content ────────────────────────────────────────────────
function buildMOUPDF(
  pdf:    any,
  content: any,
  startY:  number,
  ml:      number,
  mr:      number,
  cw:      number,
  W:       number,
  h:       any
): number {
  let y = startY

  // Pembukaan
  const opening = `Memorandum of Understanding (MOU) ini dibuat dan ditandatangani pada tanggal ${content.date ?? "-"}, berlaku hingga tanggal ${content.validUntil ?? "-"}, oleh dan antara pihak-pihak yang disebutkan di bawah ini, dengan itikad baik dan untuk kepentingan bersama.`

  h.setFont(8.5, "normal")
  h.setColor(h.C.textMid ?? "#334155")
  const openLines = pdf.splitTextToSize(opening, cw)
  pdf.text(openLines, ml, y)
  y += openLines.length * 5.5 + 10

  // Para Pihak
  h.setFill(h.C.primary)
  pdf.rect(ml, y, 3, 7, "F")
  h.setFont(10, "bold")
  h.setColor(h.C.text)
  pdf.text("Para Pihak", ml + 6, y + 5.5)
  y += 12

  const parties = [
    { label: "PIHAK PERTAMA", data: content.party1, color: h.C.dark },
    { label: "PIHAK KEDUA",   data: content.party2, color: "#1a6fd4" },
  ]

  parties.forEach((party, pi) => {
    if (y > 230) { pdf.addPage(); y = 20 }

    h.setFill(party.color)
    h.setDraw(party.color)
    pdf.setLineWidth(0.2)
    pdf.roundedRect(ml, y, cw, 28, 2, 2, "FD")

    // Party label badge
    h.setFill(party.color)
    pdf.roundedRect(ml + 3, y + 3, 28, 6, 1, 1, "F")
    h.setFont(6.5, "bold")
    h.setColor(h.C.white)
    pdf.text(party.label, ml + 17, y + 7.2, { align: "center" })

    const partyData = party.data ?? {}
    const partyRows: [string, string][] = [
      ["Nama",      partyData.name    ?? "-"],
      ["Alamat",    partyData.address ?? "-"],
      ["Diwakili",  partyData.rep     ?? "-"],
    ]

    partyRows.forEach(([label, value], i) => {
      h.setFont(7, "bold")
      h.setColor(pi === 0 ? "#93c5fd" : "#bfdbfe")
      pdf.text(label, ml + 4, y + 14 + i * 5)
      h.setFont(7, "normal")
      h.setColor(h.C.white)
      const truncated = value.length > 50 ? value.substring(0, 48) + "…" : value
      pdf.text(truncated, ml + 26, y + 14 + i * 5)
    })

    y += 32
  })

  y += 4

  // Tujuan
  if (y > 200) { pdf.addPage(); y = 20 }

  h.setFill(h.C.primary)
  pdf.rect(ml, y, 3, 7, "F")
  h.setFont(10, "bold")
  h.setColor(h.C.text)
  pdf.text("Tujuan Kerjasama", ml + 6, y + 5.5)
  y += 12

  ;(content.purposePoints ?? []).forEach((point: string) => {
    if (y > 255) { pdf.addPage(); y = 20 }

    h.setFill(h.C.primary)
    pdf.circle(ml + 2, y + 1.5, 1.5, "F")
    h.setFont(8, "normal")
    h.setColor(h.C.text)
    const pLines = pdf.splitTextToSize(point, cw - 8)
    pdf.text(pLines, ml + 7, y + 3)
    y += pLines.length * 5 + 4
  })

  y += 4

  // Ketentuan
  if (y > 200) { pdf.addPage(); y = 20 }

  h.setFill(h.C.primary)
  pdf.rect(ml, y, 3, 7, "F")
  h.setFont(10, "bold")
  h.setColor(h.C.text)
  pdf.text("Ketentuan Umum", ml + 6, y + 5.5)
  y += 12

  ;(content.terms ?? []).forEach((term: string, i: number) => {
    if (y > 255) { pdf.addPage(); y = 20 }

    h.setFont(8, "bold")
    h.setColor(h.C.primary)
    pdf.text(`${i + 1}.`, ml + 2, y + 3)
    h.setFont(8, "normal")
    h.setColor(h.C.text)
    const tLines = pdf.splitTextToSize(term, cw - 10)
    pdf.text(tLines, ml + 8, y + 3)
    y += tLines.length * 5 + 5
  })

  y += 8

  // Tanda tangan
  if (y > 220) { pdf.addPage(); y = 20 }

  y = addSignatures(pdf, y, ml, cw, W, h,
    { title: "Pihak Pertama", name: content.party1?.name ?? "PT CMLabs Indonesia", role: content.party1?.rep ?? "Direktur Utama" },
    { title: "Pihak Kedua",   name: content.party2?.name ?? "Klien",               role: content.party2?.rep ?? "Pimpinan" }
  )

  return y
}

// ── Signature Section ──────────────────────────────────────────
function addSignatures(
  pdf:    any,
  startY: number,
  ml:     number,
  cw:     number,
  W:      number,
  h:      any,
  left:   { title: string; name: string; role: string },
  right:  { title: string; name: string; role: string }
): number {
  let y = startY

  // Divider
  h.setDraw(h.C.border)
  pdf.setLineWidth(0.3)
  pdf.line(ml, y, W - ml, y)
  y += 8

  h.setFont(9, "bold")
  h.setColor(h.C.text)
  pdf.text("Tanda Tangan Para Pihak", ml, y)
  y += 10

  const colW = cw / 2 - 6

  ;[
    { x: ml,           party: left  },
    { x: ml + colW + 12, party: right },
  ].forEach(({ x, party }) => {
    // Title badge
    h.setFill(h.C.dark)
    pdf.roundedRect(x, y, colW, 7, 1.5, 1.5, "F")
    h.setFont(7.5, "bold")
    h.setColor(h.C.white)
    pdf.text(party.title, x + colW / 2, y + 4.8, { align: "center" })

    // Signature box
    h.setFill(h.C.white)
    h.setDraw(h.C.border)
    pdf.setLineWidth(0.2)
    pdf.roundedRect(x, y + 8, colW, 28, 1.5, 1.5, "FD")

    // Signature line
    h.setDraw(h.C.primary)
    pdf.setLineWidth(0.5)
    pdf.line(x + 6, y + 30, x + colW - 6, y + 30)

    // Name & role
    h.setFont(7.5, "bold")
    h.setColor(h.C.text)
    pdf.text(party.name, x + colW / 2, y + 33, { align: "center" })
    h.setFont(6.5, "normal")
    h.setColor(h.C.gray)
    pdf.text(party.role, x + colW / 2, y + 38, { align: "center" })

    // Materai placeholder
    h.setFill("#f8fafc")
    h.setDraw(h.C.border)
    pdf.setLineWidth(0.2)
    pdf.roundedRect(x + colW / 2 - 8, y + 10, 16, 16, 1, 1, "FD")
    h.setFont(5.5, "normal")
    h.setColor(h.C.grayLight)
    pdf.text("MATERAI", x + colW / 2, y + 18, { align: "center" })
    pdf.text("& STEMPEL", x + colW / 2, y + 21, { align: "center" })
  })

  return y + 50
}

// ── Main Component ─────────────────────────────────────────────
interface Props {
  document: DocumentData
  onClose?: () => void
}

export default function PdfGenerator({ document }: Props) {
  const handleGenerate = useCallback(async () => {
    try {
      await generatePDF(document)
    } catch (err: any) {
      console.error("PDF generation error:", err)
      alert("Gagal generate PDF: " + err.message)
    }
  }, [document])

  return (
    <button
      onClick={handleGenerate}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          8,
        padding:      "9px 18px",
        background:   "linear-gradient(135deg, #4B9EF3, #1a6fd4)",
        color:        "#fff",
        border:       "none",
        borderRadius: 8,
        fontSize:     13,
        fontWeight:   600,
        cursor:       "pointer",
        boxShadow:    "0 2px 8px rgba(75,158,243,0.35)",
        transition:   "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow    = "0 4px 16px rgba(75,158,243,0.5)"
        e.currentTarget.style.transform    = "translateY(-1px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow    = "0 2px 8px rgba(75,158,243,0.35)"
        e.currentTarget.style.transform    = "translateY(0)"
      }}
    >
      <span style={{ fontSize: 16 }}>⬇</span>
      Download PDF
    </button>
  )
}