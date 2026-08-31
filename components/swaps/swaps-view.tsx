"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"

import { useSession } from "@/components/role-provider"
import type { SwapRequestView, SwapStatus } from "@/lib/data/swaps"
import {
  acceptOffer,
  approveRequest,
  cancelRequest,
  declineOffer,
  denyRequest,
} from "@/app/(app)/swaps/actions"
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh"
import { SectionCard } from "@/components/common/section-card"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RequestRow } from "@/components/swaps/request-row"

const statusLabel: Record<SwapStatus, string> = {
  pending_target: "Awaiting staff",
  pending_manager: "Awaiting manager",
  open: "Open",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
}

export function SwapsView({ requests }: { requests: SwapRequestView[] }) {
  const { id, role } = useSession()
  const router = useRouter()

  useRealtimeRefresh(["swap_requests", "assignments"], "swaps")

  async function run(promise: Promise<{ ok: boolean; message?: string }>, success: string) {
    const result = await promise
    if (result.ok) {
      toast.success(success)
      router.refresh()
    } else {
      toast.error(result.message ?? "Something went wrong.")
    }
  }

  if (role === "staff") {
    const incoming = requests.filter((r) => r.targetId === id && r.status === "pending_target")
    const mine = requests.filter(
      (r) => r.requesterId === id && ["pending_target", "pending_manager", "open"].includes(r.status),
    )
    const upForGrabs = requests.filter((r) => r.status === "open" && r.requesterId !== id)

    return (
      <div className="flex flex-col gap-4">
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
                        onClick={() => run(declineOffer(request.id), "Swap declined")}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => run(acceptOffer(request.id), "Swap accepted, sent for approval")}
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
                        onClick={() => run(cancelRequest(request.id), "Request cancelled")}
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
                      onClick={() => run(acceptOffer(request.id), "Sent for approval")}
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

  const awaiting = requests.filter((r) => r.status === "pending_manager")
  const inProgress = requests.filter((r) => ["pending_target", "open"].includes(r.status))

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
                      onClick={() => run(denyRequest(request.id), "Change denied")}
                    >
                      Deny
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        run(
                          approveRequest(request.id, request.type, request.assignmentId),
                          "Change approved",
                        )
                      }
                    >
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
