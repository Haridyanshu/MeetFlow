import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleCalendarCard } from "@/components/integrations/google-calendar-card"

export default async function IntegrationsPage() {
  const session = await auth()

  let connected = false
  if (session?.user?.id) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { access_token: true, refresh_token: true, scope: true },
    })

    connected =
      !!account?.access_token &&
      (account.scope?.includes("calendar.events") ?? false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your calendar and video conferencing tools.
        </p>
      </div>
      <GoogleCalendarCard connected={connected} />
    </div>
  )
}
