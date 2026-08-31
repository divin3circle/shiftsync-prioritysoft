import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon, Tag01Icon } from "@hugeicons/core-free-icons"

import type { SwapRequestView } from "@/lib/data/swaps"

function requestTitle(request: SwapRequestView) {
  if (request.type === "swap" && request.target) {
    return `${request.requester} and ${request.target}`
  }
  return `${request.requester} dropped a shift`
}

export function RequestRow({
  request,
  actions,
}: {
  request: SwapRequestView
  actions?: ReactNode
}) {
  return (
    <li className="border-border/60 flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <div className="flex gap-3">
        <HugeiconsIcon
          icon={request.type === "swap" ? ArrowDataTransferHorizontalIcon : Tag01Icon}
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{requestTitle(request)}</span>
          <span className="text-muted-foreground text-xs">
            {request.location} &middot; {request.when} &middot; {request.role}
          </span>
          {request.note ? (
            <span className="text-muted-foreground text-xs">{request.note}</span>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </li>
  )
}
