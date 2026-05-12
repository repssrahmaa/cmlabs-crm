"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Lead }      from "@/types/lead"
import LeadCard      from "./LeadCard"

interface Props {
  id:          string
  label:       string
  color:       string
  bg:          string
  leads:       Lead[]
  onCardClick: (lead: Lead) => void
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", notation: "compact",
  }).format(v)
}

export default function KanbanColumn({ id, label, color, bg, leads, onCardClick }: Props) {
  const totalValue = leads.reduce((s, l) => s + (Number(l.value) || 0), 0)

  return (
    <div style={{
      width:        260,
      flexShrink:   0,
      display:      "flex",
      flexDirection: "column",
      maxHeight:    "calc(100vh - 200px)",
    }}>
      {/* Header */}
      <div style={{
        padding:      "10px 12px",
        borderRadius: "10px 10px 0 0",
        background:   "var(--bg-card)",
        borderTop:    `3px solid ${color}`,
        borderLeft:   "1px solid var(--border)",
        borderRight:  "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color }}>
            {label}
          </span>
          <span style={{
            fontSize:     11, fontWeight: 700,
            padding:      "2px 8px", borderRadius: 999,
            background:   color + "20", color,
          }}>
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, fontWeight: 500 }}>
            {formatRupiah(totalValue)}
          </div>
        )}
      </div>

      {/* Droppable */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex:         1,
              padding:      8,
              background:   snapshot.isDraggingOver
                ? color + "12"
                : "var(--kanban-col-bg)",
              borderRadius: "0 0 10px 10px",
              borderLeft:   `1px solid ${snapshot.isDraggingOver ? color + "50" : "var(--border)"}`,
              borderRight:  `1px solid ${snapshot.isDraggingOver ? color + "50" : "var(--border)"}`,
              borderBottom: `1px solid ${snapshot.isDraggingOver ? color + "50" : "var(--border)"}`,
              overflowY:    "auto",
              minHeight:    80,
              transition:   "background 0.2s",
            }}
          >
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div style={{
                textAlign: "center", padding: "20px 12px",
                color:     "var(--text-muted)", fontSize: 11,
              }}>
                Tidak ada leads
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}