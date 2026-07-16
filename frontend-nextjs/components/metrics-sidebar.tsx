"use client"

import {
  Activity,
  Cpu,
  Filter,
  Gauge,
  Layers,
  ShieldAlert,
  Signal as SignalIcon,
  Timer,
  Waves,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Metrics {
  totalReceived: number
  droppedByDedup: number
  activeP1: number
  dispatched: number
  resolved: number
  avgConfidence: number
  avgClassifyMs: number
  bandwidthPct: number
  throughput: number
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof Activity
  label: string
  value: string
  hint?: string
  tone?: "default" | "danger" | "accent" | "ok"
}) {
  const toneCls = {
    default: "text-foreground",
    danger: "text-p1",
    accent: "text-accent",
    ok: "text-ok",
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn("mt-1.5 font-mono text-2xl font-semibold tabular-nums", toneCls)}>{value}</div>
      {hint && <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Meter({
  label,
  pct,
  icon: Icon,
  danger,
}: {
  label: string
  pct: number
  icon: typeof Activity
  danger?: boolean
}) {
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {label}
        </span>
        <span className="font-mono tabular-nums text-foreground/80">{clamped.toFixed(0)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", danger ? "bg-p1" : "bg-accent")}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

export function MetricsSidebar({ metrics }: { metrics: Metrics }) {
  const dedupRate =
    metrics.totalReceived > 0 ? (metrics.droppedByDedup / metrics.totalReceived) * 100 : 0

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
      <div className="rounded-xl border border-border bg-panel p-4">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-accent" aria-hidden />
          <h2 className="text-sm font-semibold">Triage Engine</h2>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-ok/15 px-2 py-0.5 text-[11px] font-medium text-ok">
            <span className="size-1.5 rounded-full bg-ok animate-pulse-dot" aria-hidden />
            Local · Online
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Naive Bayes + TF-IDF classifier running on-node. No cloud dependency.
        </p>

        <div className="mt-4 space-y-3.5">
          <Meter label="Network bandwidth load" pct={metrics.bandwidthPct} icon={Waves} danger={metrics.bandwidthPct > 80} />
          <Meter label="Avg model confidence" pct={metrics.avgConfidence * 100} icon={Gauge} />
        </div>
      </div>

      <div className="rounded-xl border border-p1/30 bg-p1/[0.06] p-4">
        <div className="flex items-center gap-2 text-p1">
          <Filter className="size-4" aria-hidden />
          <h2 className="text-sm font-semibold">Signals Dropped — Deduplication</h2>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-mono text-4xl font-bold tabular-nums text-p1">{metrics.droppedByDedup}</span>
          <span className="mb-1 text-xs text-muted-foreground">redundant signals filtered</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {dedupRate.toFixed(0)}% of {metrics.totalReceived} inbound broadcasts collapsed by spatial GPS matching —
          reducing coordinator cognitive load.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={ShieldAlert}
          label="Active P1"
          value={String(metrics.activeP1)}
          hint="Immediate life threat"
          tone="danger"
        />
        <StatTile icon={SignalIcon} label="Received" value={String(metrics.totalReceived)} hint="Total inbound" />
        <StatTile icon={Activity} label="Dispatched" value={String(metrics.dispatched)} hint="Units en route" tone="accent" />
        <StatTile icon={Layers} label="Resolved" value={String(metrics.resolved)} hint="Cases closed" tone="ok" />
        <StatTile
          icon={Timer}
          label="Classify time"
          value={`${metrics.avgClassifyMs.toFixed(1)}ms`}
          hint="Avg per signal"
        />
        <StatTile icon={Waves} label="Throughput" value={`${metrics.throughput}/min`} hint="Signals ingested" />
      </div>
    </aside>
  )
}
