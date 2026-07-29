"use client"

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
  return (
    <div className="flex flex-col gap-8">
      <WeeklySchedule intervals={intervals} />
      <DateOverridesSection dateOverrides={dateOverrides} />
    </div>
  )
}
