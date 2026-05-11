export interface DocumentData {
  type:           "INVOICE" | "SPK" | "MOU" | "OTHER"
  title:          string
  content:        Record<string, any>
  lead: {
    title:          string
    clientName:     string
    clientEmail?:   string | null
    clientPhone?:   string | null
    clientCompany?: string | null
    value?:         number | null
    assignedTo?:    { name: string; email?: string } | null
  }
}

export function generateDocumentNumber(type: string): string {
  const prefix = { INVOICE: "INV", SPK: "SPK", MOU: "MOU", OTHER: "DOC" }[type] ?? "DOC"
  const date   = new Date()
  const year   = date.getFullYear()
  const month  = String(date.getMonth() + 1).padStart(2, "0")
  const rand   = Math.floor(Math.random() * 9000 + 1000)
  return `${prefix}/${year}/${month}/${rand}`
}

export function buildDefaultContent(
  type:   string,
  lead:   DocumentData["lead"],
  number: string
): Record<string, any> {
  const now = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })

  switch (type) {
    case "INVOICE":
      return {
        documentNumber: number,
        date:           now,
        dueDate:        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        items: [{
          no:          1,
          description: lead.title,
          qty:         1,
          unit:        "Paket",
          price:       Number(lead.value ?? 0),
          total:       Number(lead.value ?? 0),
        }],
        subtotal:    Number(lead.value ?? 0),
        tax:         Math.round(Number(lead.value ?? 0) * 0.11),
        grandTotal:  Math.round(Number(lead.value ?? 0) * 1.11),
        bankName:    "Bank BCA",
        accountNo:   "1234567890",
        accountName: "PT CMLabs Indonesia",
        notes:       "Pembayaran dilakukan dalam 14 hari kerja setelah invoice diterima.",
      }
    case "SPK":
      return {
        documentNumber: number,
        date:           now,
        startDate:      now,
        endDate:        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        scope: [
          "Pelaksanaan pekerjaan sesuai dengan proposal yang telah disetujui bersama",
          "Pelaporan progres pekerjaan setiap minggu kepada klien",
          "Revisi maksimal 3 (tiga) kali per deliverable",
          "Serah terima hasil pekerjaan secara tertulis disertai berita acara",
        ],
        value:   Number(lead.value ?? 0),
        payment: "50% di awal pekerjaan, 50% setelah pekerjaan selesai",
        penalty: "Keterlambatan penyelesaian dikenakan denda 0,1% per hari dari nilai kontrak",
        notes:   "Surat Perintah Kerja ini sah dan mengikat setelah ditandatangani kedua belah pihak.",
      }
    case "MOU":
      return {
        documentNumber: number,
        date:           now,
        validUntil:     new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        purposePoints: [
          "Menjalin kerjasama strategis di bidang pemasaran digital dan teknologi",
          "Pengembangan solusi teknologi informasi yang berkelanjutan",
          "Peningkatan kapasitas dan kompetensi sumber daya manusia",
        ],
        party1: {
          name:    "PT CMLabs Indonesia",
          address: "Jl. Raya Darmo No. 54, Surabaya, Jawa Timur",
          rep:     "Direktur Utama",
        },
        party2: {
          name:    lead.clientCompany ?? lead.clientName,
          address: "-",
          rep:     lead.clientName,
        },
        terms: [
          "Kedua belah pihak sepakat untuk menjaga kerahasiaan seluruh informasi yang bersifat rahasia",
          "Kerjasama bersifat non-eksklusif dan tidak mengikat secara eksklusif",
          "Segala perselisihan yang timbul akan diselesaikan secara musyawarah mufakat",
          "MOU ini dapat diperpanjang atas dasar kesepakatan tertulis dari kedua belah pihak",
        ],
      }
    default:
      return { documentNumber: number, date: now, content: "" }
  }
}