"use client"

import { useState, useEffect, useCallback } from "react"

export type Theme = "light" | "dark"

// Apply theme ke <html> LANGSUNG tanpa React cycle
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme)
  document.documentElement.style.colorScheme = theme
}

export function useTheme() {
  const [theme,   setThemeState] = useState<Theme>("light")
  const [mounted, setMounted]    = useState(false)

  useEffect(() => {
    const saved    = localStorage.getItem("crm-theme") as Theme | null
    const preferred: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light"
    const initial  = saved ?? preferred
    setThemeState(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    applyTheme(t)        // ← langsung ke DOM, tidak tunggu re-render
    localStorage.setItem("crm-theme", t)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light"
      applyTheme(next)
      localStorage.setItem("crm-theme", next)
      return next
    })
  }, [])

  return { theme, toggle, setTheme, mounted, isDark: theme === "dark" }
}