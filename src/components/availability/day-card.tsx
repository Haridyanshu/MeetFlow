"use client"

import { useTransition } from "react"
import {
  ClockIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  CopyIcon,
  ChevronDownIcon,
} from "lucide-react"

import { deleteAvailabilityInterval } from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface Interval {
  id: string
  startTime: string
  endTime: string
  isEnabled: boolean
}

interface DayCardProps {
  dayOfWeek: number
  dayName: string
  intervals: Interval[]
  onAdd: (dayOfWeek: number) => void
  onEdit: (interval: Interval & { dayOfWeek: number }) => void
  onCopy: (dayOfWeek: number) => void
  onToggleEnabled: (id: string, enabled: boolean) => void
  isToday: boolean
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatDuration(start: string, end: string): string {
  const diff = toMinutes(end) - toMinutes(start)
  if (diff >= 60) {
    const hrs = Math.floor(diff / 60)
    const mins = diff % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }
  return `${diff}m`
}

export function DayCard({
  dayOfWeek,
  dayName,
  intervals,
  onAdd,
  onEdit,
  onCopy,
  onToggleEnabled,
  isToday,
}: DayCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAvailabilityInterval(id)
      toast.add({
        title: "Time slot deleted",
        type: "success",
      })
    })
  }

  const enabledIntervals = intervals.filter((i) => i.isEnabled)
  const disabledIntervals = intervals.filter((i) => !i.isEnabled)
  const hasAny = intervals.length > 0

  return (
    <div className="flex flex-col rounded-xl border bg-card transition-all duration-150">
      {/* Day header */}
      <div className="flex items-center justify-between border-b border-border/50 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{dayName}</span>
          {isToday && (
            <Badge variant="brand" className="px-1.5 py-0 text-[10px] leading-tight font-semibold">
              Today
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {hasAny && (
            <Button variant="ghost" size="icon-xs" title="Copy schedule to other days" onClick={() => onCopy(dayOfWeek)}>
              <CopyIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Slots */}
      <div className="flex flex-col gap-1.5 p-3">
        {enabledIntervals.map((interval) => (
          <div
            key={interval.id}
            className="group flex items-center gap-2.5 rounded-lg bg-brand-soft/50 px-3 py-2 transition-all duration-150 hover:bg-brand-soft"
          >
            <Switch
              checked={interval.isEnabled}
              onChange={(v) => onToggleEnabled(interval.id, v)}
            />
            <ClockIcon className="size-3.5 shrink-0 text-brand" />
            <span className="font-mono text-sm tabular-nums text-foreground whitespace-nowrap">
              {interval.startTime}
              <span className="text-muted-foreground mx-1">&ndash;</span>
              {interval.endTime}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
              {formatDuration(interval.startTime, interval.endTime)}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <Button
                variant="ghost"
                size="icon-xs"
                title="Edit"
                onClick={() => onEdit({ ...interval, dayOfWeek })}
              >
                <PencilIcon className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                title="Delete"
                onClick={() => handleDelete(interval.id)}
                disabled={isPending}
                className="hover:text-destructive"
              >
                <Trash2Icon className="size-3" />
              </Button>
            </div>
          </div>
        ))}

        {disabledIntervals.length > 0 && (
          <details className="group mt-0.5">
            <summary className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDownIcon className="size-3 transition-transform group-open:rotate-180" />
              {disabledIntervals.length} slot{disabledIntervals.length !== 1 ? "s" : ""} disabled
            </summary>
            <div className="flex flex-col gap-1.5 mt-1.5">
              {disabledIntervals.map((interval) => (
                <div
                  key={interval.id}
                  className="group flex items-center gap-2.5 rounded-lg bg-muted/30 px-3 py-2 opacity-60"
                >
                  <Switch
                    checked={interval.isEnabled}
                    onChange={(v) => onToggleEnabled(interval.id, v)}
                  />
                  <ClockIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-sm tabular-nums text-muted-foreground whitespace-nowrap">
                    {interval.startTime}&ndash;{interval.endTime}
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
                    {formatDuration(interval.startTime, interval.endTime)}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Edit"
                      onClick={() => onEdit({ ...interval, dayOfWeek })}
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      title="Delete"
                      onClick={() => handleDelete(interval.id)}
                      disabled={isPending}
                      className="hover:text-destructive"
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Full-width Add Slot button */}
        <button
          type="button"
          onClick={() => onAdd(dayOfWeek)}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/40 hover:bg-brand-soft/30 hover:text-brand"
        >
          <PlusIcon className="size-3.5" />
          Add time slot
        </button>
      </div>
    </div>
  )
}
