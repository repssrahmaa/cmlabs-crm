"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import DocumentForm from "@/components/documents/DocumentForm"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from "recharts"

// Dynamic import PdfGenerator (client only)
const PdfGenerator = dynamic(
  () => import("@/components/documents/PdfGenerator"),
  { ssr: false }
)

// ── Types ─────────────────────────────────────────────
interface ReportData {
  period: { label: string; startDate: string; endDate: string }
  summary: {
    totalLeads:      number
    wonLeads:        number
    lostLeads:       number
    activeLeads:     number
    totalRevenue:    number
    avgDealSize:     number
    winRate:         number
    totalActivities: number
  }
  charts: {
    leadsByStatus:    { status: string; count: number }[]
    leadsByPriority:  { priority: string; count: number }[]
    leadsBySource:    { source: string; count: number }[]
    monthlyBreakdown: { month: string; created: number; won: number; lost: number; revenue: number }[]
  }
  salesPerformance: {
    name:    string
    role:    string
    total:   number
    won:     number
    lost:    number
    active:  number
    winRate: number
    revenue: number
  }[]
  recentWonLeads: any[]
}

interface Document {
  id:        string
  type:      string
  title:     string
  status:    string
  createdAt: string
  content:   Record<string, any>
  lead: {
    id:            string
    title:         string
    clientName:    string
    clientEmail?:  string | null
    clientCompany?: string | null
    clientPhone?:  string | null
    value?:        number | null
    assignedTo?:   { name: string } | null
  }
}

// ── Helpers ───────────────────────────────────────────
function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value)
}

const STATUS_COLOR: Record<string, string> = {
  LEAD_IN:          "#6366f1",
  CONTACT_MADE:     "#3b82f6",
  NEEDS_IDENTIFIED: "#0ea5e9",
  PROPOSAL_MADE:    "#f59e0b",
  NEGOTIATION:      "#f97316",
  CONTRACT_SENT:    "#8b5cf6",
  WON:              "#10b981",
  LOST:             "#ef4444",
}

const STATUS_LABEL: Record<string, string> = {
  LEAD_IN:          "Lead Masuk",
  CONTACT_MADE:     "Dihubungi",
  NEEDS_IDENTIFIED: "Kebutuhan",
  PROPOSAL_MADE:    "Proposal",
  NEGOTIATION:      "Negosiasi",
  CONTRACT_SENT:    "Kontrak",
  WON:              "Won",
  LOST:             "Lost",
}

const DOC_TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  INVOICE: { color: "#4B9EF3", bg: "#eff6ff" },
  SPK:     { color: "#1a6fd4", bg: "#dbeafe" },
  MOU:     { color: "#0891b2", bg: "#ecfeff" },
  OTHER:   { color: "#64748b", bg: "#f8fafc" },
}

const DOC_STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  DRAFT:     { color: "#f59e0b", bg: "#fffbeb", label: "Draft"      },
  FINALIZED: { color: "#2563eb", bg: "#eff6ff", label: "Final"      },
  SENT:      { color: "#059669", bg: "#ecfdf5", label: "Terkirim"   },
}

const PERIOD_OPTIONS = [
  { value: "this_month",   label: "Bulan Ini"       },
  { value: "last_month",   label: "Bulan Lalu"      },
  { value: "last_3_months", label: "3 Bulan Terakhir" },
  { value: "last_6_months", label: "6 Bulan Terakhir" },
  { value: "this_year",    label: "Tahun Ini"       },
]

