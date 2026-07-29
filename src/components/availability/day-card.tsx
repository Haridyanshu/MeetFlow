"use client"

import { useTransition } from "react"
import {
  ClockIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { deleteAvailabilityInterval } from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
}

export function DayCard({
  dayOfWeek,
  dayName,
  intervals,
  onAdd,
  onEdit,
  onCopy,
}: DayCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAvailabilityInterval(id)
      toast.add({
        title: "Time interval deleted",
        type: "success",
      })
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{dayName}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => onCopy(dayOfWeek)}>
            Copy
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onAdd(dayOfWeek)}
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      {intervals.length === 0 ? (
        <p className="text-xs text-muted-foreground">Unavailable</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {intervals.map((interval) => (
            <div
              key={interval.id}
              className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <ClockIcon className="size-3 shrink-0 text-muted-foreground" />
                <span className="font-mono text-sm">
                  {interval.startTime}&ndash;{interval.endTime}
                </span>
                {!interval.isEnabled && (
                  <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                    Disabled
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onEdit({ ...interval, dayOfWeek })}
                >
                  <PencilIcon className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(interval.id)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {isPending ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
