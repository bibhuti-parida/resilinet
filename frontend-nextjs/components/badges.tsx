import { cn } from "@/lib/utils"
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type SignalStatus } from "@/lib/signals"

const PRIORITY_STYLES: Record<Priority, string> = {
  1: "bg-p1/15 text-p1 border-p1/40",
  2: "bg-p2/15 text-p2 border-p2/40",
  3: "bg-p3/15 text-p3 border-p3/40",
  4: "bg-p4/20 text-p4-foreground/80 border-border",
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        PRIORITY_STYLES[priority],
        className,
      )}
    >
      {priority === 1 && <span className="size-1.5 rounded-full bg-p1 animate-pulse-dot" aria-hidden />}
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

const STATUS_STYLES: Record<SignalStatus, string> = {
  new: "bg-accent/15 text-accent border-accent/40",
  acknowledged: "bg-p3/15 text-p3 border-p3/40",
  dispatched: "bg-p2/15 text-p2 border-p2/40",
  resolved: "bg-ok/15 text-ok border-ok/40",
}

export function StatusBadge({ status, className }: { status: SignalStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
