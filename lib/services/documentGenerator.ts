// lib/services/documentGenerator.ts
// Template profesional: INVOICE · SPK · MOU · OTHER
// Download sebagai .docx — semua kolom terintegrasi dengan data lead

export interface DocData {
  type:    "INVOICE" | "SPK" | "MOU" | "OTHER"
  title:   string
  number:  string
  date:    string   // ISO "2025-06-10" atau string tanggal
  lead: {
    clientName:      string
    clientEmail?:    string | null
    clientPhone?:    string | null
    clientCompany?:  string | null
    clientPosition?: string | null
    clientAddress?:  string | null
    value?:          number | null
    assignedTo?:     { name: string; email?: string } | null
  }
  content: Record<string, any>
}

// ── Number formatter — Indonesian ────────────────────────────────────────────
function rp(v: number | null | undefined): string {
  return `Rp ${Number(v ?? 0).toLocaleString("id-ID")}`
}

// ── Date formatter — "10 Juni 2025" ─────────────────────────────────────────
function tglFull(iso?: string | null): string {
  if (!iso) return "_______________"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export async function generateDocxDocument(doc: DocData): Promise<void> {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, Footer, PageNumber, UnderlineType,
    TabStopType, TabStopPosition, LevelFormat,
  } = await import("docx")

  // ── Design tokens ──────────────────────────────────────────────────────────
  const C_BLUE   = "1B4F8E"
  const C_BLUE_L = "EBF3FB"
  const C_DARK   = "1A2332"
  const C_GRAY   = "64748B"
  const C_GRAY_L = "F1F5F9"
  const C_WHITE  = "FFFFFF"
  const C_LINE   = "CBD5E1"

  // A4 with 2cm margins (DXA)
  const PAGE_W  = 11906
  const PAGE_H  = 16838
  const MARGIN  = 1134
  const CONTENT = PAGE_W - MARGIN * 2   // 9638

  // ── Primitive helpers ──────────────────────────────────────────────────────
  const sp = (after = 0, before = 0) => ({ before, after })

  const mkRun = (text: string, o: {
    pt?: number; bold?: boolean; italic?: boolean
    color?: string; ul?: boolean
  } = {}) => new TextRun({
    text, font: "Calibri",
    size:    (o.pt ?? 10) * 2,
    bold:    o.bold   ?? false,
    italics: o.italic ?? false,
    color:   o.color  ?? C_DARK,
    underline: o.ul ? { type: UnderlineType.SINGLE } : undefined,
  })

  const gap = (after = 120) => new Paragraph({ spacing: sp(after), children: [] })

  const rule = (color = C_BLUE, size = 8) => new Paragraph({
    border:  { bottom: { style: BorderStyle.SINGLE, size, color } },
    spacing: sp(120, 40),
    children: [],
  })

  // ── Border helpers ─────────────────────────────────────────────────────────
  const bdr     = (c = C_LINE, sz = 4) => ({ style: BorderStyle.SINGLE, size: sz, color: c })
  const noBdr   = ()                   => ({ style: BorderStyle.NONE,   size: 0,  color: "auto" as const })
  const allBdr  = (c = C_LINE, sz = 4) => ({ top: bdr(c,sz), bottom: bdr(c,sz), left: bdr(c,sz), right: bdr(c,sz) })
  const noAllBdr= ()                   => ({ top: noBdr(), bottom: noBdr(), left: noBdr(), right: noBdr() })

  // ── Cell builder ───────────────────────────────────────────────────────────
  function mkCell(children: any[], o: {
    nb?: boolean; bc?: string; bsz?: number; fill?: string
    w?: number; va?: any; span?: number
  } = {}): any {
    return new TableCell({
      borders:       o.nb ? noAllBdr() : allBdr(o.bc ?? C_LINE, o.bsz ?? 4),
      width:         o.w ? { size: o.w, type: WidthType.DXA } : undefined,
      shading:       o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
      verticalAlign: o.va ?? VerticalAlign.CENTER,
      margins:       { top: 80, bottom: 80, left: 140, right: 140 },
      columnSpan:    o.span,
      children,
    })
  }

  function tc(text: string, o: {
    pt?: number; bold?: boolean; italic?: boolean; color?: string
    align?: any; nb?: boolean; bc?: string; bsz?: number; fill?: string; w?: number; span?: number
  } = {}): any {
    return mkCell([new Paragraph({
      alignment: o.align ?? AlignmentType.LEFT,
      spacing:   sp(0),
      children:  [mkRun(text, o)],
    })], o)
  }

  // ── KV table ───────────────────────────────────────────────────────────────
  const LW = Math.round(CONTENT * 0.28)
  const VW = CONTENT - LW

  function kvRow(label: string, value: string, vc = C_DARK): any {
    return new TableRow({ children: [
      mkCell([new Paragraph({ spacing: sp(0), children: [mkRun(label, { pt: 9, bold: true, color: C_GRAY })] })],
        { w: LW, fill: C_GRAY_L }),
      mkCell([new Paragraph({ spacing: sp(0), children: [mkRun(value || "—", { pt: 9.5, color: vc })] })],
        { w: VW }),
    ]})
  }

  function kvTable(rows: any[]): any {
    return new Table({
      width:        { size: CONTENT, type: WidthType.DXA },
      columnWidths: [LW, VW],
      rows,
    })
  }

  // ── Signature table ────────────────────────────────────────────────────────
  function sigTable(
    left:  { title: string; org: string; name: string; role: string },
    right: { title: string; org: string; name: string; role: string },
  ): any {
    const cw = Math.round(CONTENT * 0.44)
    const gw = CONTENT - cw * 2

    const sigCol = (s: typeof left, w: number) => mkCell([
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(40), children: [mkRun(s.title, { pt: 9, bold: true, color: C_BLUE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun(s.org,   { pt: 8.5, color: C_GRAY })] }),
      gap(80), gap(80), gap(80), gap(80),
      new Paragraph({
        border:    { top: { style: BorderStyle.SINGLE, size: 4, color: C_LINE } },
        alignment: AlignmentType.CENTER,
        spacing:   sp(20),
        children:  [mkRun(s.name, { pt: 9, bold: true })],
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(0), children: [mkRun(s.role, { pt: 8.5, color: C_GRAY })] }),
    ], { nb: true, w })

    return new Table({
      width:        { size: CONTENT, type: WidthType.DXA },
      columnWidths: [cw, gw, cw],
      rows: [new TableRow({ children: [
        sigCol(left, cw),
        mkCell([], { nb: true, w: gw }),
        sigCol(right, cw),
      ]})],
    })
  }

  // ── Section heading (SPK) ──────────────────────────────────────────────────
  const secHead = (letter: string, title: string) => [
    new Paragraph({ spacing: sp(80), children: [
      mkRun(`${letter}.  `, { pt: 11, bold: true, color: C_GRAY }),
      mkRun(title,           { pt: 11, bold: true, color: C_BLUE }),
    ]}),
    new Paragraph({
      border:  { bottom: { style: BorderStyle.SINGLE, size: 4, color: C_BLUE_L } },
      spacing: sp(100, 0), children: [],
    }),
  ]

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageFooter = new Footer({ children: [
    new Paragraph({
      border:   { top: { style: BorderStyle.SINGLE, size: 4, color: C_LINE } },
      spacing:  sp(0, 80),
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        mkRun("PT CMLabs Indonesia Digital  |  cmlabs.co  |  hello@cmlabs.co", { pt: 8, color: C_GRAY }),
        mkRun("\t", { pt: 8 }),
        mkRun("Hal. ", { pt: 8, color: C_GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: C_GRAY }),
      ],
    }),
  ]})

  // ══════════════════════════════════════════════════════════════════════════
  // INVOICE
  // ══════════════════════════════════════════════════════════════════════════
  function buildInvoice(c: Record<string, any>): any[] {
    const { lead } = doc
    const items: any[] = c.items?.length ? c.items : [
      { description: "Jasa / Layanan", qty: 1, unit: "Paket", price: lead.value ?? 0, total: lead.value ?? 0 },
    ]
    const subtotal   = items.reduce((s, i) => s + Number(i.total ?? 0), 0)
    const tax        = Math.round(subtotal * 0.11)
    const grandTotal = subtotal + tax

    // Column widths — must sum to CONTENT (9638)
    const CW = [480, 3980, 680, 900, 1600, 1998]

    return [
      // ── Letterhead ────────────────────────────────────────────
      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: [Math.round(CONTENT * 0.55), Math.round(CONTENT * 0.45)],
        rows: [new TableRow({ children: [
          mkCell([
            new Paragraph({ spacing: sp(40), children: [mkRun("CMLABS", { pt: 22, bold: true, color: C_BLUE })] }),
            new Paragraph({ spacing: sp(20), children: [mkRun("Jl. Raya Sulfat No.7, Malang, Jawa Timur 65112", { pt: 8.5, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(20), children: [mkRun("hello@cmlabs.co  |  cmlabs.co", { pt: 8.5, color: C_GRAY })] }),
          ], { nb: true, w: Math.round(CONTENT * 0.55) }),
          mkCell([
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(40), children: [mkRun("INVOICE", { pt: 26, bold: true, color: C_BLUE })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun(`No: ${doc.number}`, { pt: 9, color: C_GRAY })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun(`Tanggal: ${tglFull(doc.date)}`, { pt: 9, color: C_GRAY })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(0),  children: [mkRun(`Jatuh Tempo: ${tglFull(c.dueDate)}`, { pt: 9, color: C_GRAY })] }),
          ], { nb: true, w: Math.round(CONTENT * 0.45) }),
        ]})]
      }),
      rule(),

      // ── Bill-to + Status ──────────────────────────────────────
      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: [Math.round(CONTENT * 0.55), Math.round(CONTENT * 0.45)],
        rows: [new TableRow({ children: [
          mkCell([
            new Paragraph({ spacing: sp(60), children: [mkRun("DITAGIHKAN KEPADA:", { pt: 8, bold: true, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(40), children: [mkRun(lead.clientName ?? "—", { pt: 11, bold: true })] }),
            ...(lead.clientCompany  ? [new Paragraph({ spacing: sp(20), children: [mkRun(lead.clientCompany,  { pt: 9 })] })] : []),
            ...(lead.clientPosition ? [new Paragraph({ spacing: sp(20), children: [mkRun(lead.clientPosition, { pt: 9, color: C_GRAY })] })] : []),
            ...(lead.clientEmail    ? [new Paragraph({ spacing: sp(20), children: [mkRun(lead.clientEmail,    { pt: 9, color: C_GRAY })] })] : []),
            ...(lead.clientPhone    ? [new Paragraph({ spacing: sp(20), children: [mkRun(lead.clientPhone,    { pt: 9, color: C_GRAY })] })] : []),
            ...(lead.clientAddress  ? [new Paragraph({ spacing: sp(20), children: [mkRun(lead.clientAddress,  { pt: 9, color: C_GRAY })] })] : []),
          ], { nb: true, w: Math.round(CONTENT * 0.55) }),
          mkCell([
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(60), children: [mkRun("STATUS PEMBAYARAN", { pt: 8, bold: true, color: C_GRAY })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(40), children: [
              new TextRun({ text: "  BELUM DIBAYAR  ", font: "Calibri", size: 18, bold: true, color: C_WHITE,
                shading: { fill: C_BLUE, type: ShadingType.CLEAR, color: "auto" } }),
            ]}),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun(`PIC: ${lead.assignedTo?.name ?? "—"}`, { pt: 8.5, color: C_GRAY })] }),
          ], { nb: true, w: Math.round(CONTENT * 0.45) }),
        ]})]
      }),
      gap(160),

      // ── Items table ───────────────────────────────────────────
      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: CW,
        rows: [
          new TableRow({ children: [
            tc("No",               { pt: 9, bold: true, color: C_WHITE, fill: C_BLUE, align: AlignmentType.CENTER, bc: C_BLUE, w: CW[0] }),
            tc("Deskripsi Layanan",{ pt: 9, bold: true, color: C_WHITE, fill: C_BLUE, bc: C_BLUE, w: CW[1] }),
            tc("Qty",              { pt: 9, bold: true, color: C_WHITE, fill: C_BLUE, align: AlignmentType.CENTER, bc: C_BLUE, w: CW[2] }),
            tc("Satuan",           { pt: 9, bold: true, color: C_WHITE, fill: C_BLUE, align: AlignmentType.CENTER, bc: C_BLUE, w: CW[3] }),
            tc("Harga Satuan",     { pt: 9, bold: true, color: C_WHITE, fill: C_BLUE, align: AlignmentType.RIGHT,  bc: C_BLUE, w: CW[4] }),
            tc("Total",            { pt: 9, bold: true, color: C_WHITE, fill: C_BLUE, align: AlignmentType.RIGHT,  bc: C_BLUE, w: CW[5] }),
          ]}),
          ...items.map((item: any, i: number) => {
            const bg = i % 2 === 0 ? C_WHITE : C_GRAY_L
            return new TableRow({ children: [
              tc(String(i + 1),             { pt: 9, align: AlignmentType.CENTER, fill: bg, w: CW[0] }),
              tc(item.description ?? "—",   { pt: 9, fill: bg, w: CW[1] }),
              tc(String(item.qty ?? 1),     { pt: 9, align: AlignmentType.CENTER, fill: bg, w: CW[2] }),
              tc(item.unit ?? "Paket",      { pt: 9, align: AlignmentType.CENTER, fill: bg, w: CW[3] }),
              tc(rp(item.price),            { pt: 9, align: AlignmentType.RIGHT,  fill: bg, w: CW[4] }),
              tc(rp(item.total),            { pt: 9, align: AlignmentType.RIGHT,  fill: bg, w: CW[5] }),
            ]})
          }),
        ],
      }),
      gap(80),

      // ── Totals ────────────────────────────────────────────────
      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: [Math.round(CONTENT * 0.6), Math.round(CONTENT * 0.22), Math.round(CONTENT * 0.18)],
        rows: [
          new TableRow({ children: [
            mkCell([], { nb: true, w: Math.round(CONTENT * 0.6) }),
            tc("Subtotal",     { pt: 9, color: C_GRAY, nb: true, w: Math.round(CONTENT * 0.22) }),
            tc(rp(subtotal),   { pt: 9, align: AlignmentType.RIGHT, nb: true, w: Math.round(CONTENT * 0.18) }),
          ]}),
          new TableRow({ children: [
            mkCell([], { nb: true }),
            tc("PPN (11%)",    { pt: 9, color: C_GRAY, nb: true }),
            tc(rp(tax),        { pt: 9, align: AlignmentType.RIGHT, nb: true }),
          ]}),
          new TableRow({ children: [
            mkCell([], { nb: true }),
            tc("TOTAL",        { pt: 10, bold: true, fill: C_BLUE, color: C_WHITE, bc: C_BLUE }),
            tc(rp(grandTotal), { pt: 10, bold: true, align: AlignmentType.RIGHT, fill: C_BLUE, color: C_WHITE, bc: C_BLUE }),
          ]}),
        ],
      }),
      gap(200),

      // ── Payment info ──────────────────────────────────────────
      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: [CONTENT],
        rows: [new TableRow({ children: [
          mkCell([
            new Paragraph({ spacing: sp(60), children: [mkRun("INFORMASI PEMBAYARAN", { pt: 9, bold: true, color: C_BLUE })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun("Bank: ",         { pt: 9, bold: true }), mkRun(c.bankName    ?? "Bank BCA",                   { pt: 9 })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun("No. Rekening: ", { pt: 9, bold: true }), mkRun(c.accountNo   ?? "_______________",             { pt: 9 })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun("Atas Nama: ",    { pt: 9, bold: true }), mkRun(c.accountName ?? "PT CMLabs Indonesia Digital", { pt: 9 })] }),
            ...(c.notes ? [new Paragraph({ spacing: sp(0), children: [mkRun(c.notes, { pt: 9, italic: true, color: C_GRAY })] })] : []),
          ], { fill: C_BLUE_L, bc: C_BLUE, bsz: 6 }),
        ]})]
      }),
      gap(260),

      sigTable(
        { title: "Diterima oleh,",    org: doc.lead.clientCompany ?? doc.lead.clientName ?? "Klien", name: doc.lead.clientName ?? "_______________",      role: doc.lead.clientPosition ?? "Perwakilan Klien" },
        { title: "Dikeluarkan oleh,", org: "PT CMLabs Indonesia Digital",                             name: doc.lead.assignedTo?.name ?? "_______________", role: "Account Executive" },
      ),
    ]
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SPK
  // ══════════════════════════════════════════════════════════════════════════
  function buildSPK(c: Record<string, any>): any[] {
    const { lead } = doc
    const scope: string[] = c.scope?.length ? c.scope : ["Uraian pekerjaan 1", "Uraian pekerjaan 2"]
    const terms: string[] = [
      "Pekerjaan harus diselesaikan sesuai spesifikasi teknis yang telah disetujui bersama.",
      "Keterlambatan penyelesaian dikenakan denda sebesar 0,1% per hari dari total nilai pekerjaan.",
      "Seluruh hasil pekerjaan menjadi milik Pemberi Kerja setelah pelunasan pembayaran penuh.",
      c.penalty || "Perubahan lingkup pekerjaan wajib mendapat persetujuan tertulis kedua pihak.",
    ]

    return [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("PT CMLABS INDONESIA DIGITAL", { pt: 14, bold: true, color: C_BLUE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("Jl. Raya Sulfat No.7, Malang 65112, Jawa Timur, Indonesia", { pt: 9, color: C_GRAY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("Telp: (0341) 000-0000  |  hello@cmlabs.co  |  cmlabs.co", { pt: 9, color: C_GRAY })] }),
      new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: C_BLUE } }, spacing: sp(200, 60), children: [] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(60),  children: [mkRun("SURAT PERINTAH KERJA", { pt: 16, bold: true, color: C_DARK, ul: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(200), children: [mkRun(`Nomor: ${doc.number}`, { pt: 10, color: C_GRAY })] }),

      kvTable([
        kvRow("Tanggal SPK",     tglFull(doc.date)),
        kvRow("Nomor Referensi", doc.number),
        kvRow("Pemberi Kerja",   "PT CMLabs Indonesia Digital"),
        kvRow("PIC Pemberi",     lead.assignedTo?.name    ?? "—"),
        kvRow("Penerima Kerja",  lead.clientName          ?? "—"),
        kvRow("Perusahaan",      lead.clientCompany       ?? "—"),
        kvRow("Jabatan",         lead.clientPosition      ?? "—"),
        kvRow("Email",           lead.clientEmail         ?? "—"),
        kvRow("Telepon",         lead.clientPhone         ?? "—"),
      ]),
      gap(200),

      ...secHead("A", "RUANG LINGKUP PEKERJAAN"),
      ...scope.map((item) => new Paragraph({
        numbering: { reference: "spkScope", level: 0 },
        spacing:   sp(80),
        children:  [mkRun(item, { pt: 9.5 })],
      })),
      gap(160),

      ...secHead("B", "NILAI DAN JADWAL PEKERJAAN"),
      kvTable([
        kvRow("Nilai Pekerjaan",   rp(c.value ?? lead.value)),
        kvRow("Termin Pembayaran", c.payment   ?? "50% DP, 50% setelah selesai"),
        kvRow("Tanggal Mulai",     tglFull(c.startDate)),
        kvRow("Tanggal Selesai",   tglFull(c.endDate)),
        kvRow("Durasi Pekerjaan",  c.duration  ?? "—"),
      ]),
      gap(160),

      ...secHead("C", "KETENTUAN DAN SANKSI"),
      ...terms.map((t) => new Paragraph({
        numbering: { reference: "spkTerms", level: 0 },
        spacing:   sp(80),
        children:  [mkRun(t, { pt: 9.5 })],
      })),

      ...(c.notes ? [gap(80), new Paragraph({ spacing: sp(0), children: [mkRun(`Catatan: ${c.notes}`, { pt: 9, italic: true, color: C_GRAY })] })] : []),
      gap(260),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(180), children: [mkRun("Demikian surat perintah kerja ini dibuat dan ditandatangani oleh kedua belah pihak.", { pt: 9, italic: true, color: C_GRAY })] }),

      sigTable(
        { title: "PEMBERI KERJA",  org: "PT CMLabs Indonesia Digital",               name: lead.assignedTo?.name ?? "_______________", role: "Account Executive" },
        { title: "PENERIMA KERJA", org: lead.clientCompany ?? lead.clientName ?? "—", name: lead.clientName       ?? "_______________", role: lead.clientPosition ?? "Pimpinan" },
      ),
    ]
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOU
  // ══════════════════════════════════════════════════════════════════════════
  function buildMOU(c: Record<string, any>): any[] {
    const { lead } = doc
    const clientOrg = lead.clientCompany ?? lead.clientName ?? "Pihak Kedua"

    const purposes: string[] = c.purposePoints?.length ? c.purposePoints : [
      "Menjalin kerjasama strategis di bidang pengembangan digital dan teknologi informasi",
      "Memberikan solusi teknologi yang inovatif dan berkelanjutan bagi Pihak Kedua",
      "Mendukung transformasi digital Pihak Kedua secara menyeluruh",
    ]
    const scopePoints: string[] = c.scopePoints?.length ? c.scopePoints : purposes
    const terms: string[] = c.terms?.length ? c.terms : [
      "Kerjasama bersifat eksklusif dan saling menguntungkan bagi kedua belah pihak.",
      "Seluruh informasi yang diperoleh bersifat rahasia dan tidak boleh disebarluaskan kepada pihak ketiga.",
      "Biaya dan mekanisme pembayaran akan diatur lebih lanjut dalam perjanjian kerja terpisah.",
      "Perselisihan diselesaikan secara musyawarah; jika tidak tercapai, melalui jalur hukum berlaku.",
      "MOU ini dapat diperpanjang atas persetujuan tertulis kedua belah pihak.",
    ]

    const pasal = (num: number, title: string, items: string[], ref: string) => [
      new Paragraph({ spacing: sp(60),  children: [mkRun(`PASAL ${num}`, { pt: 9.5, bold: true, color: C_GRAY })] }),
      new Paragraph({ spacing: sp(100), children: [mkRun(title,           { pt: 12,  bold: true, color: C_BLUE })] }),
      ...items.map((item) => new Paragraph({
        numbering: { reference: ref, level: 0 },
        spacing:   sp(80),
        children:  [mkRun(item, { pt: 10 })],
      })),
      gap(160),
    ]

    return [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("MEMORANDUM OF UNDERSTANDING (MOU)", { pt: 16, bold: true, color: C_DARK })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("ANTARA", { pt: 11, color: C_GRAY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("PT CMLABS INDONESIA DIGITAL", { pt: 13, bold: true, color: C_BLUE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun("DENGAN", { pt: 11, color: C_GRAY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(20), children: [mkRun(clientOrg.toUpperCase(), { pt: 13, bold: true, color: C_DARK })] }),
      new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: C_BLUE } }, spacing: sp(200, 80), children: [] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(60),  children: [mkRun(`Nomor: ${doc.number}`, { pt: 10, color: C_GRAY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: sp(200), children: [mkRun(`Tanggal: ${tglFull(doc.date)}`, { pt: 10, color: C_GRAY })] }),

      new Paragraph({ spacing: sp(120), alignment: AlignmentType.JUSTIFIED, children: [
        mkRun("Memorandum of Understanding (MOU) ini dibuat dan ditandatangani pada hari ", { pt: 10 }),
        mkRun(c.dayName ?? "___________", { pt: 10, bold: true }),
        mkRun(", tanggal ", { pt: 10 }),
        mkRun(tglFull(doc.date), { pt: 10, bold: true }),
        mkRun(", oleh dan antara para pihak yang tersebut di bawah ini:", { pt: 10 }),
      ]}),
      gap(80),

      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: [Math.round(CONTENT * 0.5), Math.round(CONTENT * 0.5)],
        rows: [new TableRow({ children: [
          mkCell([
            new Paragraph({ spacing: sp(60), children: [mkRun("PIHAK PERTAMA", { pt: 10, bold: true, color: C_BLUE })] }),
            new Paragraph({ spacing: sp(40), children: [mkRun("PT CMLabs Indonesia Digital", { pt: 10, bold: true })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun("Jl. Raya Sulfat No.7, Malang", { pt: 9, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun("Diwakili oleh:", { pt: 9, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun(c.party1Rep ?? lead.assignedTo?.name ?? "_______________", { pt: 10, bold: true })] }),
            new Paragraph({ spacing: sp(0),  children: [mkRun(c.party1Position ?? "Direktur Utama", { pt: 9, color: C_GRAY })] }),
          ], { fill: C_BLUE_L, bc: C_BLUE, bsz: 6, w: Math.round(CONTENT * 0.5) }),
          mkCell([
            new Paragraph({ spacing: sp(60), children: [mkRun("PIHAK KEDUA", { pt: 10, bold: true, color: C_DARK })] }),
            new Paragraph({ spacing: sp(40), children: [mkRun(clientOrg, { pt: 10, bold: true })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun(lead.clientAddress ?? "_______________", { pt: 9, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun("Diwakili oleh:", { pt: 9, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(30), children: [mkRun(lead.clientName ?? "_______________", { pt: 10, bold: true })] }),
            new Paragraph({ spacing: sp(0),  children: [mkRun(lead.clientPosition ?? "Pimpinan", { pt: 9, color: C_GRAY })] }),
          ], { fill: C_WHITE, bc: C_LINE, w: Math.round(CONTENT * 0.5) }),
        ]})]
      }),
      gap(200),

      ...pasal(1, "TUJUAN KERJASAMA", purposes,    "mouPurpose"),
      ...pasal(2, "RUANG LINGKUP",    scopePoints, "mouScope"),
      ...pasal(3, "KETENTUAN UMUM",   terms,       "mouTerms"),

      new Paragraph({ spacing: sp(60),  children: [mkRun("PASAL 4", { pt: 9.5, bold: true, color: C_GRAY })] }),
      new Paragraph({ spacing: sp(100), children: [mkRun("MASA BERLAKU", { pt: 12, bold: true, color: C_BLUE })] }),
      new Paragraph({ spacing: sp(160), alignment: AlignmentType.JUSTIFIED, children: [
        mkRun("MOU ini berlaku selama ", { pt: 10 }),
        mkRun(c.validPeriod ?? "1 (satu) tahun", { pt: 10, bold: true }),
        mkRun(" terhitung sejak tanggal penandatanganan, dan berakhir pada tanggal ", { pt: 10 }),
        mkRun(tglFull(c.validUntil), { pt: 10, bold: true }),
        mkRun(". MOU dapat diperpanjang atas kesepakatan tertulis kedua belah pihak.", { pt: 10 }),
      ]}),
      gap(120),
      new Paragraph({ spacing: sp(200), alignment: AlignmentType.JUSTIFIED, children: [
        mkRun("Demikian MOU ini dibuat dalam rangkap 2 (dua), masing-masing bermaterai cukup dan mempunyai kekuatan hukum yang sama, ditandatangani oleh Para Pihak yang berwenang.", { pt: 10, italic: true, color: C_GRAY }),
      ]}),

      sigTable(
        { title: "PIHAK PERTAMA", org: "PT CMLabs Indonesia Digital", name: c.party1Rep ?? lead.assignedTo?.name ?? "_______________", role: c.party1Position ?? "Direktur Utama" },
        { title: "PIHAK KEDUA",   org: clientOrg,                      name: lead.clientName ?? "_______________",                      role: lead.clientPosition ?? "Pimpinan" },
      ),
    ]
  }

  // ══════════════════════════════════════════════════════════════════════════
  // OTHER (editable sections)
  // ══════════════════════════════════════════════════════════════════════════
  function buildOther(c: Record<string, any>): any[] {
    const { lead } = doc
    const sections: { title: string; body: string }[] = c.sections?.length ? c.sections : [
      { title: "Latar Belakang",   body: "Dokumen ini dibuat berdasarkan kebutuhan bisnis yang telah disepakati bersama antara PT CMLabs Indonesia Digital dan pihak terkait." },
      { title: "Tujuan",           body: "Menjalin hubungan bisnis yang profesional dan saling menguntungkan bagi kedua belah pihak." },
      { title: "Isi / Deskripsi",  body: "[ Isi dokumen — bagian ini dapat diedit langsung di Microsoft Word atau Google Docs sesuai kebutuhan. ]" },
      { title: "Catatan Tambahan", body: c.notes ?? "[ Tidak ada catatan tambahan. ]" },
    ]

    return [
      new Table({
        width:        { size: CONTENT, type: WidthType.DXA },
        columnWidths: [Math.round(CONTENT * 0.6), Math.round(CONTENT * 0.4)],
        rows: [new TableRow({ children: [
          mkCell([
            new Paragraph({ spacing: sp(40), children: [mkRun("CMLABS", { pt: 20, bold: true, color: C_BLUE })] }),
            new Paragraph({ spacing: sp(20), children: [mkRun("Jl. Raya Sulfat No.7, Malang, Jawa Timur 65112", { pt: 8.5, color: C_GRAY })] }),
            new Paragraph({ spacing: sp(20), children: [mkRun("hello@cmlabs.co  |  cmlabs.co", { pt: 8.5, color: C_GRAY })] }),
          ], { nb: true, w: Math.round(CONTENT * 0.6) }),
          mkCell([
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(40), children: [mkRun(c.docTypeLabel ?? "SURAT RESMI", { pt: 13, bold: true, color: C_DARK })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun(`No: ${doc.number}`, { pt: 9, color: C_GRAY })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun(`Tanggal: ${tglFull(doc.date)}`, { pt: 9, color: C_GRAY })] }),
          ], { nb: true, w: Math.round(CONTENT * 0.4) }),
        ]})]
      }),
      rule(),

      kvTable([
        kvRow("Perihal",  doc.title ?? "—"),
        kvRow("Kepada",   `${lead.clientName ?? "—"}${lead.clientCompany ? ` — ${lead.clientCompany}` : ""}`),
        kvRow("Dari",     lead.assignedTo?.name ?? "PT CMLabs Indonesia Digital"),
        kvRow("Email",    lead.clientEmail ?? "—"),
        kvRow("Telepon",  lead.clientPhone ?? "—"),
      ]),
      gap(200),

      ...sections.flatMap(sec => [
        new Paragraph({ spacing: sp(80), children: [mkRun(sec.title.toUpperCase(), { pt: 10.5, bold: true, color: C_BLUE })] }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C_BLUE_L } }, spacing: sp(80, 0), children: [] }),
        new Paragraph({ spacing: sp(180), alignment: AlignmentType.JUSTIFIED, children: [mkRun(sec.body, { pt: 10 })] }),
      ]),

      gap(200),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(40), children: [mkRun(`Malang, ${tglFull(doc.date)}`, { pt: 9, color: C_GRAY })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun("Hormat kami,", { pt: 9, color: C_GRAY })] }),
      gap(80), gap(80), gap(80), gap(80),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(20), children: [mkRun(lead.assignedTo?.name ?? "_______________", { pt: 10, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: sp(0),  children: [mkRun("PT CMLabs Indonesia Digital", { pt: 9, color: C_GRAY })] }),
    ]
  }

  // ── Numbering config ───────────────────────────────────────────────────────
  const numbering = {
    config: ["spkScope","spkTerms","mouPurpose","mouScope","mouTerms"].map(ref => ({
      reference: ref,
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text:   "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 500, hanging: 300 } } },
      }],
    })),
  }

  // ── Route ──────────────────────────────────────────────────────────────────
  let children: any[]
  if      (doc.type === "INVOICE") children = buildInvoice(doc.content)
  else if (doc.type === "SPK")     children = buildSPK(doc.content)
  else if (doc.type === "MOU")     children = buildMOU(doc.content)
  else                              children = buildOther(doc.content)

  // ── Assemble & download ────────────────────────────────────────────────────
  const docxDoc = new Document({
    numbering,
    styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
    sections: [{
      properties: {
        page: {
          size:   { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN + 200, left: MARGIN },
        },
      },
      footers:  { default: pageFooter },
      children,
    }],
  })

  const blob = await Packer.toBlob(docxDoc)
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement("a"), {
    href:     url,
    download: `${doc.type}_${doc.number.replace(/\//g, "-")}.docx`,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS — dipakai oleh CreateDocModal / DocumentForm
// ════════════════════════════════════════════════════════════════════════════

export function generateDocumentNumber(type: string): string {
  const now   = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year  = now.getFullYear()
  const seq   = String(Math.floor(Math.random() * 900) + 100) // 3-digit
  return `${type}/${month}/${year}/${seq}`
}

export function buildDefaultContent(
  type: string,
  leadData?: any,
  number?: string,
): Record<string, any> {
  const base = {
    documentNumber: number ?? generateDocumentNumber(type),
    date: new Date().toISOString().split("T")[0],  // "YYYY-MM-DD" → tglFull() akan format
    notes: "",
  }

  if (type === "INVOICE") return {
    ...base,
    dueDate:     "",
    bankName:    "Bank BCA",
    accountNo:   "",
    accountName: "PT CMLabs Indonesia Digital",
    items: [{
      description: "Deskripsi layanan",
      qty:   1,
      unit:  "Paket",
      price: leadData?.value ?? 0,
      total: leadData?.value ?? 0,
    }],
  }

  if (type === "SPK") return {
    ...base,
    value:     leadData?.value ?? 0,
    payment:   "50% DP, 50% setelah pekerjaan selesai",
    startDate: "",
    endDate:   "",
    duration:  "",
    penalty:   "",
    scope:     [],
  }

  if (type === "MOU") return {
    ...base,
    dayName:        "",
    party1Rep:      leadData?.assignedTo?.name ?? "",
    party1Position: "Direktur Utama",
    validPeriod:    "1 (satu) tahun",
    validUntil:     "",
    purposePoints:  [],
    scopePoints:    [],
    terms:          [],
  }

  // OTHER
  return {
    ...base,
    docTypeLabel: "SURAT RESMI",
    sections:     [],
  }
}