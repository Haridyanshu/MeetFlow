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

function ErrorState({
  error,
}: {
  error: string | undefined
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center">
        {error === "invalid" && (
          <>
            <h1 className="text-xl font-heading font-medium text-destructive">
              Invalid Link
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This booking link is invalid or has expired.
            </p>
          </>
        )}
        {error === "expired" && (
          <>
            <h1 className="text-xl font-heading font-medium text-destructive">
              Link Expired
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This booking management link has expired. Please contact the host
              for assistance.
            </p>
          </>
        )}
        {error === "cancelled" && (
          <>
            <h1 className="text-xl font-heading font-medium text-muted-foreground">
              Booking Cancelled
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This booking has been cancelled.
            </p>
          </>
        )}
        {error === "completed" && (
          <>
            <h1 className="text-xl font-heading font-medium text-muted-foreground">
              Booking Completed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This booking has already taken place.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
