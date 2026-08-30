import { PageHeader } from "@/components/common/page-header"
import { ScheduleBoard } from "@/components/schedule/schedule-board"

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Schedule" description="Build, assign, and publish the weekly schedule." />
      <ScheduleBoard />
    </div>
  )
}
