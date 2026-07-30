"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { signIn } from "next-auth/react"
import { Loader2Icon } from "lucide-react"

import { disconnectGoogleCalendar } from "@/lib/actions/integrations"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface GoogleCalendarCardProps {
  connected: boolean
}

export function GoogleCalendarCard({ connected }: GoogleCalendarCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConnect() {
    signIn("google", { callbackUrl: "/dashboard/integrations" })
  }

  function handleDisconnect() {
    startTransition(async () => {
      await disconnectGoogleCalendar()
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Calendar</CardTitle>
        <CardDescription>
          {connected
            ? "Your Google Calendar is connected. New bookings will be added as events."
            : "Connect your Google Calendar to automatically add bookings as events."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {connected ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isPending}
            >
              {isPending && <Loader2Icon className="size-4 animate-spin" />}
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect}>
              Connect Google Calendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
