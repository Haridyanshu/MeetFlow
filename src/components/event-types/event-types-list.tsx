"use client"

import { CalendarPlusIcon } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { EventTypeCard } from "@/components/event-types/event-type-card"

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
  minimumNotice: number
  maximumAdvanceDays: number
  maximumBookingsPerDay: number
  maximumBookingsPerWeek: number
  schedulingType: string
  teamId: string | null
  isPaid: boolean
  price: number | null
  currency: string | null
}

interface TeamOption {
  id: string
  name: string
}

export function EventTypesList({ eventTypes, teams }: { eventTypes: EventType[]; teams?: TeamOption[] }) {
  if (eventTypes.length === 0) {
    return (
      <EmptyState
        icon={<CalendarPlusIcon />}
        title="No event types yet"
        description="Create your first event type to start scheduling meetings."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {eventTypes.length} event type{eventTypes.length !== 1 ? "s" : ""}
      </p>
      {eventTypes.map((eventType) => (
        <EventTypeCard key={eventType.id} eventType={eventType} teams={teams} />
      ))}
    </div>
  )
}
