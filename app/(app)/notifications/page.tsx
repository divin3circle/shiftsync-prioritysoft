import { PageHeader } from "@/components/common/page-header"
import { NotificationCenter } from "@/components/notifications/notification-center"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Everything that needs your attention, with read status."
      />
      <NotificationCenter />
    </div>
  )
}
