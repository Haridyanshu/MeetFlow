"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"

import { createAvailabilityIntervalSchema } from "@/lib/schemas/availability"
import type {
  CreateAvailabilityIntervalInput,
  UpdateAvailabilityIntervalInput,
} from "@/lib/schemas/availability"
import {
  createAvailabilityInterval,
  updateAvailabilityInterval,
} from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface IntervalDialogProps {
  mode: "create" | "edit"
  dayOfWeek: number
  defaultValues?: {
    id?: string
    startTime?: string
    endTime?: string
    isEnabled?: boolean
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IntervalDialog({
  mode,
  dayOfWeek,
  defaultValues,
  open,
  onOpenChange,
}: IntervalDialogProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateAvailabilityIntervalInput>({
    resolver: zodResolver(createAvailabilityIntervalSchema),
    defaultValues: {
      dayOfWeek,
      startTime: "",
      endTime: "",
      isEnabled: true,
    },
  })

  async function onSubmit(data: CreateAvailabilityIntervalInput) {
    startTransition(async () => {
      let result: { errors?: Record<string, string[]> } | undefined

      if (mode === "create") {
        result = await createAvailabilityInterval(data)
      } else if (defaultValues?.id) {
        const updateData: UpdateAvailabilityIntervalInput = {
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          isEnabled: data.isEnabled,
        }
        result = await updateAvailabilityInterval(defaultValues.id, updateData)
      }

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          const message = Array.isArray(messages) ? messages[0] : messages
          setError(field as keyof CreateAvailabilityIntervalInput, { message })
        }
        return
      }

      toast.add({
        title:
          mode === "create" ? "Time interval added" : "Time interval updated",
        type: "success",
      })
      onOpenChange(false)
    })
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) {
      reset({
        dayOfWeek,
        startTime: "",
        endTime: "",
        isEnabled: true,
      })
    }
  }

  useEffect(() => {
    if (open) {
      reset({
        dayOfWeek,
        startTime: defaultValues?.startTime ?? "",
        endTime: defaultValues?.endTime ?? "",
        isEnabled: defaultValues?.isEnabled ?? true,
      })
    }
  }, [open, dayOfWeek, defaultValues, reset])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add time interval" : "Edit time interval"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new available time slot."
                : "Update your available time slot."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="text-xs text-destructive">{errors.startTime.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endTime">End time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-xs text-destructive">{errors.endTime.message}</p>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                {...register("isEnabled")}
              />
              Enabled
            </label>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              {mode === "create" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
