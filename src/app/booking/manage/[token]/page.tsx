import { getBookingByToken } from "@/lib/actions/booking-management"
import { ManageBookingClient } from "@/components/booking/manage-booking-client"
import type { BookingData } from "@/components/booking/manage-booking-client"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ManageBookingPage({ params }: PageProps) {
  const { token } = await params
  const result = await getBookingByToken(token)

  if (!result.ok) {
    return <ErrorState error={result.error} />
  }

  const b = result.booking as unknown as BookingData

  return <ManageBookingClient booking={b} token={token} />
}

function ErrorState({ error }: { error: string | undefined }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border bg-card p-8 text-center">
          {error === "invalid" && (
            <>
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircleIcon />
              </div>
              <h1 className="text-lg font-heading font-medium">Invalid Link</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This booking link is invalid or has expired.
              </p>
            </>
          )}
          {error === "expired" && (
            <>
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-warning/10 text-warning">
                <ClockIcon />
              </div>
              <h1 className="text-lg font-heading font-medium">Link Expired</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This booking management link has expired. Please contact the host
                for assistance.
              </p>
            </>
          )}
          {error === "cancelled" && (
            <>
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <XCircleIcon />
              </div>
              <h1 className="text-lg font-heading font-medium">Booking Cancelled</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This booking has been cancelled.
              </p>
            </>
          )}
          {error === "completed" && (
            <>
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CheckCircleIcon />
              </div>
              <h1 className="text-lg font-heading font-medium">Booking Completed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This booking has already taken place.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function XCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
