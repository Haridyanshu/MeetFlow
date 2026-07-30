"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  CalendarCheckIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisIcon,
  LayoutGridIcon,
  ListIcon,
  Loader2Icon,
  SearchIcon,
  VideoIcon,
  XCircleIcon,
} from "lucide-react"

import { cancelBooking } from "@/lib/actions/bookings"
import { toast } from "@/components/ui/toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  startTime: Date
  endTime: Date
  guestName: string
  guestEmail: string
  guestNotes: string | null
  timezone: string
  status: string
  meetingUrl: string | null
  meetingProvider: string | null
  paymentStatus: string | null
  amountPaid: number | null
  currency: string | null
  assignedUser?: { id: string; name: string | null; email: string } | null
  eventType: { id: string; title: string; duration: number }
}

interface BookingsPageClientProps {
  bookings: Booking[]
}

type ViewMode = "list" | "calendar"
type StatusTab = "all" | "upcoming" | "past"

function toLocalDate(date: Date): Date {
  return new Date(date.getTime())
}

function formatTime(date: Date): string {
  return toLocalDate(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function formatDateShort(date: Date): string {
  return toLocalDate(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getPaymentLabel(status: string | null): { label: string; variant: "brand" | "success" | "warning" | "destructive" | "outline" } | null {
  if (!status || status === "FREE") return null
  switch (status) {
    case "PAID":
      return { label: "Paid", variant: "success" }
    case "PENDING":
      return { label: "Pending", variant: "warning" }
    case "REFUNDED":
      return { label: "Refunded", variant: "outline" }
    case "FAILED":
      return { label: "Failed", variant: "destructive" }
    default:
      return { label: status.toLowerCase(), variant: "outline" }
  }
}

function MoreMenu({
  bookingId,
  isPast,
  onCancel,
  cancellingId,
}: {
  bookingId: string
  isPast: boolean
  onCancel: (id: string) => void
  cancellingId: string | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground"
      >
        <EllipsisIcon className="size-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
          {!isPast && (
            <button
              type="button"
              onClick={() => { onCancel(bookingId); setOpen(false) }}
              disabled={cancellingId === bookingId}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {cancellingId === bookingId ? (
                <Loader2Icon className="size-3 animate-spin" />
              ) : (
                <XCircleIcon className="size-3" />
              )}
              Cancel booking
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function BookingRow({
  booking,
  onCancel,
  cancellingId,
}: {
  booking: Booking
  onCancel: (id: string) => void
  cancellingId: string | null
}) {
  const isPast = new Date(booking.startTime) < new Date()
  const paymentBadge = getPaymentLabel(booking.paymentStatus)
  const personName = booking.assignedUser?.name ?? booking.guestName
  const personEmail = booking.assignedUser?.email ?? booking.guestEmail

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-150",
        "hover:translate-y-[-1px] hover:shadow-md hover:border-brand/15",
        isPast && "opacity-60 hover:opacity-80",
      )}
    >
      {/* Guest info row */}
      <div className="flex items-start gap-3">
        <Avatar size="default">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
            {getInitials(personName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-sm font-medium text-foreground truncate">{personName}</span>
            <span className="text-xs text-muted-foreground truncate">{personEmail}</span>
          </div>

          {/* Actions - desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {booking.meetingUrl && (
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand/25 bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-brand-foreground transition-all duration-150 h-7"
              >
                <VideoIcon className="size-3.5" />
                Join meeting
              </a>
            )}
            <MoreMenu bookingId={booking.id} isPast={isPast} onCancel={onCancel} cancellingId={cancellingId} />
          </div>
        </div>
      </div>

      {/* Event title */}
      <div className="flex flex-col gap-1 pl-11">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground/80">
            {booking.eventType.title}
          </span>
        </div>

        {/* Meeting metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3 text-muted-foreground/50" />
            {formatDateShort(booking.startTime)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3 text-muted-foreground/50" />
            {formatTime(booking.startTime)}&ndash;{formatTime(booking.endTime)}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">{booking.eventType.duration} min</span>
          {booking.meetingProvider && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <VideoIcon className="size-3 text-muted-foreground/50" />
              {booking.meetingProvider === "GOOGLE_MEET" ? "Google Meet" : booking.meetingProvider}
            </span>
          )}
        </div>
      </div>

      {/* Status badges + mobile actions */}
      <div className="flex items-center gap-2 pl-11">
        <Badge variant={isPast ? "secondary" : "brand"} className="px-2 py-0.5 text-[11px] font-medium">
          {isPast ? "Completed" : "Confirmed"}
        </Badge>
        {paymentBadge && (
          <Badge variant={paymentBadge.variant} className="px-2 py-0.5 text-[11px] font-medium">
            {paymentBadge.label === "Paid" && "$ "}{paymentBadge.label}
          </Badge>
        )}

        {/* Mobile actions */}
        <div className="flex sm:hidden items-center gap-1.5 ml-auto">
          {booking.meetingUrl && (
            <a
              href={booking.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-brand/25 bg-brand-soft px-2 py-1 text-xs font-medium text-brand hover:bg-brand hover:text-brand-foreground transition-all duration-150 h-6"
            >
              <VideoIcon className="size-3" />
              Join
            </a>
          )}
          <MoreMenu bookingId={booking.id} isPast={isPast} onCancel={onCancel} cancellingId={cancellingId} />
        </div>
      </div>
    </div>
  )
}

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [baseDate, setBaseDate] = useState(new Date())
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const today = new Date()

  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of bookings) {
      const key = toLocalDate(b.startTime).toISOString().slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(b)
    }
    return map
  }, [bookings])

  const prevMonth = useCallback(() => {
    setBaseDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])

  const nextMonth = useCallback(() => {
    setBaseDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])

  const monthLabel = baseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const cells: React.ReactNode[] = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayBookings = bookingMap.get(dateStr) ?? []
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day

    cells.push(
      <div
        key={dateStr}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg py-1.5 text-sm transition-colors",
          isToday && "ring-1 ring-brand/30 bg-brand-soft/40",
          dayBookings.length > 0 && "cursor-pointer hover:bg-brand-soft/30",
        )}
      >
        <span
          className={cn(
            "text-xs tabular-nums",
            isToday ? "font-semibold text-brand" : "text-foreground",
          )}
        >
          {day}
        </span>
        {dayBookings.length > 0 && (
          <span className="mt-0.5 flex gap-0.5">
            {dayBookings.slice(0, 3).map((b) => (
              <span
                key={b.id}
                className={cn(
                  "size-1 rounded-full",
                  new Date(b.startTime) >= new Date() ? "bg-brand" : "bg-muted-foreground/40",
                )}
              />
            ))}
          </span>
        )}
      </div>,
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-semibold">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={prevMonth}>
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={nextMonth}>
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {cells}
      </div>
    </div>
  )
}

export function BookingsPageClient({ bookings }: BookingsPageClientProps) {
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState<StatusTab>("all")
  const [view, setView] = useState<ViewMode>("list")
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const now = new Date()
    let result = bookings

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.guestEmail.toLowerCase().includes(q) ||
          b.eventType.title.toLowerCase().includes(q) ||
          b.assignedUser?.name?.toLowerCase().includes(q) ||
          b.assignedUser?.email?.toLowerCase().includes(q),
      )
    }

    if (statusTab === "upcoming") {
      result = result.filter((b) => new Date(b.startTime) >= now)
    } else if (statusTab === "past") {
      result = result.filter((b) => new Date(b.startTime) < now)
    }

    return result
  }, [bookings, search, statusTab])

  const handleCancel = useCallback(async (id: string) => {
    setCancellingId(id)
    await cancelBooking(id)
    toast.add({
      title: "Booking cancelled",
      type: "success",
    })
    setCancellingId(null)
  }, [])

  const hasActiveFilters = search.trim().length > 0 || statusTab !== "all"

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status tabs */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            {(["all", "upcoming", "past"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 capitalize",
                  statusTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground hidden sm:block">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setView("list")}
              data-active={view === "list"}
              className="data-[active=true]:bg-muted data-[active=true]:text-foreground"
              title="List view"
            >
              <ListIcon className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setView("calendar")}
              data-active={view === "calendar"}
              className="data-[active=true]:bg-muted data-[active=true]:text-foreground"
              title="Calendar view"
            >
              <LayoutGridIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheckIcon />}
          title="No bookings yet"
          description="When someone books a meeting with you, it will appear here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title="No matching bookings"
          description={hasActiveFilters ? "Try adjusting your search or filters." : "No bookings match the selected filters."}
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusTab("all") }}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : view === "calendar" ? (
        <CalendarView bookings={filtered} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancellingId={cancellingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
