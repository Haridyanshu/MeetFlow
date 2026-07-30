"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarPlusIcon, Loader2Icon } from "lucide-react"

import { createDateOverrideSchema } from "@/lib/schemas/availability"
import type { CreateDateOverrideInput } from "@/lib/schemas/availability"
import {
  createDateOverride,
  updateDateOverride,
} from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DateOverrideDialogProps {
  mode: "create" | "edit"
  defaultValues?: {
    id?: string
    date?: string
    isAvailable?: boolean
    startTime?: string | null
    endTime?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DateOverrideDialog({
  mode,
  defaultValues,
  open,
  onOpenChange,
}: DateOverrideDialogProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateDateOverrideInput>({
    resolver: zodResolver(createDateOverrideSchema),
    defaultValues: {
      date: "",
      isAvailable: true,
    },
  })

  const isAvailable = watch("isAvailable")

  async function onSubmit(data: CreateDateOverrideInput) {
    const payload = { ...data }
    if (!payload.isAvailable) {
      delete payload.startTime
      delete payload.endTime
    }

    startTransition(async () => {
      let result: { errors?: Record<string, string[]> } | undefined

      if (mode === "create") {
        result = await createDateOverride(payload)
      } else if (defaultValues?.id) {
        result = await updateDateOverride(defaultValues.id, {
          isAvailable: payload.isAvailable,
          startTime: payload.startTime ?? null,
          endTime: payload.endTime ?? null,
        })
      }

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          const message = Array.isArray(messages) ? messages[0] : messages
          setError(field as keyof CreateDateOverrideInput, { message })
        }
        return
      }

      toast.add({
        title: mode === "create" ? "Date override created" : "Date override updated",
        type: "success",
      })
      onOpenChange(false)
    })
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) {
      reset({ date: "", isAvailable: true, startTime: undefined, endTime: undefined })
    }
  }

  useEffect(() => {
    if (open) {
      reset({
        date: defaultValues?.date ?? "",
        isAvailable: defaultValues?.isAvailable ?? true,
        startTime: defaultValues?.startTime ?? undefined,
        endTime: defaultValues?.endTime ?? undefined,
      })
    }
  }, [open, defaultValues, reset])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlusIcon className="size-4" />
              {mode === "create" ? "Add date override" : "Edit date override"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Override your availability for a specific date."
                : "Update your date override."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {mode === "create" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id="isAvailable"
                checked={isAvailable}
                onChange={(v) => setValue("isAvailable", v)}
              />
              <Label htmlFor="isAvailable" className="text-sm cursor-pointer">
                Available this day
              </Label>
            </div>

            {isAvailable && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="startTime">Start time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    step={900}
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
                    step={900}
                    {...register("endTime")}
                  />
                  {errors.endTime && (
                    <p className="text-xs text-destructive">{errors.endTime.message}</p>
                  )}
                </div>
              </div>
            )}
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
              {mode === "create" ? "Create override" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
