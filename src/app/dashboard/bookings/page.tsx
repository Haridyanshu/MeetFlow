import { auth } from "@/lib/auth"
import { getBookingsByUserId } from "@/lib/queries/bookings"
import { getUserTimeZone } from "@/lib/server/timezone"
import { BookingsPageClient } from "@/components/bookings/bookings-page-client"

export default async function BookingsPage() {
  const session = await auth()
  const [bookings, timezone] = await Promise.all([
    getBookingsByUserId(session!.user.id),
    getUserTimeZone(session!.user.id),
  ])
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your scheduled meetings.
        </p>
      </div>
      <BookingsPageClient bookings={bookings} timezone={timezone} />
    </div>
  )
}
