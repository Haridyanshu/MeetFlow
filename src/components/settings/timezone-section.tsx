"use client"

import { useTransition } from "react"
import { Loader2Icon, GlobeIcon } from "lucide-react"

import { updateUserTimezone } from "@/lib/actions/settings"
import { toast } from "@/components/ui/toast"
import { Card, CardContent } from "@/components/ui/card"
import { COMMON_TIMEZONES } from "@/lib/date"

interface TimezoneSectionProps {
  user: {
    id: string
    timezone: string
  }
}

export function TimezoneSection({ user }: TimezoneSectionProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(timezone: string) {
    startTransition(async () => {
      const result = await updateUserTimezone(timezone)
      if (result?.ok) {
        toast.add({
          title: "Timezone updated",
          description: "All dates and times now use your selected timezone.",
          type: "success",
        })
      } else {
        toast.add({ title: "Failed to update timezone", type: "error" })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Timezone</h2>
        <p className="text-sm text-muted-foreground">
          Set the timezone used for availability, bookings, and analytics.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <GlobeIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Time zone</p>
              <p className="text-xs text-muted-foreground">
                Current: <span className="font-medium text-foreground">{user.timezone}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="timezone" className="text-sm font-medium">
              Preferred time zone
            </label>
            <div className="flex max-w-sm items-center gap-2">
              <select
                id="timezone"
                value={user.timezone}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isPending}
                className="h-9 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-background text-foreground">
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              {isPending && <Loader2Icon className="size-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Bookings from guests will use this timezone as the default. Changing it here updates
              how availability is generated and how existing bookings are displayed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
