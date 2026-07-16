"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Inbox } from "lucide-react"
import {
  createSignal,
  type Priority,
  type Signal,
  type SignalStatus,
} from "@/lib/signals"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsSidebar, type Metrics } from "@/components/metrics-sidebar"
import { SignalCard } from "@/components/signal-card"

type Filter = "all" | "active" | Priority

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Unresolved" },
  { key: 1, label: "P1" },
  { key: 2, label: "P2" },
  { key: 3, label: "P3" },
  { key: 4, label: "P4" },
]

const MAX_SIGNALS = 60
const TRIAGE_API_URL = process.env.NEXT_PUBLIC_TRIAGE_API_URL ?? "http://127.0.0.1:8000/api/triage"

type TriageApiSignal = {
  id: string
  text: string
  priority: Priority
  confidence: number
  category: string
  latitude: number
  longitude: number
  meshNode: string
  sector: string
  status: "New"
  mergedDuplicates: number
  receivedAt: number
  processingMs: number
}

type TriageMetrics = {
  totalReceived: number
  droppedByDeduplication: number
  activeSignals: number
  mergedDuplicates: number
  averageProcessingMs: number
  throughputPerMinute: number
}

type TriageResponse = {
  status: "ingested" | "dropped_by_deduplication"
  signal: TriageApiSignal
  metrics: TriageMetrics
}

function toDashboardSignal(signal: TriageApiSignal): Signal {
  return {
    id: signal.id,
    priority: signal.priority,
    category: signal.category as Signal["category"],
    message: signal.text,
    sector: signal.sector,
    node: signal.meshNode,
    lat: signal.latitude,
    lng: signal.longitude,
    status: signal.status.toLowerCase() as SignalStatus,
    confidence: signal.confidence,
    duplicates: signal.mergedDuplicates,
    receivedAt: signal.receivedAt,
  }
}

export function IncidentDashboard() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [live, setLive] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [now, setNow] = useState(() => Date.now())
  const [newestId, setNewestId] = useState<string | null>(null)
  const [triageMetrics, setTriageMetrics] = useState<TriageMetrics>({
    totalReceived: 0,
    droppedByDeduplication: 0,
    activeSignals: 0,
    mergedDuplicates: 0,
    averageProcessingMs: 0,
    throughputPerMinute: 0,
  })

  // Wall clock for relative timestamps
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Development transmitter: sends each synthetic mesh broadcast to FastAPI.
  // Replace createSignal() with real mesh payloads when the radio bridge is connected.
  useEffect(() => {
    if (!live) return
    let timeout: ReturnType<typeof setTimeout>
    let cancelled = false

    const schedule = () => {
      const delay = 1800 + Math.random() * 2600
      timeout = setTimeout(() => {
        const draft = createSignal()
        void fetch(TRIAGE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: draft.message,
            latitude: draft.lat,
            longitude: draft.lng,
            mesh_node: draft.node,
            sector: draft.sector,
          }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error(`Triage API returned ${response.status}`)
            return (await response.json()) as TriageResponse
          })
          .then((payload) => {
            if (cancelled) return
            setTriageMetrics(payload.metrics)
            const signal = toDashboardSignal(payload.signal)
            if (payload.status === "ingested") {
              setSignals((previous) => [signal, ...previous].slice(0, MAX_SIGNALS))
              setNewestId(signal.id)
            } else {
              setSignals((previous) => previous.map((item) => (item.id === signal.id ? signal : item)))
            }
          })
          .catch((error: unknown) => {
            console.error("Unable to submit mesh signal to the triage API", error)
          })
          .finally(() => {
            if (!cancelled) schedule()
          })
      }, delay)
    }
    schedule()
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [live])

  const advance = useCallback((id: string, next: SignalStatus) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, status: next } : s)))
  }, [])

  const metrics: Metrics = useMemo(() => {
    const activeP1 = signals.filter((s) => s.priority === 1 && s.status !== "resolved").length
    const dispatched = signals.filter((s) => s.status === "dispatched").length
    const resolved = signals.filter((s) => s.status === "resolved").length
    const avgConfidence =
      signals.length > 0 ? signals.reduce((a, s) => a + s.confidence, 0) / signals.length : 0
    const unresolved = signals.filter((s) => s.status !== "resolved").length
    const bandwidthPct = Math.min(98, 22 + unresolved * 4.5)

    return {
      totalReceived: triageMetrics.totalReceived,
      droppedByDedup: triageMetrics.droppedByDeduplication,
      activeP1,
      dispatched,
      resolved,
      avgConfidence,
      avgClassifyMs: triageMetrics.averageProcessingMs,
      bandwidthPct,
      throughput: Math.round(triageMetrics.throughputPerMinute),
    }
  }, [signals, triageMetrics])

  const visible = useMemo(() => {
    const sorted = [...signals].sort((a, b) => {
      const aActive = a.status !== "resolved"
      const bActive = b.status !== "resolved"
      if (aActive !== bActive) return aActive ? -1 : 1
      if (aActive && a.priority !== b.priority) return a.priority - b.priority
      return b.receivedAt - a.receivedAt
    })
    if (filter === "all") return sorted
    if (filter === "active") return sorted.filter((s) => s.status !== "resolved")
    return sorted.filter((s) => s.priority === filter)
  }, [signals, filter])

  return (
    <div className="min-h-dvh bg-background">
      <DashboardHeader live={live} onToggleLive={() => setLive((v) => !v)} activeP1={metrics.activeP1} />

      <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row">
        <section className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="mr-1 text-sm font-semibold">Live Distress Stream</h2>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", live ? "bg-ok animate-pulse-dot" : "bg-muted-foreground")} aria-hidden />
              {live ? "receiving" : "paused"}
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-1" role="group" aria-label="Filter signals">
              {FILTERS.map((f) => (
                <button
                  key={String(f.key)}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    filter === f.key
                      ? "bg-foreground text-background"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-muted-foreground">
                <Inbox className="size-6" aria-hidden />
                <p className="text-sm">No signals match this filter.</p>
              </div>
            ) : (
              visible.map((s) => (
                <SignalCard
                  key={s.id}
                  signal={s}
                  now={now}
                  onAdvance={advance}
                  isNew={s.id === newestId}
                />
              ))
            )}
          </div>
        </section>

        <MetricsSidebar metrics={metrics} />
      </main>
    </div>
  )
}
