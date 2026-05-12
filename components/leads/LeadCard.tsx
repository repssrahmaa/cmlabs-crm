"use client"

import { Draggable }                    from "@hello-pangea/dnd"
import { Lead, PRIORITY_COLOR, PRIORITY_LABEL } from "@/types/lead"

interface Props {
  lead:    Lead
  index:   number
  onClick: (lead: Lead) => void
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

export default function LeadCard({ lead, index, onClick }: Props) {
  const pc  = PRIORITY_COLOR[lead.priority]
  const val = lead.value ? formatRupiah(Number(lead.value)) : null

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(lead)}
          style={{
            background:   snapshot.isDragging
              ? "var(--primary-pale)"
              : "var(--kanban-card-bg)",
            borderRadius: 10,
            padding:      12,
            marginBottom: 8,
            border:       `1px solid ${snapshot.isDragging ? "var(--border-focus)" : "var(--border)"}`,
            cursor:       "pointer",
            boxShadow:    snapshot.isDragging
              ? "var(--shadow-lg)"
              : "var(--shadow-xs)",
            transition:   "box-shadow 0.2s, border-color 0.2s",
            ...provided.draggableProps.style,
          }}
        >
          {/* Priority + Activity count */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{
              fontSize:     10, fontWeight: 700,
              padding:      "2px 8px", borderRadius: 999,
              background:   pc + "20", color: pc,
            }}>
              {PRIORITY_LABEL[lead.priority]}
            </span>
            {lead._count.activities > 0 && (
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {lead._count.activities} aktivitas
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontSize:     13, fontWeight: 600,
            color:        "var(--text-primary)",
            marginBottom: 3, lineHeight: 1.4,
          }}>
            {lead.title}
          </div>

          {/* Client */}
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
            {lead.clientName}
            {lead.clientCompany && ` · ${lead.clientCompany}`}
          </div>

          {/* Footer */}
          <div style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            paddingTop:     8,
            borderTop:      "1px solid var(--border-light)",
          }}>
            {val ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--success)" }}>
                {val}
              </span>
            ) : (
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Nilai belum diset</span>
            )}
            {lead.assignedTo && (
              <div style={{
                width:          22, height: 22,
                borderRadius:   "50%",
                background:     "var(--primary)",
                display:        "flex", alignItems: "center",
                justifyContent: "center",
                fontSize:       9, fontWeight: 700,
                color:          "#fff",
              }}>
                {lead.assignedTo.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}