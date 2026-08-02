import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUserTimeZone } from "@/lib/server/timezone"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { Toaster } from "@/components/ui/toast"
import { TimezoneDetector } from "@/components/dashboard/timezone-detector"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const timezone = await getUserTimeZone(session.user.id)

  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-brand/4 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full bg-brand/3 blur-3xl" />
      </div>
      <Sidebar />
      <div className="relative flex flex-1 flex-col">
        <TopNav />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
      <TimezoneDetector storedTimezone={timezone} />
    </div>
  )
}
