import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getUserTimeZone } from "@/lib/server/timezone"
import { GoogleCalendarCard } from "@/components/integrations/google-calendar-card"

export default async function IntegrationsPage() {
  const session = await auth()

  let connected = false
  let expiresAt: number | null = null
  let lastSync: Date | null = null
  let timezone = "Asia/Kolkata"

  if (session?.user?.id) {
    const [account, latestEvent, userTz] = await Promise.all([
      prisma.account.findFirst({
        where: { userId: session.user.id, provider: "google" },
        select: { access_token: true, refresh_token: true, scope: true, expires_at: true },
      }),
      prisma.calendarEvent.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      getUserTimeZone(session.user.id),
    ])

    timezone = userTz

    connected =
      !!account?.access_token &&
      (account.scope?.includes("calendar.events") ?? false)

    expiresAt = account?.expires_at ?? null
    lastSync = latestEvent?.createdAt ?? null
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your calendar and video conferencing tools.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GoogleCalendarCard
          connected={connected}
          expiresAt={expiresAt}
          lastSync={lastSync}
          timezone={timezone}
        />
      </div>
    </div>
  )
}