// ── Main Component ────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab]       = useState<"report" | "documents">("report")
  const [period, setPeriod]             = useState("this_month")
  const [reportData, setReportData]     = useState<ReportData | null>(null)
  const [documents, setDocuments]       = useState<Document[]>([])
  const [loadingReport, setLoadingReport] = useState(true)
  const [loadingDocs, setLoadingDocs]   = useState(true)
  const [showDocForm, setShowDocForm]   = useState(false)
  const [selectedDoc, setSelectedDoc]   = useState<Document | null>(null)

  // Fetch report
  useEffect(() => {
    setLoadingReport(true)
    fetch(`/api/reports?period=${period}`)
      .then((r) => r.json())
      .then((data) => { setReportData(data); setLoadingReport(false) })
      .catch(() => setLoadingReport(false))
  }, [period])

  // Fetch documents
  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => { setDocuments(Array.isArray(data) ? data : []); setLoadingDocs(false) })
      .catch(() => setLoadingDocs(false))
  }, [])

  async function handleUpdateDocStatus(docId: string, status: string) {
    await fetch(`/api/documents/${docId}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    })
    setDocuments((prev) =>
      prev.map((d) => d.id === docId ? { ...d, status } : d)
    )
  }

  async function handleDeleteDoc(docId: string) {
    if (!confirm("Hapus dokumen ini?")) return
    await fetch(`/api/documents/${docId}`, { method: "DELETE" })
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
    if (selectedDoc?.id === docId) setSelectedDoc(null)
  }

  return (
    <div>
      {/* ── Tab Header ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
        {[
          { key: "report",    label: "Laporan Performa" },
          { key: "documents", label: "Dokumen Bisnis"   },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding:      "10px 20px",
              background:   "transparent",
              border:       "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
color:        activeTab === tab.key ? "var(--primary)" : "var(--text-muted)",
              fontSize:     14,
              fontWeight:   activeTab === tab.key ? 600 : 400,
              cursor:       "pointer",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: REPORT ────────────────────────────── */}
      {activeTab === "report" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Period Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Periode:</span>
            <div style={{ display: "flex", gap: 6 }}>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  style={{
                    padding:      "6px 14px",
                    background: period === opt.value ? "var(--primary)" : "var(--bg-card)",
                    border:     `1px solid ${period === opt.value ? "var(--primary)" : "var(--border)"}`,
                    color:        period === opt.value ? "var(--text-inverse)" : "var(--text-muted)",
                    borderRadius: 6,
                    fontSize:     12,
                    fontWeight:   period === opt.value ? 600 : 400,
                    cursor:       "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loadingReport ? (
            <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
              Memuat laporan...
            </div>
          ) : reportData ? (
            <>
              {/* KPI Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { label: "Total Leads",      value: reportData.summary.totalLeads,      color: "#2563eb", sub: `${reportData.summary.activeLeads} aktif` },
                  { label: "Won",              value: reportData.summary.wonLeads,         color: "#059669", sub: `Win rate ${reportData.summary.winRate}%` },
                  { label: "Total Revenue",    value: formatRupiah(reportData.summary.totalRevenue), color: "#7c3aed", sub: `Avg ${formatRupiah(reportData.summary.avgDealSize)}` },
                  { label: "Total Aktivitas",  value: reportData.summary.totalActivities, color: "#0891b2", sub: "Semua tipe" },
                ].map((card) => (
                  <div key={card.label} style={{
                    background:   "var(--bg-card)",
                    borderRadius: 10,
                    padding:      20,
                    border:       "1px solid var(--border)",
                    borderTop: `3px solid var(--primary)`,
                  }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Monthly Trend */}
                <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: 20, border: "1px solid var(--border)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Tren Leads Bulanan</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={reportData.charts.monthlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-card)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="created" name="Dibuat"  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="won"     name="Won"     stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="lost"    name="Lost"    stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Leads by Status */}
                <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: 20, border: "1px solid var(--border)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Distribusi per Status</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={reportData.charts.leadsByStatus} margin={{ bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-card)" />
                      <XAxis dataKey="status" tick={{ fontSize: 9, fill: "var(--text-muted)" }} angle={-30} textAnchor="end" interval={0} tickFormatter={(v) => STATUS_LABEL[v] ?? v} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [`${v} leads`, "Jumlah"]} labelFormatter={(l) => STATUS_LABEL[l] ?? l} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {reportData.charts.leadsByStatus.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLOR[entry.status] ?? "var(--bg-card)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales Performance Table */}
              <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Performa Sales</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-card)" }}>
                        {["#", "Nama", "Total", "Won", "Lost", "Aktif", "Win Rate", "Revenue"].map((h) => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.salesPerformance.map((s, i) => (
                        <tr key={s.name} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{s.name}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{s.total}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#059669" }}>{s.won}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#ef4444" }}>{s.lost}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#f59e0b" }}>{s.active}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 60, height: 6, background: "var(--bg-card)", borderRadius: 999 }}>
                                <div style={{ height: "100%", borderRadius: 999, width: `${s.winRate}%`, background: s.winRate >= 60 ? "#10b981" : s.winRate >= 30 ? "#f59e0b" : "#ef4444" }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{s.winRate}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#4b9ef3" }}>{formatRupiah(s.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Won Leads */}
              {reportData.recentWonLeads.length > 0 && (
                <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Leads Won Terbaru</h3>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-card)" }}>
                        {["Judul Lead", "Klien", "Perusahaan", "PIC", "Nilai"].map((h) => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.recentWonLeads.map((lead, i) => (
                        <tr key={lead.id} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-hover)" }}>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{lead.title}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{lead.clientName}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{lead.clientCompany ?? "-"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{lead.assignedTo?.name ?? "-"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                            {lead.value ? formatRupiah(Number(lead.value)) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── TAB: DOCUMENTS ─────────────────────────── */}
      {activeTab === "documents" && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              Total {documents.length} dokumen
            </p>
            <button
              onClick={() => setShowDocForm(true)}
              style={{ padding: "9px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              + Buat Dokumen
            </button>
          </div>

          {/* Layout: List + Detail */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* List Dokumen */}
            <div style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "var(--bg-card-header)", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Daftar Dokumen
              </div>

              {loadingDocs ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Memuat dokumen...</div>
              ) : documents.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  Belum ada dokumen
                </div>
              ) : (
                <div style={{ overflowY: "auto", maxHeight: 600 }}>
                  {documents.map((doc) => {
                    const typeCfg   = DOC_TYPE_CONFIG[doc.type]   ?? DOC_TYPE_CONFIG.OTHER
                    const statusCfg = DOC_STATUS_CONFIG[doc.status] ?? DOC_STATUS_CONFIG.DRAFT

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{
                          padding:    "14px 16px",
                          borderBottom: "1px solid var(--border)",
                          cursor:     "pointer",
                          borderTop: `3px solid #4B9EF3`,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: typeCfg.bg, color: typeCfg.color }}>
                                {doc.type}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: statusCfg.bg, color: statusCfg.color }}>
                                {statusCfg.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a", marginBottom: 2 }}>{doc.title}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{doc.lead?.clientName} · {new Date(doc.createdAt).toLocaleDateString("id-ID")}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Detail Dokumen */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {selectedDoc ? (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Doc Header */}
                  <div style={{ padding: "16px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{selectedDoc.title}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                          {selectedDoc.lead?.clientName} · {selectedDoc.lead?.clientCompany ?? "-"}
                        </div>
                      </div>
                      <button onClick={() => setSelectedDoc(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
                    </div>
                  </div>

                  {/* Doc Content Preview */}
                  <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      {[
                        { label: "No. Dokumen", value: selectedDoc.content.documentNumber ?? "-" },
                        { label: "Tanggal",     value: selectedDoc.content.date            ?? "-" },
                        { label: "Klien",       value: selectedDoc.lead?.clientName        ?? "-" },
                        { label: "Nilai",       value: selectedDoc.lead?.value ? formatRupiah(Number(selectedDoc.lead.value)) : "-" },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: "#f8fafc", borderRadius: 6, padding: 10 }}>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Invoice items preview */}
                    {selectedDoc.type === "INVOICE" && selectedDoc.content.items && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Item Tagihan
                        </div>
                        {selectedDoc.content.items.map((item: any, i: number) => (
                          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, color: "#374151" }}>{item.description}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>{formatRupiah(item.total)}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Grand Total</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>{formatRupiah(selectedDoc.content.grandTotal ?? 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* SPK scope */}
                    {selectedDoc.type === "SPK" && selectedDoc.content.scope && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Ruang Lingkup
                        </div>
                        {selectedDoc.content.scope.map((s: string, i: number) => (
                          <div key={i} style={{ padding: "4px 0", fontSize: 13, color: "#374151" }}>
                            {i + 1}. {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <PdfGenerator
                      document={{
                        type:    selectedDoc.type,
                        title:   selectedDoc.title,
                        content: selectedDoc.content,
                        lead:    selectedDoc.lead,
                      }}
                    />

                    {selectedDoc.status === "DRAFT" && (
                      <button
                        onClick={() => handleUpdateDocStatus(selectedDoc.id, "FINALIZED")}
                        style={{ padding: "8px 14px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                      >
                        Finalisasi
                      </button>
                    )}

                    {selectedDoc.status === "FINALIZED" && (
                      <button
                        onClick={() => handleUpdateDocStatus(selectedDoc.id, "SENT")}
                        style={{ padding: "8px 14px", background: "#ecfdf5", color: "#059669", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                      >
                        Tandai Terkirim
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDoc(selectedDoc.id)}
                      style={{ padding: "8px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300, color: "#94a3b8" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#64748b" }}>Pilih dokumen untuk melihat detail</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Document Form Modal ─────────────────────── */}
      {showDocForm && (
        <DocumentForm
          onClose={() => setShowDocForm(false)}
          onCreate={(doc) => setDocuments((prev) => [doc, ...prev])}
        />
      )}
    </div>
  )
}