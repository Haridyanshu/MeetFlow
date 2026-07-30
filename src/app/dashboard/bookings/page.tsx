import { auth } from "@/lib/auth"
import { getBookingsByUserId } from "@/lib/queries/bookings"
import { BookingsPageClient } from "@/components/bookings/bookings-page-client"

export default async function BookingsPage() {
  const session = await auth()
  const bookings = await getBookingsByUserId(session!.user.id)
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your scheduled meetings.
        </p>
      </div>
      <BookingsPageClient bookings={bookings} />
    </div>
  )
}
