"use client"

import { useState, useTransition } from "react"
import {
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
  Trash2Icon,
} from "lucide-react"

import { toggleEventTypeActive } from "@/lib/actions/event-types"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventTypeForm } from "@/components/event-types/event-type-form"
import { DeleteDialog } from "@/components/event-types/delete-dialog"
import { MoreHorizontalIcon } from "lucide-react"

interface EventTypeCardProps {
  eventType: {
    id: string
    title: string
    slug: string
    description: string | null
    duration: number
    color: string | null
    location: string | null
    isActive: boolean
    requiresConfirmation: boolean
    bufferBefore: number
    bufferAfter: number
    minimumNotice: number
    maximumAdvanceDays: number
    maximumBookingsPerDay: number
    maximumBookingsPerWeek: number
    schedulingType: string
    teamId: string | null
  }
  teams?: { id: string; name: string }[]
}

export function EventTypeCard({ eventType, teams }: EventTypeCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleToggleActive() {
    startTransition(async () => {
      await toggleEventTypeActive(eventType.id)
      toast.add({
        title: eventType.isActive ? "Event type deactivated" : "Event type activated",
        type: "success",
      })
    })
  }

  return (
    <>
      <EventTypeForm
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        teams={teams}
        defaultValues={{
          id: eventType.id,
          title: eventType.title,
          slug: eventType.slug,
          description: eventType.description ?? "",
          duration: eventType.duration,
          color: eventType.color ?? "",
          location: eventType.location ?? "",
          requiresConfirmation: eventType.requiresConfirmation,
          bufferBefore: eventType.bufferBefore,
          bufferAfter: eventType.bufferAfter,
          minimumNotice: eventType.minimumNotice,
          maximumAdvanceDays: eventType.maximumAdvanceDays,
          maximumBookingsPerDay: eventType.maximumBookingsPerDay,
          maximumBookingsPerWeek: eventType.maximumBookingsPerWeek,
          schedulingType: eventType.schedulingType as "INDIVIDUAL" | "ROUND_ROBIN" | "COLLECTIVE",
          teamId: eventType.teamId ?? "",
        }}
      />
      <DeleteDialog
        eventTypeId={eventType.id}
        eventTypeTitle={eventType.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex items-start gap-3">
            {eventType.color && (
              <div
                className="mt-1 size-3 shrink-0 rounded-full"
                style={{ backgroundColor: eventType.color }}
              />
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                {eventType.title}
                <Badge variant={eventType.isActive ? "success" : "secondary"}>
                  {eventType.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              {eventType.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {eventType.description}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0" />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="cursor-pointer"
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleActive}
                disabled={isPending}
                className="cursor-pointer"
              >
                {eventType.isActive ? (
                  <PowerOffIcon />
                ) : (
                  <PowerIcon />
                )}
                {eventType.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="cursor-pointer text-destructive focus:text-destructive data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:text-destructive"
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {eventType.duration} min
            </span>
            <span className="font-mono text-xs">/{eventType.slug}</span>
            {eventType.location && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {eventType.location}
              </span>
            )}
            {(eventType.bufferBefore > 0 || eventType.bufferAfter > 0) && (
              <span className="text-xs">
                Buffer: {eventType.bufferBefore}min before / {eventType.bufferAfter}min after
              </span>
            )}
            {eventType.schedulingType && eventType.schedulingType !== "INDIVIDUAL" && (
              <Badge variant="outline" className="text-[10px]">
                {eventType.schedulingType === "ROUND_ROBIN" ? "Round Robin" : "Collective"}
              </Badge>
            )}
            {eventType.teamId && teams && (
              <span className="text-xs text-muted-foreground">
                Team: {teams.find((t) => t.id === eventType.teamId)?.name ?? eventType.teamId}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
