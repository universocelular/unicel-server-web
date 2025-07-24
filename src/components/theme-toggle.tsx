
"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled={true} />
  }

  const isDark = theme === "dark";

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
        {isDark ? (
            <span className="text-2xl transition-all">☀️</span>
        ) : (
            <span className="text-2xl transition-all">🌙</span>
        )}
        <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
