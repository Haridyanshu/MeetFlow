"use client"

import { useState, useTransition } from "react"
import {
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  PowerIcon,
  PowerOffIcon,
  Trash2Icon,
  CopyIcon,
  Share2Icon,
  BarChart3Icon,
  CalendarCheckIcon,
  UsersIcon,
  TimerIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { toggleEventTypeActive, duplicateEventType } from "@/lib/actions/event-types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventTypeForm } from "@/components/event-types/event-type-form"
import { DeleteDialog } from "@/components/event-types/delete-dialog"
import { formatDateShort } from "@/lib/date"

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
    bookingCount: number
    lastBooking: Date | null
  }
  teams?: { id: string; name: string }[]
  view: "grid" | "list"
  baseUrl: string
  timezone: string
}

function formatLastBooked(date: Date | null, timeZone: string): string {
  if (!date) return "Never"
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDateShort(date, timeZone)
}

function SchedulingTypeBadge({ type }: { type: string }) {
  if (type === "INDIVIDUAL") return null
  return (
    <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
      <UsersIcon className="size-3" />
      {type === "ROUND_ROBIN" ? "Round Robin" : "Collective"}
    </Badge>
  )
}

export function EventTypeCard({ eventType, teams, view, baseUrl, timezone }: EventTypeCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggleActive() {
    startTransition(async () => {
      await toggleEventTypeActive(eventType.id)
      toast.add({
        title: eventType.isActive ? "Event type deactivated" : "Event type activated",
        type: "success",
      })
    })
  }

  function handleDuplicate() {
    startTransition(async () => {
      await duplicateEventType(eventType.id)
      toast.add({ title: "Event type duplicated", type: "success" })
    })
  }

  function handleShare() {
    const link = `${baseUrl}/book/${eventType.slug}`
    navigator.clipboard.writeText(link)
    toast.add({ title: "Booking link copied", type: "success" })
  }

  function handleAnalytics() {
    router.push(`/dashboard/analytics?eventTypeId=${eventType.id}`)
  }

  const hasBuffer = eventType.bufferBefore > 0 || eventType.bufferAfter > 0
  const teamName = teams?.find((t) => t.id === eventType.teamId)?.name ?? null

  const statusBadge = (
    <Badge variant={eventType.isActive ? "brand" : "secondary"} className="shrink-0">
      {eventType.isActive ? "Active" : "Inactive"}
    </Badge>
  )

  const teamBadge = teamName && (
    <Badge variant="outline" className="gap-1 shrink-0 text-xs">
      {teamName}
    </Badge>
  )

  const schedulingBadge = <SchedulingTypeBadge type={eventType.schedulingType} />

  const commonFormProps = {
    mode: "edit" as const,
    open: editOpen,
    onOpenChange: setEditOpen as (open: boolean) => void,
    teams,
    defaultValues: {
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
    },
  }

  if (view === "grid") {
    return (
      <>
        <EventTypeForm {...commonFormProps} />
        <DeleteDialog
          eventTypeId={eventType.id}
          eventTypeTitle={eventType.title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
        <Card className="group relative transition-all duration-150 hover:translate-y-[-1px] hover:shadow-md">
          <CardContent className="flex flex-col gap-3 p-4">
            {/* Badge row */}
            <div className="flex items-center gap-2">
              {eventType.color && (
                <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: eventType.color }} />
              )}
              <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
                {statusBadge}
                {teamBadge}
                {schedulingBadge}
              </div>
            </div>

            {/* Title */}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{eventType.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] text-muted-foreground">/{eventType.slug}</span>
              </div>
              {eventType.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{eventType.description}</p>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3" />
                {eventType.duration} min
              </span>
              {eventType.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3" />
                  {eventType.location}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border/50 pt-2.5">
              <span className="inline-flex items-center gap-1" title={`${eventType.bookingCount} total bookings`}>
                <CalendarCheckIcon className="size-3" />
                {eventType.bookingCount}
              </span>
              <span className="inline-flex items-center gap-1" title={`Last booked: ${formatLastBooked(eventType.lastBooking, timezone)}`}>
                <TimerIcon className="size-3" />
                {formatLastBooked(eventType.lastBooking, timezone)}
              </span>
              {hasBuffer && (
                <span className="inline-flex items-center gap-1" title={`Buffer: ${eventType.bufferBefore}min before, ${eventType.bufferAfter}min after`}>
                  Buffer: {eventType.bufferBefore}/{eventType.bufferAfter}
                </span>
              )}
            </div>

            {/* Hover action bar */}
            <div className="absolute inset-x-0 bottom-0 hidden items-center justify-center gap-0.5 rounded-b-xl border-t bg-card px-4 py-1.5 opacity-0 transition-opacity duration-150 group-hover:flex group-hover:opacity-100">
              <Button variant="ghost" size="icon-xs" title="Edit" onClick={() => setEditOpen(true)}>
                <PencilIcon className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" title="Duplicate" onClick={handleDuplicate} disabled={isPending}>
                <CopyIcon className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" title="Share booking link" onClick={handleShare}>
                <Share2Icon className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" title="View analytics" onClick={handleAnalytics}>
                <BarChart3Icon className="size-3.5" />
              </Button>
              <span className="mx-1 h-4 w-px bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-xs" title="More actions" />}
                >
                  <MoreHorizontalIcon className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleActive} disabled={isPending} className="cursor-pointer">
                    {eventType.isActive ? <PowerOffIcon className="size-3.5" /> : <PowerIcon className="size-3.5" />}
                    {eventType.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2Icon className="size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <EventTypeForm {...commonFormProps} />
      <DeleteDialog
        eventTypeId={eventType.id}
        eventTypeTitle={eventType.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <Card className="group relative transition-all duration-150 hover:translate-y-[-1px] hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            {/* Color dot */}
            {eventType.color && (
              <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: eventType.color }} />
            )}

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {/* Top row: title, badges, slug */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{eventType.title}</h3>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0 hidden sm:inline">/{eventType.slug}</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {statusBadge}
                  {teamBadge}
                  {schedulingBadge}
                </div>
              </div>

              {/* Description + meta */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                {eventType.description && (
                  <span className="text-muted-foreground/70 truncate max-w-[200px]">{eventType.description}</span>
                )}
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {eventType.duration} min
                </span>
                {eventType.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="size-3" />
                    {eventType.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarCheckIcon className="size-3" />
                  {eventType.bookingCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TimerIcon className="size-3" />
                  {formatLastBooked(eventType.lastBooking, timezone)}
                </span>
                {hasBuffer && (
                  <span className="text-muted-foreground/60">
                    Buffer: {eventType.bufferBefore}/{eventType.bufferAfter}min
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon-xs" title="Edit" onClick={() => setEditOpen(true)}>
                <PencilIcon className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" title="Duplicate" onClick={handleDuplicate} disabled={isPending}>
                <CopyIcon className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" title="Share" onClick={handleShare}>
                <Share2Icon className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-xs" title="Analytics" onClick={handleAnalytics}>
                <BarChart3Icon className="size-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-xs" title="More" />}
                >
                  <MoreHorizontalIcon className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleToggleActive} disabled={isPending} className="cursor-pointer">
                    {eventType.isActive ? <PowerOffIcon className="size-3.5" /> : <PowerIcon className="size-3.5" />}
                    {eventType.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2Icon className="size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
