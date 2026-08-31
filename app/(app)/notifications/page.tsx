import { getSessionUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getNotifications } from "@/lib/data/notifications"
import { PageHeader } from "@/components/common/page-header"
import { NotificationCenter } from "@/components/notifications/notification-center"

export default async function NotificationsPage() {
  const user = await getSessionUser()
  const supabase = await createClient()
  const notifications = user ? await getNotifications(supabase, user.id) : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Everything that needs your attention, with read status."
      />
      <NotificationCenter initial={notifications} />
    </div>
  )
}
