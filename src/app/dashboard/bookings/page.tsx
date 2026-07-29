import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function BookingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your scheduled meetings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming bookings</CardTitle>
          <CardDescription>No bookings yet.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
