"use client"

import { useState, useEffect, useRef } from "react"
import {
  AreaChart, Area, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip,
} from "recharts"

interface MetricCardProps {
  label:       string
  value:       string | number
  rawValue?:   number
  sub?:        string
  color:       string
  sparkData?:  number[]
  trend?:      "up" | "down" | "neutral"
  trendValue?: string
  variant?:    "default" | "winrate" | "revenue" | "recycle"
  details?:    { label: string; value: string | number; color?: string }[]
  index?:      number
}

// ── Win Rate Radial ────────────────────────────────────────────
function WinRateRadial({ rate, color }: { rate: number; color: string }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(rate), 200)
    return () => clearTimeout(t)
  }, [rate])

  const data = [{ name: "rate", value: animated, fill: color }]

  return (
    <div style={{ position: "relative", width: 80, height: 80 }}>
      <RadialBarChart
        width={80} height={80}
        cx={40} cy={40}
        innerRadius={26} outerRadius={38}
        barSize={8}
        data={data}
        startAngle={90} endAngle={-270}
      >
        <RadialBar
          background={{ fill: "var(--bg-card2)" }}
          dataKey="value"
          cornerRadius={4}
          max={100}
        />
      </RadialBarChart>
      <div style={{
        position:  "absolute", inset: 0,
        display:   "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>
          {rate}
        </span>
        <span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 600 }}>%</span>
      </div>
    </div>
  )
}

// ── Animated Counter ───────────────────────────────────────────
function AnimatedValue({ value }: { value: string | number }) {
  const [displayed, setDisplayed] = useState("0")
  const isNumeric = typeof value === "number"

  useEffect(() => {
    if (!isNumeric) { setDisplayed(String(value)); return }
    const target  = value as number
    const dur     = 800
    const steps   = 40
    const step    = dur / steps
    let current   = 0

    const timer = setInterval(() => {
      current += target / steps
      if (current >= target) { setDisplayed(String(target)); clearInterval(timer) }
      else setDisplayed(String(Math.round(current)))
    }, step)

    return () => clearInterval(timer)
  }, [value, isNumeric])

  return <>{isNumeric ? displayed : value}</>
}

// ── Sparkline ──────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const mapped = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={mapped} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey="v"
          stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color.replace("#","")})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Progress Bar ───────────────────────────────────────────────
function ProgressBar({
  value, max, color, label,
}: {
  value: number; max: number; color: string; label?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height: 5, background: "var(--bg-card2)", borderRadius: 999, overflow: "hidden" }}>
        <div
          className="anim-bar"
          style={{
            height: "100%", borderRadius: 999,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}bb)`,
            boxShadow: `0 0 8px ${color}50`,
          }}
        />
      </div>
    </div>
  )
}

// ── Main MetricCard ────────────────────────────────────────────
export function MetricCard({
  label, value, rawValue, sub, color,
  sparkData, trend, trendValue, variant = "default",
  details, index = 0,
}: MetricCardProps) {
  const [hovered, setHovered] = useState(false)

  const trendColor = trend === "up" ? "#10b981" : trend === "down" ? "#ef4444" : "var(--text-muted)"

  const TrendArrow = () => {
    if (!trend) return null
    return (
      <div style={{
        display:      "flex", alignItems: "center", gap: 4,
        padding:      "3px 8px", borderRadius: 999,
        background:   trendColor + "18",
        fontSize:     10, fontWeight: 700, color: trendColor,
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {trend === "up"
            ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
            : trend === "down"
            ? <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
            : <><line x1="5" y1="12" x2="19" y2="12"/></>
          }
        </svg>
        {trendValue}
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="anim-slide-up"
      style={{
        background:    "var(--bg-card)",
        borderRadius:  14,
        padding:       "18px 18px 14px",
        border:        `1px solid ${hovered ? color + "50" : "var(--border)"}`,
        borderTop:     `3px solid ${color}`,
        position:      "relative",
        overflow:      "hidden",
        cursor:        "default",
        transition:    "all 0.22s ease",
        transform:     hovered ? "translateY(-3px)" : "none",
        boxShadow:     hovered
          ? `var(--shadow-md), 0 0 0 1px ${color}18`
          : "var(--shadow-xs)",
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* Background glow */}
      <div style={{
        position:   "absolute", top: -24, right: -24,
        width:      80, height: 80,
        borderRadius: "50%",
        background: color + (hovered ? "18" : "0c"),
        transition: "all 0.3s",
        transform:  hovered ? "scale(1.5)" : "scale(1)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{
            fontSize:  10, fontWeight: 700,
            color:     "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            {label}
          </div>
          <TrendArrow />
        </div>

        {/* Value + Win Rate */}
        {variant === "winrate" && typeof rawValue === "number" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WinRateRadial rate={rawValue} color={color} />
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{sub}</div>
              {details?.map((d) => (
                <div key={d.label} style={{ fontSize: 11, color: d.color ?? "var(--text-secondary)" }}>
                  <span style={{ fontWeight: 700 }}>{d.value}</span> {d.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{
              fontSize:   24,
              fontWeight: 900,
              color:      "var(--text-primary)",
              lineHeight: 1,
              marginBottom: 4,
              letterSpacing: "-0.02em",
            }}>
              <AnimatedValue value={value} />
            </div>

            {sub && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                {sub}
              </div>
            )}

            {/* Detail breakdown */}
            {details && details.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                {details.map((d, i) => (
                  <ProgressBar
                    key={i}
                    value={typeof d.value === "number" ? d.value : 0}
                    max={typeof rawValue === "number" ? rawValue : 100}
                    color={d.color ?? color}
                    label={d.label}
                  />
                ))}
              </div>
            )}

            {/* Sparkline */}
            {sparkData && sparkData.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Sparkline data={sparkData} color={color} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}