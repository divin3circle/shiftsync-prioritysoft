import * as React from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

// Re-fetch server data whenever one of the given tables changes, so open
// screens stay in sync with what other people are doing.
export function useRealtimeRefresh(tables: string[], channelName: string) {
  const router = useRouter()
  const key = tables.join(",")
  // Keep the channel name unique per hook instance so two consumers never try
  // to share (and clash on) the same channel.
  const instanceId = React.useId()

  React.useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`${channelName}-${instanceId}`)

    for (const table of key.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        router.refresh()
      })
    }

    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [key, channelName, instanceId, router])
}
