import { PageHeader } from "@/components/common/page-header"
import { MyShiftsList } from "@/components/my-shifts/my-shifts-list"

export default function MyShiftsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My shifts" description="Your shifts this week at Coastal Eats." />
      <MyShiftsList />
    </div>
  )
}
