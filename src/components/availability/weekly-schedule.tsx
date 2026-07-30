"use client"

import { useState, useCallback } from "react"
import { ClockIcon } from "lucide-react"

import { DayCard } from "@/components/availability/day-card"
import { IntervalDialog } from "@/components/availability/interval-dialog"
import { CopyScheduleDialog } from "@/components/availability/copy-schedule-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  onToggleEnabled: (id: string, enabled: boolean) => void
}

export function WeeklySchedule({ intervals, onToggleEnabled }: WeeklyScheduleProps) {
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
    {},
  )

  const today = new Date().getDay()

  const handleAdd = useCallback((dayOfWeek: number) => {
    setIntervalMode("create")
    setIntervalDay(dayOfWeek)
    setIntervalDefaults(undefined)
    setIntervalDialogOpen(true)
  }, [])

  const handleEdit = useCallback((interval: Interval) => {
    setIntervalMode("edit")
    setIntervalDay(interval.dayOfWeek)
    setIntervalDefaults({
      id: interval.id,
      startTime: interval.startTime,
      endTime: interval.endTime,
      isEnabled: interval.isEnabled,
    })
    setIntervalDialogOpen(true)
  }, [])

  const handleCopy = useCallback((dayOfWeek: number) => {
    setCopySourceDay(dayOfWeek)
    setCopyDialogOpen(true)
  }, [])

  const totalSlots = intervals.length
  const enabledSlots = intervals.filter((i) => i.isEnabled).length

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-brand" />
          <CardTitle>Weekly schedule</CardTitle>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span>{enabledSlots} active slot{enabledSlots !== 1 ? "s" : ""}</span>
          <span className="text-muted-foreground/40">&middot;</span>
          <span>{totalSlots} total</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAY_ORDER.map((day) => (
            <DayCard
              key={day}
              dayOfWeek={day}
              dayName={DAY_NAMES[day]}
              intervals={intervalsByDay[day] ?? []}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onCopy={handleCopy}
              onToggleEnabled={onToggleEnabled}
              isToday={day === today}
            />
          ))}
        </div>
      </CardContent>
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
    </Card>
  )
}
