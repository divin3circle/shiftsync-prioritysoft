"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-lg font-medium">Something went wrong</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        We could not load this page. This is usually temporary.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
