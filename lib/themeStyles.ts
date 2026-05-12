export const ts = {
// Page wrapper
page: {
background: "var(--bg-page)",
color: "var(--text-primary)",
minHeight: "100%",
} as React.CSSProperties,

// Cards
card: {
background: "var(--bg-card)",
border: "1px solid var(--border)",
borderRadius: 16,
boxShadow: "var(--shadow-sm)",
color: "var(--text-primary)",
} as React.CSSProperties,

card2: {
background: "var(--bg-card2)",
border: "1px solid var(--border)",
borderRadius: 12,
color: "var(--text-primary)",
} as React.CSSProperties,

// Text
textPrimary: { color: "var(--text-primary)" } as React.CSSProperties,
textSecondary: { color: "var(--text-secondary)" } as React.CSSProperties,
textMuted: { color: "var(--text-muted)" } as React.CSSProperties,

// Input
input: {
width: "100%",
padding: "9px 12px",
background: "var(--input-bg)",
border: "1px solid var(--input-border)",
borderRadius: 8,
fontSize: 14,
color: "var(--input-text)",
boxSizing: "border-box",
} as React.CSSProperties,

// Label
label: {
fontSize: 12,
fontWeight: 700,
color: "var(--text-muted)",
display: "block",
marginBottom: 6,
textTransform: "uppercase" as const,
letterSpacing: "0.05em",
} as React.CSSProperties,

// Divider
divider: {
borderTop: "1px solid var(--border)",
margin: "16px 0",
} as React.CSSProperties,

// Badge base
badge: (color: string) => ({
fontSize: 11,
fontWeight: 600,
padding: "3px 10px",
borderRadius: 999,
background: color + "20",
color,
}) as React.CSSProperties,

// Table
tableHead: {
background: "var(--table-head-bg)",
} as React.CSSProperties,

tableHeadCell: {
padding: "10px 16px",
textAlign: "left" as const,
fontSize: 11,
fontWeight: 600,
color: "var(--text-muted)",
textTransform: "uppercase" as const,
letterSpacing: "0.05em",
whiteSpace: "nowrap" as const,
} as React.CSSProperties,

tableCell: {
padding: "12px 16px",
fontSize: 14,
color: "var(--text-secondary)",
} as React.CSSProperties,

// Section title
sectionTitle: {
fontSize: 15,
fontWeight: 700,
color: "var(--text-primary)",
margin: 0,
} as React.CSSProperties,

sectionSub: {
fontSize: 12,
color: "var(--text-muted)",
margin: "4px 0 0",
} as React.CSSProperties,

// Modal
modalOverlay: {
position: "fixed" as const,
inset: 0,
background: "rgba(0,0,0,0.6)",
zIndex: 100,
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: 24,
} as React.CSSProperties,

modalContent: {
background: "var(--bg-card)",
border: "1px solid var(--border)",
borderRadius: 16,
boxShadow: "var(--shadow-xl)",
color: "var(--text-primary)",
} as React.CSSProperties,
}
