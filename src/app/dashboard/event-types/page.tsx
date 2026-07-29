import { auth } from "@/lib/auth"
import { getEventTypesByUserId } from "@/lib/queries/event-types"
import { EventTypesList } from "@/components/event-types/event-types-list"
import { CreateEventTypeButton } from "@/components/event-types/event-type-form"

export default async function EventTypesPage() {
  const session = await auth()
  const eventTypes = await getEventTypesByUserId(session!.user.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-medium">Event Types</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your event types for scheduling.
          </p>
        </div>
        <div className="hidden sm:block">
          <CreateEventTypeButton />
        </div>
      </div>
      <EventTypesList eventTypes={eventTypes} />
    </div>
  )
}
