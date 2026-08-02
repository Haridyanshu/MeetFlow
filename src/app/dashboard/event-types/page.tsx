import { auth } from "@/lib/auth"
import { getEventTypesByUserId } from "@/lib/queries/event-types"
import { getTeamsByOwner } from "@/lib/queries/teams"
import { getUserTimeZone } from "@/lib/server/timezone"
import { headers } from "next/headers"
import { EventTypesList } from "@/components/event-types/event-types-list"

export default async function EventTypesPage() {
  const session = await auth()
  const [eventTypes, teams, timezone] = await Promise.all([
    getEventTypesByUserId(session!.user.id),
    getTeamsByOwner(session!.user.id),
    getUserTimeZone(session!.user.id),
  ])

  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const protocol = process.env.AUTH_URL?.startsWith("https") ? "https" : "http"
  const baseUrl = `${protocol}://${host}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Event Types</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage your event types for scheduling.
        </p>
      </div>
      <EventTypesList eventTypes={eventTypes} teams={teams} baseUrl={baseUrl} timezone={timezone} />
    </div>
  )
}
