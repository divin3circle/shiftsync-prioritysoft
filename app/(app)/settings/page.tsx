import { PageHeader } from "@/components/common/page-header"
import { SettingsForm } from "@/components/settings/settings-form"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Profile and notification preferences." />
      <SettingsForm />
    </div>
  )
}
