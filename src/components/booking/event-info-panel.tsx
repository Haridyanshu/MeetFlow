import { ClockIcon, MapPinIcon, CalendarIcon } from "lucide-react"

interface EventInfoPanelProps {
  eventType: {
    title: string
    description: string | null
    duration: number
    location: string | null
  }
  host: {
    name: string | null
    email: string
    image: string | null
  }
  selectedSlot: { startTime: string; endTime: string } | null
  step: string
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function EventInfoPanel({
  eventType,
  host,
  selectedSlot,
  step,
}: EventInfoPanelProps) {
  return (
    <aside className="border-border/50 flex flex-col gap-6 border-b bg-muted/30 p-6 md:border-b-0 md:border-r">
      <div className="flex flex-col gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {host.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {host.name ?? host.email}
          </p>
          <h1 className="mt-1 text-xl font-heading font-medium">
            {eventType.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="size-4" />
          {eventType.duration} minutes
        </span>
        {eventType.location && (
          <span className="inline-flex items-center gap-2">
            <MapPinIcon className="size-4" />
            {eventType.location}
          </span>
        )}
        {selectedSlot && step === "confirmation" && (
          <span className="inline-flex items-center gap-2">
            <CalendarIcon className="size-4" />
            {formatDate(selectedSlot.startTime)} at{" "}
            {formatTime(selectedSlot.startTime)}
          </span>
        )}
      </div>

      {eventType.description && (
        <p className="text-sm text-muted-foreground">
          {eventType.description}
        </p>
      )}
    </aside>
  )
}
