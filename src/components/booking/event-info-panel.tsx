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
  const initials = (host.name ?? host.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="flex flex-col gap-8 border-border/50 border-b bg-card/30 p-6 md:border-b-0 md:border-r md:p-8 lg:p-10">
      {/* Host profile */}
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand text-sm font-semibold ring-1 ring-brand/20">
          {initials}
        </div>
        <div className="min-w-0 pt-1">
          <p className="text-xs tracking-wider text-muted-foreground uppercase">
            {host.name ?? host.email}
          </p>
          <h1 className="mt-1 text-xl font-heading font-medium text-foreground">
            {eventType.title}
          </h1>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2.5">
          <ClockIcon className="size-4 shrink-0 text-foreground/40" />
          {eventType.duration} minutes
        </span>
        {eventType.location && (
          <span className="inline-flex items-center gap-2.5">
            <MapPinIcon className="size-4 shrink-0 text-foreground/40" />
            {eventType.location}
          </span>
        )}
        {selectedSlot && step === "confirmation" && (
          <span className="inline-flex items-center gap-2.5">
            <CalendarIcon className="size-4 shrink-0 text-foreground/40" />
            {formatDate(selectedSlot.startTime)} at{" "}
            {formatTime(selectedSlot.startTime)}
          </span>
        )}
      </div>

      {/* Description */}
      {eventType.description && (
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {eventType.description}
          </p>
        </div>
      )}

      {/* Decorative bottom spacer */}
      <div className="hidden flex-1 md:block" />
    </aside>
  )
}
