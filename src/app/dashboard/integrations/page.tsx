import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your calendar and video conferencing tools.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Connected apps</CardTitle>
          <CardDescription>No integrations connected yet.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
