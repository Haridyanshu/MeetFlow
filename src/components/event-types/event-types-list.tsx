"use client"

import { CalendarPlusIcon } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { EventTypeCard } from "@/components/event-types/event-type-card"
import { CreateEventTypeButton } from "@/components/event-types/event-type-form"

interface EventType {
  id: string
  title: string
  slug: string
  description: string | null
  duration: number
  color: string | null
  location: string | null
  isActive: boolean
  requiresConfirmation: boolean
  bufferBefore: number
  bufferAfter: number
}

export function EventTypesList({ eventTypes }: { eventTypes: EventType[] }) {
  if (eventTypes.length === 0) {
    return (
      <EmptyState
        icon={<CalendarPlusIcon />}
        title="No event types yet"
        description="Create your first event type to start scheduling meetings."
        action={<CreateEventTypeButton />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {eventTypes.length} event type{eventTypes.length !== 1 ? "s" : ""}
        </p>
        <CreateEventTypeButton />
      </div>
      {eventTypes.map((eventType) => (
        <EventTypeCard key={eventType.id} eventType={eventType} />
      ))}
    </div>
  )
}
