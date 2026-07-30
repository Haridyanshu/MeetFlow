"use client"

import { useTransition, useCallback } from "react"

import { toggleAvailabilityInterval } from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { WeeklySchedule } from "@/components/availability/weekly-schedule"
import { DateOverridesSection } from "@/components/availability/date-overrides-section"

interface IntervalProps {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

interface DateOverrideProps {
  id: string
  date: Date
  isAvailable: boolean
  startTime: string | null
  endTime: string | null
}

interface AvailabilityPageClientProps {
  intervals: IntervalProps[]
  dateOverrides: DateOverrideProps[]
}

export function AvailabilityPageClient({
  intervals,
  dateOverrides,
}: AvailabilityPageClientProps) {
  const [, startTransition] = useTransition()

  const handleToggleEnabled = useCallback(
    (id: string, enabled: boolean) => {
      startTransition(async () => {
        await toggleAvailabilityInterval(id, enabled)
        toast.add({
          title: enabled ? "Time slot enabled" : "Time slot disabled",
          type: "success",
        })
      })
    },
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Weekly schedule */}
      <WeeklySchedule
        intervals={intervals}
        onToggleEnabled={handleToggleEnabled}
      />

      {/* Date overrides */}
      <DateOverridesSection dateOverrides={dateOverrides} />
    </div>
  )
}
