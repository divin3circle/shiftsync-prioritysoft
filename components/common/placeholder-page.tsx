import type { IconSvgElement } from "@hugeicons/react"

import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"

type PlaceholderPageProps = {
  title: string
  description: string
  icon: IconSvgElement
  note: string
}

export function PlaceholderPage({ title, description, icon, note }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <EmptyState icon={icon} title="In progress" description={note} />
    </div>
  )
}
