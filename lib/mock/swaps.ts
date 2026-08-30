export type SwapStatus = "pending_target" | "pending_manager" | "open"

export type SwapRequest = {
  id: string
  type: "swap" | "drop"
  requester: string
  target?: string
  location: string
  when: string
  role: string
  status: SwapStatus
  note: string
  expiresIn?: string
}

export const swapRequests: SwapRequest[] = [
  {
    id: "sw1",
    type: "swap",
    requester: "Sofia Alvarez",
    target: "Maria Santos",
    location: "Harbor Grill",
    when: "Fri 4:00p - 11:00p PT",
    role: "Bartender",
    status: "pending_manager",
    note: "Maria accepted. Waiting on manager approval.",
  },
  {
    id: "sw2",
    type: "drop",
    requester: "Noah Kim",
    location: "Harbor Grill",
    when: "Wed 11:00a - 7:00p PT",
    role: "Line cook",
    status: "pending_manager",
    note: "Liam Walsh offered to cover.",
  },
  {
    id: "sw3",
    type: "swap",
    requester: "James O'Brien",
    target: "Chloe Nguyen",
    location: "Lighthouse",
    when: "Fri 5:00p - 1:00a ET",
    role: "Bartender",
    status: "pending_target",
    note: "Waiting on Chloe to accept.",
  },
  {
    id: "sw4",
    type: "swap",
    requester: "Maria Santos",
    target: "Sofia Alvarez",
    location: "Harbor Grill",
    when: "Sun 11:00a - 5:00p PT",
    role: "Server",
    status: "pending_target",
    note: "Maria wants to swap her Sunday shift with you.",
  },
  {
    id: "dr1",
    type: "drop",
    requester: "Priya Shah",
    location: "Pier Seven",
    when: "Sat 5:00p - 11:00p PT",
    role: "Server",
    status: "open",
    note: "Up for grabs.",
    expiresIn: "expires in 20h",
  },
]
