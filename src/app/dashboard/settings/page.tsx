import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  })

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-heading font-medium">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <p className="text-sm text-muted-foreground">Could not load user data.</p>
      </div>
    )
  }

  return <SettingsClient user={user} />
}
