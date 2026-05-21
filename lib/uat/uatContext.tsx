"use client"

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react"
import { getStepsForRole, UATRole, UATStep } from "./uatSteps"

interface UATState {
  active:      boolean
  role:        UATRole | null
  stepIndex:   number
  totalSteps:  number
  currentStep: UATStep | null
  doneSet:     Set<string>
  // actions
  start:       (role: UATRole) => void
  next:        () => void
  back:        () => void
  skip:        () => void
  markDone:    () => void
  jumpTo:      (idx: number) => void
  reset:       () => void
  setActive:   (v: boolean) => void
}

const UATContext = createContext<UATState | null>(null)

const SK = "uat-state-v4"

function load(role: string | null) {
  if (!role) return { stepIndex: 0, doneSet: [] as string[], active: false }
  try {
    const raw = localStorage.getItem(`${SK}-${role}`)
    if (!raw) return { stepIndex: 0, doneSet: [] as string[], active: false }
    return JSON.parse(raw)
  } catch { return { stepIndex: 0, doneSet: [] as string[], active: false } }
}

function save(role: string, data: { stepIndex: number; doneSet: string[]; active: boolean }) {
  try { localStorage.setItem(`${SK}-${role}`, JSON.stringify(data)) } catch {}
}

export function UATProvider({ children }: { children: React.ReactNode }) {
  const [role,       setRole]       = useState<UATRole | null>(null)
  const [steps,      setSteps]      = useState<UATStep[]>([])
  const [stepIndex,  setStepIndex]  = useState(0)
  const [doneSet,    setDoneSet]    = useState<Set<string>>(new Set())
  const [active,     setActive]     = useState(false)
  const [mounted,    setMounted]    = useState(false)

  // Load from localStorage when role is set
  useEffect(() => { setMounted(true) }, [])

  const start = useCallback((r: UATRole) => {
    const saved  = load(r)
    const roleSteps = getStepsForRole(r)
    setRole(r)
    setSteps(roleSteps)
    setStepIndex(saved.stepIndex ?? 0)
    setDoneSet(new Set(saved.doneSet ?? []))
    setActive(true)
    save(r, { stepIndex: saved.stepIndex ?? 0, doneSet: saved.doneSet ?? [], active: true })
  }, [])

  // Persist whenever state changes
  useEffect(() => {
    if (!mounted || !role) return
    save(role, { stepIndex, doneSet: Array.from(doneSet), active })
  }, [role, stepIndex, doneSet, active, mounted])

  const currentStep = steps[stepIndex] ?? null

  const markDone = useCallback(() => {
    if (!currentStep) return
    setDoneSet((prev) => { const n = new Set(prev); n.add(currentStep.id); return n })
  }, [currentStep])

  const next = useCallback(() => {
    markDone()
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [markDone, steps.length])

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const skip = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }, [steps.length])

  const jumpTo = useCallback((idx: number) => {
    setStepIndex(Math.max(0, Math.min(idx, steps.length - 1)))
  }, [steps.length])

  const reset = useCallback(() => {
    if (!role) return
    setStepIndex(0)
    setDoneSet(new Set())
    setActive(false)
    save(role, { stepIndex: 0, doneSet: [], active: false })
  }, [role])

  const value: UATState = {
    active, role, stepIndex,
    totalSteps: steps.length,
    currentStep,
    doneSet,
    start, next, back, skip, markDone, jumpTo, reset,
    setActive,
  }

  return <UATContext.Provider value={value}>{children}</UATContext.Provider>
}

export function useUAT() {
  const ctx = useContext(UATContext)
  if (!ctx) throw new Error("useUAT must be used within UATProvider")
  return ctx
}