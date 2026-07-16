export type Priority = 1 | 2 | 3 | 4

export type SignalStatus = "new" | "acknowledged" | "dispatched" | "resolved"

export type SignalCategory =
  | "Medical"
  | "Trapped / Structural"
  | "Flooding"
  | "Fire"
  | "Missing Person"
  | "Supplies / Water"
  | "Power / Comms"
  | "General Query"

export interface Signal {
  id: string
  priority: Priority
  category: SignalCategory
  message: string
  sector: string
  node: string
  lat: number
  lng: number
  status: SignalStatus
  confidence: number // NLP model confidence 0-1
  duplicates: number // aggregated redundant broadcasts
  receivedAt: number // epoch ms
}

interface Template {
  priority: Priority
  category: SignalCategory
  messages: string[]
}

const TEMPLATES: Template[] = [
  {
    priority: 1,
    category: "Medical",
    messages: [
      "Cardiac arrest, elderly male unresponsive, need medic NOW",
      "Severe bleeding, child injured by debris, cannot stop it",
      "Diabetic collapse, no insulin for 2 days, unconscious",
      "Woman in labor, complications, no transport available",
    ],
  },
  {
    priority: 1,
    category: "Trapped / Structural",
    messages: [
      "Family of 4 trapped under collapsed roof, water rising",
      "Two people pinned in basement, structure unstable",
      "Trapped on rooftop, floodwater at second floor, 5 adults",
    ],
  },
  {
    priority: 1,
    category: "Fire",
    messages: [
      "Building fire spreading, residents still inside 3rd floor",
      "Gas leak ignited, multiple casualties, need suppression",
    ],
  },
  {
    priority: 2,
    category: "Flooding",
    messages: [
      "Water entering ground floor, 6 people moving to attic",
      "Road washed out, ambulance cannot reach elderly couple",
      "Rising water, need evacuation within the hour",
    ],
  },
  {
    priority: 2,
    category: "Missing Person",
    messages: [
      "Child separated from family near market district 2h ago",
      "Elderly man with dementia wandered from shelter",
    ],
  },
  {
    priority: 3,
    category: "Supplies / Water",
    messages: [
      "Shelter out of clean water, 40 people, no immediate danger",
      "Need baby formula and blankets at community hall",
      "Food supplies low at sector shelter, stable for now",
    ],
  },
  {
    priority: 3,
    category: "Power / Comms",
    messages: [
      "Backup generator failing, medical fridge at risk",
      "No cell signal in area, requesting mesh relay node",
    ],
  },
  {
    priority: 4,
    category: "General Query",
    messages: [
      "When will the main bridge reopen?",
      "Is the eastern evacuation route still active?",
      "Where can I charge devices safely?",
      "Requesting status update on relief timeline",
    ],
  },
]

const SECTORS = [
  "Riverside East",
  "Old Town",
  "Harbor District",
  "North Ridge",
  "Millbrook",
  "Sector 7 — Lowlands",
  "Cedar Flats",
  "West Quay",
]

const NODES = ["MSH-01", "MSH-02", "MSH-04", "RLY-09", "RLY-12", "NODE-A3", "NODE-B7", "GATE-05"]

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

let counter = 1

export function createSignal(now = Date.now()): Signal {
  const t = rand(TEMPLATES)
  const priorityWeight = Math.random()
  // Bias so P1 stays rare-ish but present
  let template = t
  if (priorityWeight > 0.82) {
    template = rand(TEMPLATES.filter((x) => x.priority === 1))
  } else if (priorityWeight < 0.28) {
    template = rand(TEMPLATES.filter((x) => x.priority >= 3))
  }

  const seq = counter++
  return {
    id: `SIG-${String(seq).padStart(5, "0")}`,
    priority: template.priority,
    category: template.category,
    message: rand(template.messages),
    sector: rand(SECTORS),
    node: rand(NODES),
    lat: 34 + Math.random() * 2,
    lng: -118 - Math.random() * 2,
    status: "new",
    confidence: Math.min(0.99, 0.72 + Math.random() * 0.27),
    duplicates: Math.random() > 0.6 ? Math.floor(Math.random() * 12) : 0,
    receivedAt: now,
  }
}

export function seedSignals(count: number): Signal[] {
  const now = Date.now()
  const out: Signal[] = []
  for (let i = 0; i < count; i++) {
    const s = createSignal(now - (count - i) * 9000)
    // Give the backlog some processed states
    if (i < count - 4) {
      const roll = Math.random()
      s.status = roll > 0.66 ? "resolved" : roll > 0.4 ? "dispatched" : "acknowledged"
    }
    out.push(s)
  }
  return out.reverse()
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  1: "P1 · IMMEDIATE",
  2: "P2 · URGENT",
  3: "P3 · ELEVATED",
  4: "P4 · ROUTINE",
}

export const STATUS_LABEL: Record<SignalStatus, string> = {
  new: "New",
  acknowledged: "Acknowledged",
  dispatched: "Dispatched",
  resolved: "Resolved",
}
