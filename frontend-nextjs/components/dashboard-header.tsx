"use client"

import { useEffect, useState } from "react"
import { Pause, Play, Radio, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardHeader({
  live,
  onToggleLive,
  activeP1,
}: {
  live: boolean
  onToggleLive: () => void
  activeP1: number
}) {
  const [clock, setClock] = useState("--:--:--")

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-p1/15 text-p1">
            <ShieldAlert className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight tracking-tight">
              Resilinet <span className="text-muted-foreground font-normal">/ Incident Command</span>
            </h1>
            <p className="font-mono text-[11px] text-muted-foreground">Mesh Network Triage · Basecamp Node</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
          {activeP1 > 0 && (
            <span className="hidden items-center gap-1.5 rounded-md border border-p1/40 bg-p1/15 px-2.5 py-1 text-xs font-semibold text-p1 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-p1 animate-pulse-dot" aria-hidden />
              {activeP1} P1 ACTIVE
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
            <Radio className={cn("size-3.5", live ? "text-ok" : "text-muted-foreground")} aria-hidden />
            <span className="hidden sm:inline">Mesh link</span>
            <span className={cn("font-medium", live ? "text-ok" : "text-muted-foreground")}>
              {live ? "stable" : "paused"}
            </span>
          </span>

          <span className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs tabular-nums text-foreground/90">
            {clock}
          </span>

          <button
            type="button"
            onClick={onToggleLive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              live
                ? "bg-secondary text-secondary-foreground hover:bg-muted"
                : "bg-p1 text-p1-foreground hover:opacity-90",
            )}
          >
            {live ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
            {live ? "Pause feed" : "Resume feed"}
          </button>
        </div>
      </div>
    </header>
  )
}
