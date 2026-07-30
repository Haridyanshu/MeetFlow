import { CircleCheckIcon, CalendarIcon, VideoIcon } from "lucide-react"

interface BookingConfirmationProps {
  booking: {
    id: string
    startTime: Date | string
    endTime: Date | string
    guestName: string
    guestEmail: string
    meetingUrl?: string | null
  }
  eventType: {
    title: string
    duration: number
  }
}

function formatTime(iso: Date | string): string {
  const d = new Date(iso)
  const h = d.getUTCHours().toString().padStart(2, "0")
  const m = d.getUTCMinutes().toString().padStart(2, "0")
  return `${h}:${m}`
}

function formatDate(iso: Date | string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export type { BookingConfirmationProps }

export function BookingConfirmation({
  booking,
  eventType,
}: BookingConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <CircleCheckIcon className="size-7" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-heading font-medium">
          Booking confirmed!
        </h2>
        <p className="text-sm text-muted-foreground">
          You are scheduled for {eventType.title} ({eventType.duration} min)
        </p>
      </div>

        <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-4 text-left">
          <div className="flex items-center gap-3">
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {formatDate(booking.startTime)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(booking.startTime)} &ndash;{" "}
                {formatTime(booking.endTime)}
              </p>
            </div>
          </div>
          {booking.meetingUrl && (
            <div className="flex flex-col gap-2 border-t pt-3">
              <div className="flex items-center gap-2 text-sm">
                <VideoIcon className="size-4 shrink-0 text-emerald-600" />
                <span className="font-medium text-foreground">Google Meet</span>
              </div>
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/80 h-7 gap-1 px-2.5 w-full"
              >
                <VideoIcon className="size-3.5" />
                Join Google Meet
              </a>
            </div>
          )}
          <div className="border-t pt-3 text-sm text-muted-foreground">
            <p>
              A confirmation has been sent to{" "}
              <span className="font-medium text-foreground">
                {booking.guestEmail}
              </span>
            </p>
          </div>
        </div>
    </div>
  )
}
