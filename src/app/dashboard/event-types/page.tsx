import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function EventTypesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Event Types</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage your event types for scheduling.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your event types</CardTitle>
          <CardDescription>No event types created yet.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
