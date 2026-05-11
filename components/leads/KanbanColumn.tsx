"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Lead } from "@/types/lead"
import LeadCard from "./LeadCard"

interface Props {
  id:      string
  label:   string
  color:   string
  bg:      string
  leads:   Lead[]
  onCardClick: (lead: Lead) => void
}

export default function KanbanColumn({
  id, label, color, bg, leads, onCardClick,
}: Props) {
  const totalValue = leads.reduce((sum, l) => sum + (l.value ?? 0), 0)
  const valueFormatted = totalValue > 0
    ? new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", notation: "compact",
      }).format(totalValue)
    : null

  return (
    <div style={{
      width:        260,
      flexShrink:   0,
      display:      "flex",
      flexDirection: "column",
      maxHeight:    "calc(100vh - 160px)",
    }}>
      {/* Column Header */}
      <div style={{
        padding:      "10px 12px",
        borderRadius: "8px 8px 0 0",
        background:   bg,
        borderBottom: `2px solid ${color}`,
        marginBottom: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color }}>
            {label}
          </span>
          <span style={{
            fontSize:     12,
            fontWeight:   600,
            padding:      "1px 8px",
            borderRadius: 999,
            background:   color + "20",
            color,
          }}>
            {leads.length}
          </span>
        </div>
        {valueFormatted && (
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {valueFormatted}
          </div>
        )}
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
            flex:           1,
            padding:        8,
            background:     snapshot.isDraggingOver ? color + "10" : "#f8fafc",
            borderRadius:   "0 0 8px 8px",
            borderLeft:     `1px solid ${snapshot.isDraggingOver ? color + "40" : "#e2e8f0"}`,
            borderRight:    `1px solid ${snapshot.isDraggingOver ? color + "40" : "#e2e8f0"}`,
            borderBottom:   `1px solid ${snapshot.isDraggingOver ? color + "40" : "#e2e8f0"}`,
            borderTop:      "none",
            overflowY:      "auto",
            minHeight:      80,
            transition:     "background 0.2s",
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
                textAlign:  "center",
                padding:    "20px 12px",
                color:      "#cbd5e1",
                fontSize:   12,
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