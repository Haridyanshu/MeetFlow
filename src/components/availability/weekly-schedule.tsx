"use client"

import { useState } from "react"

import { DayCard } from "@/components/availability/day-card"
import { IntervalDialog } from "@/components/availability/interval-dialog"
import { CopyScheduleDialog } from "@/components/availability/copy-schedule-dialog"

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface Interval {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

interface WeeklyScheduleProps {
  intervals: Interval[]
}

export function WeeklySchedule({ intervals }: WeeklyScheduleProps) {
  const [intervalDialogOpen, setIntervalDialogOpen] = useState(false)
  const [intervalMode, setIntervalMode] = useState<"create" | "edit">("create")
  const [intervalDay, setIntervalDay] = useState(1)
  const [intervalDefaults, setIntervalDefaults] = useState<
    | { id?: string; startTime?: string; endTime?: string; isEnabled?: boolean }
    | undefined
  >()

  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [copySourceDay, setCopySourceDay] = useState(1)

  const intervalsByDay = intervals.reduce<Record<number, Interval[]>>(
    (acc, interval) => {
      if (!acc[interval.dayOfWeek]) acc[interval.dayOfWeek] = []
      acc[interval.dayOfWeek].push(interval)
      return acc
    },
    {}
  )

  function handleAdd(dayOfWeek: number) {
    setIntervalMode("create")
    setIntervalDay(dayOfWeek)
    setIntervalDefaults(undefined)
    setIntervalDialogOpen(true)
  }

  function handleEdit(interval: Interval) {
    setIntervalMode("edit")
    setIntervalDay(interval.dayOfWeek)
    setIntervalDefaults({
      id: interval.id,
      startTime: interval.startTime,
      endTime: interval.endTime,
      isEnabled: interval.isEnabled,
    })
    setIntervalDialogOpen(true)
  }

  function handleCopy(dayOfWeek: number) {
    setCopySourceDay(dayOfWeek)
    setCopyDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-heading font-medium">Weekly schedule</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAY_ORDER.map((day) => (
          <DayCard
            key={day}
            dayOfWeek={day}
            dayName={DAY_NAMES[day]}
            intervals={intervalsByDay[day] ?? []}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onCopy={handleCopy}
          />
        ))}
      </div>
      <IntervalDialog
        mode={intervalMode}
        dayOfWeek={intervalDay}
        defaultValues={intervalDefaults}
        open={intervalDialogOpen}
        onOpenChange={setIntervalDialogOpen}
      />
      <CopyScheduleDialog
        sourceDayOfWeek={copySourceDay}
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
      />
    </div>
  )
}
