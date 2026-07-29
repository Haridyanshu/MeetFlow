import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AvailabilityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your weekly availability for meetings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>Configure your available time slots.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
