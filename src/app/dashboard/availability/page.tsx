import { auth } from "@/lib/auth"
import { getWeeklyAvailability, getDateOverrides } from "@/lib/queries/availability"
import { AvailabilityPageClient } from "@/components/availability/availability-page-client"

export default async function AvailabilityPage() {
  const session = await auth()
  const [weeklyAvailability, dateOverrides] = await Promise.all([
    getWeeklyAvailability(session!.user.id),
    getDateOverrides(session!.user.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your weekly availability and manage date overrides.
        </p>
      </div>
      <AvailabilityPageClient
        intervals={weeklyAvailability?.intervals ?? []}
        dateOverrides={dateOverrides}
      />
    </div>
  )
}
