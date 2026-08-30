import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardProps = {
  title: string
  action?: ReactNode
  children: ReactNode
}

export function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm">{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
