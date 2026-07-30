"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"

import { createEventTypeSchema } from "@/lib/schemas/event-type"
import type { CreateEventTypeInput } from "@/lib/schemas/event-type"
import { createEventType, updateEventType } from "@/lib/actions/event-types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TeamOption {
  id: string
  name: string
}

interface EventTypeFormProps {
  mode: "create" | "edit"
  defaultValues?: Partial<CreateEventTypeInput> & { id?: string }
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  teams?: TeamOption[]
}

export function EventTypeForm({
  mode,
  defaultValues,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  teams,
}: EventTypeFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<CreateEventTypeInput>({
    resolver: zodResolver(
      mode === "create" ? createEventTypeSchema : createEventTypeSchema
    ),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      duration: 30,
      color: "",
      location: "",
      requiresConfirmation: true,
      bufferBefore: 0,
      bufferAfter: 0,
      minimumNotice: 0,
      maximumAdvanceDays: 30,
      maximumBookingsPerDay: 0,
      maximumBookingsPerWeek: 0,
      schedulingType: "INDIVIDUAL",
      teamId: "",
      isPaid: false,
      price: 0,
      currency: "usd",
      ...defaultValues,
    },
  })

  const isPaid = watch("isPaid")

  async function onSubmit(data: CreateEventTypeInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("title", data.title)
      formData.set("slug", data.slug)
      if (data.description) formData.set("description", data.description)
      formData.set("duration", String(data.duration))
      if (data.color) formData.set("color", data.color)
      if (data.location) formData.set("location", data.location)
      formData.set("requiresConfirmation", String(data.requiresConfirmation))
      formData.set("bufferBefore", String(data.bufferBefore ?? 0))
      formData.set("bufferAfter", String(data.bufferAfter ?? 0))
      formData.set("minimumNotice", String(data.minimumNotice ?? 0))
      formData.set("maximumAdvanceDays", String(data.maximumAdvanceDays ?? 30))
      formData.set("maximumBookingsPerDay", String(data.maximumBookingsPerDay ?? 0))
      formData.set("maximumBookingsPerWeek", String(data.maximumBookingsPerWeek ?? 0))
      formData.set("schedulingType", data.schedulingType ?? "INDIVIDUAL")
      if (data.teamId) formData.set("teamId", data.teamId)

      let result: { errors?: Record<string, string[]> } | undefined

      if (mode === "create") {
        result = await createEventType(formData)
      } else if (defaultValues?.id) {
        result = await updateEventType(defaultValues.id, formData)
      }

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          const message = Array.isArray(messages) ? messages[0] : messages
          setError(field as keyof CreateEventTypeInput, { message })
        }
        return
      }

      toast.add({
        title: mode === "create" ? "Event type created" : "Event type updated",
        type: "success",
      })
      handleOpenChange(false)
      reset()
    })
  }

  function handleOpenChange(open: boolean) {
    if (isControlled) {
      controlledOnOpenChange!(open)
    } else {
      setInternalOpen(open)
    }
    if (!open) reset()
  }

  useEffect(() => {
    if (open && isControlled) {
      reset()
    }
  }, [open, isControlled, reset])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && !isControlled && (
        <DialogTrigger render={children as React.ReactElement} />
      )}
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create event type" : "Edit event type"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new event type for scheduling."
                : "Update your event type settings."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="15 Minute Meeting"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="15-min"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A quick 15-minute check-in"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={480}
                  {...register("duration", { valueAsNumber: true })}
                />
                {errors.duration && (
                  <p className="text-xs text-destructive">{errors.duration.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="#3B82F6"
                  {...register("color")}
                />
                {errors.color && (
                  <p className="text-xs text-destructive">{errors.color.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Google Meet"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bufferBefore">Buffer before (min)</Label>
                <Input
                  id="bufferBefore"
                  type="number"
                  min={0}
                  max={120}
                  {...register("bufferBefore", { valueAsNumber: true })}
                />
                {errors.bufferBefore && (
                  <p className="text-xs text-destructive">{errors.bufferBefore.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bufferAfter">Buffer after (min)</Label>
                <Input
                  id="bufferAfter"
                  type="number"
                  min={0}
                  max={120}
                  {...register("bufferAfter", { valueAsNumber: true })}
                />
                {errors.bufferAfter && (
                  <p className="text-xs text-destructive">{errors.bufferAfter.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="minimumNotice">Minimum notice (min)</Label>
                <Input
                  id="minimumNotice"
                  type="number"
                  min={0}
                  max={10080}
                  {...register("minimumNotice", { valueAsNumber: true })}
                />
                {errors.minimumNotice && (
                  <p className="text-xs text-destructive">{errors.minimumNotice.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maximumAdvanceDays">Max booking window (days)</Label>
                <Input
                  id="maximumAdvanceDays"
                  type="number"
                  min={1}
                  max={365}
                  {...register("maximumAdvanceDays", { valueAsNumber: true })}
                />
                {errors.maximumAdvanceDays && (
                  <p className="text-xs text-destructive">{errors.maximumAdvanceDays.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maximumBookingsPerDay">Max bookings per day</Label>
                <Input
                  id="maximumBookingsPerDay"
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="0 = unlimited"
                  {...register("maximumBookingsPerDay", { valueAsNumber: true })}
                />
                {errors.maximumBookingsPerDay && (
                  <p className="text-xs text-destructive">{errors.maximumBookingsPerDay.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maximumBookingsPerWeek">Max bookings per week</Label>
                <Input
                  id="maximumBookingsPerWeek"
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="0 = unlimited"
                  {...register("maximumBookingsPerWeek", { valueAsNumber: true })}
                />
                {errors.maximumBookingsPerWeek && (
                  <p className="text-xs text-destructive">{errors.maximumBookingsPerWeek.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="schedulingType">Scheduling type</Label>
              <select
                id="schedulingType"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register("schedulingType")}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="ROUND_ROBIN">Round Robin</option>
                <option value="COLLECTIVE">Collective</option>
              </select>
              {errors.schedulingType && (
                <p className="text-xs text-destructive">{errors.schedulingType.message}</p>
              )}
            </div>
            {teams && teams.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="teamId">Team</Label>
                <select
                  id="teamId"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("teamId")}
                >
                  <option value="">No team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.teamId && (
                  <p className="text-xs text-destructive">{errors.teamId.message}</p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Pricing</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="false" {...register("isPaid")} defaultChecked={!defaultValues?.isPaid} />
                  Free
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="true" {...register("isPaid")} defaultChecked={!!defaultValues?.isPaid} />
                  Paid
                </label>
              </div>
            </div>
            {isPaid && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price">Price (cents)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    max={100000}
                    placeholder="2000"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="usd"
                    maxLength={3}
                    {...register("currency")}
                  />
                  {errors.currency && (
                    <p className="text-xs text-destructive">{errors.currency.message}</p>
                  )}
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                defaultChecked={defaultValues?.requiresConfirmation ?? true}
                {...register("requiresConfirmation")}
              />
              Require confirmation
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
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateEventTypeButton({ teams }: { teams?: TeamOption[] }) {
  return (
    <EventTypeForm mode="create" teams={teams}>
      <Button>Create event type</Button>
    </EventTypeForm>
  )
}
