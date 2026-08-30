"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"

import { useRole } from "@/components/role-provider"
import { swapRequests, type SwapRequest, type SwapStatus } from "@/lib/mock/swaps"
import { demoUsers } from "@/lib/mock/users"
import { SectionCard } from "@/components/common/section-card"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RequestRow } from "@/components/swaps/request-row"

const staffName = demoUsers.staff.name

const statusLabel: Record<SwapStatus, string> = {
  pending_target: "Awaiting staff",
  pending_manager: "Awaiting manager",
  open: "Open",
}

export function SwapsView() {
  const { role } = useRole()
  const [requests, setRequests] = React.useState<SwapRequest[]>(swapRequests)

  function resolve(id: string, message: string) {
    setRequests((previous) => previous.filter((request) => request.id !== id))
    toast.success(message)
  }

  if (role === "staff") {
    const incoming = requests.filter(
      (request) => request.target === staffName && request.status === "pending_target",
    )
    const mine = requests.filter((request) => request.requester === staffName)
    const upForGrabs = requests.filter((request) => request.status === "open")

    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          You have {mine.length + incoming.length} of 3 pending requests.
        </p>

        <SectionCard title="Incoming swap offers">
          {incoming.length > 0 ? (
            <ul className="flex flex-col">
              {incoming.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolve(request.id, "Swap declined")}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => resolve(request.id, "Swap accepted, sent for approval")}
                      >
                        Accept
                      </Button>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyState icon={ArrowDataTransferHorizontalIcon} title="No incoming offers" />
          )}
        </SectionCard>

        <SectionCard title="Your requests">
          {mine.length > 0 ? (
            <ul className="flex flex-col">
              {mine.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  actions={
                    <>
                      <Badge variant="outline">{statusLabel[request.status]}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolve(request.id, "Request cancelled")}
                      >
                        Cancel
                      </Button>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyState icon={ArrowDataTransferHorizontalIcon} title="No requests yet" />
          )}
        </SectionCard>

        <SectionCard title="Up for grabs">
          {upForGrabs.length > 0 ? (
            <ul className="flex flex-col">
              {upForGrabs.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  actions={
                    <Button
                      size="sm"
                      onClick={() => resolve(request.id, "Shift claimed, sent for approval")}
                    >
                      Claim
                    </Button>
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyState icon={ArrowDataTransferHorizontalIcon} title="Nothing available" />
          )}
        </SectionCard>
      </div>
    )
  }

  const awaiting = requests.filter((request) => request.status === "pending_manager")
  const inProgress = requests.filter((request) => request.status !== "pending_manager")

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Awaiting your approval">
        {awaiting.length > 0 ? (
          <ul className="flex flex-col">
            {awaiting.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolve(request.id, "Change denied")}
                    >
                      Deny
                    </Button>
                    <Button size="sm" onClick={() => resolve(request.id, "Change approved")}>
                      Approve
                    </Button>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ArrowDataTransferHorizontalIcon}
            title="Nothing to approve"
            description="Swap and drop requests needing sign-off will appear here."
          />
        )}
      </SectionCard>

      <SectionCard title="In progress">
        {inProgress.length > 0 ? (
          <ul className="flex flex-col">
            {inProgress.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                actions={<Badge variant="outline">{statusLabel[request.status]}</Badge>}
              />
            ))}
          </ul>
        ) : (
          <EmptyState icon={ArrowDataTransferHorizontalIcon} title="Nothing in progress" />
        )}
      </SectionCard>
    </div>
  )
}
