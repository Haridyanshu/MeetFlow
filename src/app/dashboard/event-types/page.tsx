import { auth } from "@/lib/auth"
import { getEventTypesByUserId } from "@/lib/queries/event-types"
import { getTeamsByOwner } from "@/lib/queries/teams"
import { EventTypesList } from "@/components/event-types/event-types-list"
import { CreateEventTypeButton } from "@/components/event-types/event-type-form"

export default async function EventTypesPage() {
  const session = await auth()
  const [eventTypes, teams] = await Promise.all([
    getEventTypesByUserId(session!.user.id),
    getTeamsByOwner(session!.user.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-medium">Event Types</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your event types for scheduling.
          </p>
        </div>
        <CreateEventTypeButton teams={teams} />
      </div>
      <EventTypesList eventTypes={eventTypes} teams={teams} />
    </div>
  )
}
