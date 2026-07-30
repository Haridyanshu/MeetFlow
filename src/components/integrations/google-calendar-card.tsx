"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { signIn } from "next-auth/react"
import { CalendarIcon, CheckCircleIcon, Loader2Icon, AlertTriangleIcon, ExternalLinkIcon } from "lucide-react"

import { disconnectGoogleCalendar } from "@/lib/actions/integrations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GoogleCalendarCardProps {
  connected: boolean
  expiresAt: number | null
  lastSync: Date | null
}

function timeAgo(date: Date): string {
  const ms = Date.now() - date.getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export function GoogleCalendarCard({ connected, expiresAt, lastSync }: GoogleCalendarCardProps) {
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

  const tokenExpired = connected && expiresAt ? Date.now() > expiresAt * 1000 : false
  const health: { label: string; variant: "success" | "warning" | "destructive"; icon: React.ComponentType<{ className?: string }> } | null =
    connected
      ? tokenExpired
        ? { label: "Expired", variant: "warning", icon: AlertTriangleIcon }
        : { label: "Good", variant: "success", icon: CheckCircleIcon }
      : null

  return (
    <Card className={cn("transition-all duration-150", connected && "hover:translate-y-[-1px] hover:shadow-md")}>
      <CardContent className="flex flex-col gap-4 p-5">
        {/* Logo + title row */}
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border">
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-heading font-semibold text-foreground">Google Calendar</h3>
              {connected ? (
                <Badge variant="brand" className="px-2 py-0.5 text-[10px] font-medium gap-1">
                  <CheckCircleIcon className="size-2.5" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                  Not connected
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Sync your bookings automatically to Google Calendar events. Meetings will appear on your calendar with all the details.
            </p>
          </div>
        </div>

        {/* Status row */}
        {connected && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-muted/40 px-3.5 py-2.5 text-xs">
            {health && (
              <span className="inline-flex items-center gap-1.5">
                {health.label === "Good" ? (
                  <CheckCircleIcon className="size-3.5 text-success" />
                ) : (
                  <AlertTriangleIcon className="size-3.5 text-warning" />
                )}
                <span className="text-muted-foreground">Health:</span>
                <span className={cn("font-medium", health.variant === "success" ? "text-success" : "text-warning")}>
                  {health.label}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last sync:</span>
              <span className="font-medium text-foreground">
                {lastSync ? timeAgo(lastSync) : "Pending"}
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {connected ? (
            <>
              <Button variant="brand" size="sm" className="gap-1.5">
                <ExternalLinkIcon className="size-3.5" />
                Manage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isPending}
                className="text-muted-foreground"
              >
                {isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
                Disconnect
              </Button>
            </>
          ) : (
            <Button variant="brand" size="sm" onClick={handleConnect}>
              <ExternalLinkIcon className="size-3.5" />
              Connect Google Calendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
