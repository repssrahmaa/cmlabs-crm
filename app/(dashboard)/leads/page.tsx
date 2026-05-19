"use client"

import { useState, useMemo }    from "react"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { useLeads }             from "@/hooks/useLeads"
import { useRoleGuard }         from "@/hooks/useRoleGuard"
import { useAccessNotice, AccessToast, AccessBanner } from "@/components/ui/AccessNotice"
import { Lead, LeadStatus, KANBAN_COLUMNS } from "@/types/lead"
import KanbanColumn             from "@/components/leads/KanbanColumn"
import LeadModal                from "@/components/leads/LeadModal"
import AddLeadModal             from "@/components/leads/AddLeadModal"

export default function LeadsPage() {
  const { leads, loading, fetchLeads, updateLeadStatus, createLead, deleteLead } = useLeads()
  const { role, userId, canDeleteLead, canAssignLead, is } = useRoleGuard()
  const { notice, showNotice, hideNotice }  = useAccessNotice()

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAddModal, setShowAddModal]  = useState(false)
  const [search, setSearch]             = useState("")

  const isReadOnly  = is("EXECUTIVE", "VIEWER")
  const isAE        = is("ACCOUNT_EXECUTIVE")

  const leadsByStatus = useMemo(() => {
    const filtered = leads.filter((l) =>
      search === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (l.clientCompany ?? "").toLowerCase().includes(search.toLowerCase())
    )
    return KANBAN_COLUMNS.reduce((acc, col) => {
      acc[col.id] = filtered.filter((l) => l.status === col.id)
      return acc
    }, {} as Record<LeadStatus, Lead[]>)
  }, [leads, search])
const totalValue = useMemo(() => {
  return leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0)
}, [leads])

const DEALValue = useMemo(() => {
  return leads
    .filter((l) => l.status === "DEAL")
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0)
}, [leads])

const pipelineValue = useMemo(() => {
  return leads
    .filter((l) => !["DEAL","RECYCLE"].includes(l.status))
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0)
}, [leads])

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    // Cek akses drag
    if (isReadOnly) {
      showNotice("readonly", "Anda tidak dapat memindahkan lead dalam mode lihat saja.")
      return
    }

    if (isAE) {
      const lead = leads.find((l) => l.id === draggableId)
      if (lead?.assignedTo?.id !== userId) {
        showNotice("own_only", "Anda hanya dapat memindahkan lead yang ditugaskan ke Anda.")
        return
      }
    }

    updateLeadStatus(draggableId, destination.droppableId as LeadStatus)
  }

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value)
}
  function handleAddClick() {
    if (isReadOnly) {
      showNotice("readonly")
      return
    }
    setShowAddModal(true)
  }

  async function handleUpdate(id: string, updatedData: Partial<Lead>) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updatedData),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error ?? "Gagal update")
      }
      const updated: Lead = await res.json()
      await fetchLeads()
      setSelectedLead((prev) => prev?.id === id ? { ...prev, ...updated } : prev)
    } catch (err: any) {
      throw new Error(err.message ?? "Gagal update")
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#64748b" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⟳</div>
          <div>Memuat leads...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: "calc(100vh - 112px)", display: "flex", flexDirection: "column" }}>

      {/* ── Access Banner ─────────────────────────────────── */}
      {is("EXECUTIVE") && (
        <AccessBanner
          type="readonly"
          role="Executive"
          message="Anda dapat melihat semua leads namun tidak dapat melakukan perubahan."
        />
      )}
      {is("VIEWER") && (
        <AccessBanner
          type="readonly"
          role="Viewer"
          message="Anda hanya dapat melihat data leads."
        />
      )}
      {isAE && (
        <AccessBanner
          type="own_only"
          role="Account Executive"
          message="Anda dapat melihat semua leads, namun hanya dapat mengubah lead yang ditugaskan ke Anda."
        />
      )}

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16, gap: 12,
      }}>
        <input
          type="text"
          placeholder="Cari leads, klien, perusahaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
padding: "9px 14px",
border: "1px solid var(--input-border)",
borderRadius: 8, fontSize: 14,
width: 300,
background: "var(--input-bg)",
color: "var(--input-text)",
}}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Total: <strong>{leads.length}</strong> leads
          </span>

          {/* Tombol tambah — semua kecuali EXECUTIVE dan VIEWER */}
          {!isReadOnly && (
            <button
              onClick={handleAddClick}
              style={{
              padding:"9px 18px",
              background:"linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color:"#fff", border:"none", borderRadius:9,
              fontSize:12, fontWeight:600, cursor:"pointer",
              boxShadow:"var(--shadow-primary)",
            }}
            >
              + Tambah Lead
            </button>
          )}
        </div>
      </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
    marginBottom: 16,
  }}
>
  {[
{ label: "Total Leads", value: leads.length, suffix: "leads", color: "var(--primary)", icon: "📋" },
{ label: "Pipeline Value", value: formatRupiah(pipelineValue), suffix: "", color: "var(--warning)", icon: "🔥" },
{ label: "Revenue DEAL", value: formatRupiah(DEALValue), suffix: "", color: "var(--success)", icon: "💰" },
{ label: "DEAL", value: leads.filter(l => l.status === "DEAL").length, suffix: "leads", color: "var(--purple)", icon: "🏆" },
].map((s) => (
<div key={s.label} style={{
background: "var(--bg-card)", // ← BUKAN #fff
borderRadius: 10,
padding: "10px 14px",
border: "1px solid var(--border)", // ← BUKAN hardcoded
display: "flex", alignItems: "center", gap: 10,
boxShadow: "var(--shadow-xs)",
}}>
<span style={{ fontSize: 18 }}>{s.icon}</span>
<div>
<div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>
{s.value}
{s.suffix && (
<span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", marginLeft: 3 }}>
{s.suffix}
</span>
)}
</div>
<div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
{s.label}
</div>
</div>
</div>
))}
</div>




      {/* ── Kanban Board ──────────────────────────────────── */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, paddingBottom: 16 }}>
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              bg={col.bg}
              leads={leadsByStatus[col.id] ?? []}
              onCardClick={setSelectedLead}
            />
          ))}
        </div>
      </DragDropContext>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdate}
          onDelete={deleteLead}
        />
      )}

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onCreate={createLead}
        />
      )}

      {/* ── Toast Notification ────────────────────────────── */}
      <AccessToast
        type={notice.type}
        message={notice.message}
        show={notice.show}
        onClose={hideNotice}
      />
    </div>
  )
}

// Di komponen LeadModal dan form lead, ganti semua style inline hardcoded
// Cari-ganti pattern berikut di LeadModal.tsx:

// ── Fix warna modal overlay ────────────────────────────────────
// style modal container
const modalStyle: React.CSSProperties = {
  background:   "var(--bg-card)",
  color:        "var(--text-primary)",
  border:       "1px solid var(--border)",
  borderRadius: 16,
  boxShadow:    "var(--shadow-xl)",
}

// ── Fix warna section dalam modal ─────────────────────────────
const sectionStyle: React.CSSProperties = {
  background:   "var(--bg-card2)",
  border:       "1px solid var(--border)",
  borderRadius: 10,
  padding:      "14px 16px",
}

// ── Fix warna label ────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize:  11, fontWeight: 700,
  color:     "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

// ── Fix warna value text ───────────────────────────────────────
const valueStyle: React.CSSProperties = {
  fontSize: 13, color: "var(--text-primary)", fontWeight: 500,
}

// ── Fix warna secondary text ───────────────────────────────────
const secondaryStyle: React.CSSProperties = {
  fontSize: 12, color: "var(--text-secondary)",
}