"use client"

import { Copy, MapPin, Radio, Check, Send, CircleCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Signal, type SignalStatus } from "@/lib/signals"
import { PriorityBadge, StatusBadge } from "@/components/badges"

function timeAgo(ts: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 5) return "just now"
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

const NEXT_ACTION: Partial<Record<SignalStatus, { label: string; next: SignalStatus; icon: typeof Check }>> = {
  new: { label: "Acknowledge", next: "acknowledged", icon: Check },
  acknowledged: { label: "Dispatch unit", next: "dispatched", icon: Send },
  dispatched: { label: "Mark resolved", next: "resolved", icon: CircleCheck },
}

export function SignalCard({
  signal,
  now,
  onAdvance,
  isNew,
}: {
  signal: Signal
  now: number
  onAdvance: (id: string, next: SignalStatus) => void
  isNew?: boolean
}) {
  const isP1 = signal.priority === 1 && signal.status !== "resolved"
  const action = NEXT_ACTION[signal.status]

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-3.5 transition-colors",
        isNew && "animate-signal-in",
        isP1 ? "animate-p1-flash border-p1/60" : "border-border hover:border-border/80",
        signal.status === "resolved" && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={signal.priority} />
          <StatusBadge status={signal.status} />
        </div>
        <time className="shrink-0 font-mono text-xs text-muted-foreground" dateTime={new Date(signal.receivedAt).toISOString()}>
          {timeAgo(signal.receivedAt, now)}
        </time>
      </div>

      <p className={cn("mt-2.5 text-pretty text-sm leading-relaxed", isP1 ? "text-foreground font-medium" : "text-foreground/90")}>
        {signal.message}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="text-foreground/70">{signal.id}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" aria-hidden />
          {signal.sector}
        </span>
        <span className="inline-flex items-center gap-1">
          <Radio className="size-3" aria-hidden />
          {signal.node}
        </span>
        <span className="inline-flex items-center gap-1" title="Local NLP classification confidence">
          <span className="text-foreground/70">{(signal.confidence * 100).toFixed(0)}%</span> conf.
        </span>
        {signal.duplicates > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-foreground/70"
            title="Redundant broadcasts merged by spatial deduplication"
          >
            <Copy className="size-3" aria-hidden />
            {signal.duplicates} merged
          </span>
        )}
        <span className="ml-auto text-muted-foreground/60 tracking-tight">{signal.category}</span>
      </div>

      {action && (
        <div className="mt-3 border-t border-border/60 pt-2.5">
          <button
            type="button"
            onClick={() => onAdvance(signal.id, action.next)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              isP1
                ? "bg-p1 text-p1-foreground hover:opacity-90"
                : "bg-secondary text-secondary-foreground hover:bg-muted",
            )}
          >
            <action.icon className="size-3.5" aria-hidden />
            {action.label}
          </button>
        </div>
      )}
    </article>
  )
}
