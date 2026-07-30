"use client"

import { useState, useTransition } from "react"
import { CopyIcon, Loader2Icon } from "lucide-react"

import { copyAvailabilityToDays } from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface CopyScheduleDialogProps {
  sourceDayOfWeek: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CopyScheduleDialog({
  sourceDayOfWeek,
  open,
  onOpenChange,
}: CopyScheduleDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [targetDays, setTargetDays] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleCopy() {
    if (targetDays.length === 0) {
      setError("Select at least one target day")
      return
    }
    if (targetDays.includes(sourceDayOfWeek)) {
      setError("Source day cannot be a target day")
      return
    }
    setError(null)

    startTransition(async () => {
      const result = await copyAvailabilityToDays({
        sourceDayOfWeek,
        targetDaysOfWeek: targetDays,
      })

      if (result?.errors) {
        const firstError = Object.values(result.errors).flat()[0]
        setError(firstError ?? "An error occurred")
        return
      }

      toast.add({
        title: "Schedule copied",
        type: "success",
      })
      onOpenChange(false)
      setTargetDays([])
    })
  }

  function handleToggle(day: number) {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) {
      setTargetDays([])
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyIcon className="size-4" />
            Copy schedule
          </DialogTitle>
          <DialogDescription>
            Copy intervals from <strong>{DAY_NAMES[sourceDayOfWeek]}</strong> to other days.
            Existing intervals on target days will be replaced.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Copy to:</p>
          {[0, 1, 2, 3, 4, 5, 6]
            .filter((d) => d !== sourceDayOfWeek)
            .map((day) => (
              <label
                key={day}
                className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-2 transition-colors hover:bg-muted"
              >
                <Switch
                  checked={targetDays.includes(day)}
                  onChange={() => handleToggle(day)}
                />
                <span className="text-sm">{DAY_NAMES[day]}</span>
              </label>
            ))}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleCopy} disabled={isPending}>
            {isPending && <Loader2Icon className="animate-spin" />}
            Copy to {targetDays.length} day{targetDays.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
