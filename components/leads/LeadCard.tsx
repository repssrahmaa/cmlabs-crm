"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Lead, PRIORITY_COLOR, PRIORITY_LABEL } from "@/types/lead"

interface Props {
  lead:  Lead
  index: number
  onClick: (lead: Lead) => void
}

export default function LeadCard({ lead, index, onClick }: Props) {
  const valueFormatted = lead.value
    ? new Intl.NumberFormat("id-ID", {
        style:    "currency",
        currency: "IDR",
        notation: "compact",
      }).format(lead.value)
    : null

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(lead)}
          style={{
            background:   "#fff",
            borderRadius: 8,
            padding:      12,
            marginBottom: 8,
            border:       "1px solid #e2e8f0",
            cursor:       "pointer",
            boxShadow:    snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
            transform:    snapshot.isDragging ? "rotate(2deg)" : "none",
            transition:   "box-shadow 0.2s",
            ...provided.draggableProps.style,
          }}
        >
          {/* Priority Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{
              fontSize:     11,
              fontWeight:   600,
              padding:      "2px 8px",
              borderRadius: 999,
              background:   PRIORITY_COLOR[lead.priority] + "20",
              color:        PRIORITY_COLOR[lead.priority],
            }}>
              {PRIORITY_LABEL[lead.priority]}
            </span>
            {lead._count.activities > 0 && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {lead._count.activities} aktivitas
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontSize:   13,
            fontWeight: 600,
            color:      "#0f172a",
            marginBottom: 4,
            lineHeight: 1.4,
          }}>
            {lead.title}
          </div>

          {/* Client */}
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
            {lead.clientName}
            {lead.clientCompany && ` · ${lead.clientCompany}`}
          </div>

          {/* Footer */}
          <div style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            marginTop:      8,
            paddingTop:     8,
            borderTop:      "1px solid #f1f5f9",
          }}>
            {valueFormatted ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>
                {valueFormatted}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>Nilai belum diset</span>
            )}
            {lead.assignedTo && (
              <div style={{
                width:        24,
                height:       24,
                borderRadius: "50%",
                background:   "#2563eb",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                fontSize:     10,
                fontWeight:   700,
                color:        "#fff",
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