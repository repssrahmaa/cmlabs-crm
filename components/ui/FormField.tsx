// Ganti semua style hardcoded di components/leads/AddLeadModal.tsx
// dan components/leads/LeadModal.tsx dengan CSS variables

// ── Komponen Input yang reusable ──────────────────────────────
// components/ui/FormField.tsx
"use client"

interface FormFieldProps {
  label:       string
  required?:   boolean
  children:    React.ReactNode
  hint?:       string
}

export function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        color: "var(--text-muted)", marginBottom: 7,
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {label}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "9px 12px",
  background:   "var(--input-bg)",
  color:        "var(--input-text)",
  border:       "1px solid var(--input-border)",
  borderRadius: 9,
  fontSize:     13,
  boxSizing:    "border-box",
  transition:   "border-color 0.15s, box-shadow 0.15s",
}

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
}