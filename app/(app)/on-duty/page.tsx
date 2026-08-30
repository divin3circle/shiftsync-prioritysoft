import { Clock01Icon } from "@hugeicons/core-free-icons"

import { PlaceholderPage } from "@/components/common/placeholder-page"

export default function OnDutyPage() {
  return (
    <PlaceholderPage
      title="On duty"
      description="Who is clocked in right now, per location."
      icon={Clock01Icon}
      note="The live on-duty board is being built."
    />
  )
}
