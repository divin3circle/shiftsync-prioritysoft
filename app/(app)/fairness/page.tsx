import { createClient } from "@/lib/supabase/server"
import { getStaffWeekMetrics } from "@/lib/data/staff-metrics"
import { PageHeader } from "@/components/common/page-header"
import { FairnessView } from "@/components/fairness/fairness-view"

export default async function FairnessPage() {
  const supabase = await createClient()
  const metrics = (await getStaffWeekMetrics(supabase)).sort(
    (a, b) => b.premiumShifts - a.premiumShifts,
  )

  const working = metrics.filter((row) => row.hours > 0)
  const premiums = working.map((row) => row.premiumShifts)
  const spread = premiums.length > 0 ? Math.max(...premiums) - Math.min(...premiums) : 0
  const withoutPremium = working.filter((row) => row.premiumShifts === 0).length

  const summary = {
    period: "This week",
    score: spread <= 1 ? "Balanced" : "Uneven",
    detail:
      withoutPremium > 0
        ? `${withoutPremium} of ${working.length} scheduled staff have no premium shift this week. The busiest and quietest differ by ${spread} premium shifts.`
        : `Premium shifts are spread within ${spread} shift of each other across the team.`,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fairness"
        description="How evenly hours and premium shifts are shared across the team."
      />
      <FairnessView rows={metrics} summary={summary} />
    </div>
  )
}
