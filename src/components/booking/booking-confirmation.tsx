import { CalendarIcon, VideoIcon } from "lucide-react"
import { formatInTimeZone } from "date-fns-tz"
import { resolveTimeZone } from "@/lib/date"

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
  timezone: string
}

function formatTime(iso: Date | string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), resolveTimeZone(timeZone), "HH:mm")
}

function formatDate(iso: Date | string, timeZone: string): string {
  return formatInTimeZone(new Date(iso), resolveTimeZone(timeZone), "EEEE, MMMM d, yyyy")
}

export type { BookingConfirmationProps }

export function BookingConfirmation({
  booking,
  eventType,
  timezone,
}: BookingConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      {/* Success icon */}
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-brand/20">
        <CheckIcon className="size-7" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-heading font-medium">
          Booking confirmed!
        </h2>
        <p className="text-sm text-muted-foreground">
          You are scheduled for {eventType.title} ({eventType.duration} min)
        </p>
      </div>

      {/* Details card */}
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-5 text-left">
        <div className="flex items-start gap-3">
          <CalendarIcon className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {formatDate(booking.startTime, timezone)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatTime(booking.startTime, timezone)} &ndash;{" "}
              {formatTime(booking.endTime, timezone)}
            </p>
          </div>
        </div>

        {booking.meetingUrl && (
          <>
            <div className="border-t border-border/50" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <VideoIcon className="size-4 shrink-0 text-brand" />
                <span className="font-medium text-foreground">Google Meet</span>
              </div>
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand/20 bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand transition-all duration-150 hover:bg-brand/20"
              >
                <VideoIcon className="size-3.5" />
                Join Google Meet
              </a>
            </div>
          </>
        )}

        <div className="border-t border-border/50" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MailIcon className="size-4 shrink-0" />
          <p>
            Confirmation sent to{" "}
            <span className="font-medium text-foreground">
              {booking.guestEmail}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4 12 13 2 4" />
    </svg>
  )
}
