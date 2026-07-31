"use client"

import { useState, useMemo } from "react"
import {
  CalendarPlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  LayoutGridIcon,
  ListIcon,
  ArrowUpDownIcon,
} from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EventTypeCard } from "@/components/event-types/event-type-card"
import { CreateEventTypeButton } from "@/components/event-types/event-type-form"
import { cn } from "@/lib/utils"

interface EventType {
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

interface TeamOption {
  id: string
  name: string
}

type SortKey = "title" | "duration" | "bookingCount" | "lastBooking" | "createdAt"
type ViewMode = "grid" | "list"
type FilterStatus = "all" | "active" | "inactive"

function NativeSelect({
  value,
  onChange,
  children,
  className,
  icon,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <div className={cn("relative", className)}>
      {icon && (
        <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          icon && "pl-7",
        )}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </div>
    </div>
  )
}

export function EventTypesList({ eventTypes, teams, baseUrl: ssrBaseUrl }: { eventTypes: EventType[]; teams?: TeamOption[]; baseUrl?: string }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [view, setView] = useState<ViewMode>("grid")
  const baseUrl = ssrBaseUrl || (typeof window !== "undefined" ? window.location.origin : "")

  const filtered = useMemo(() => {
    let result = [...eventTypes]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (et) =>
          et.title.toLowerCase().includes(q) ||
          et.slug.toLowerCase().includes(q) ||
          (et.description ?? "").toLowerCase().includes(q) ||
          (et.location ?? "").toLowerCase().includes(q),
      )
    }

    if (statusFilter === "active") result = result.filter((et) => et.isActive)
    if (statusFilter === "inactive") result = result.filter((et) => !et.isActive)

    if (teamFilter !== "all") result = result.filter((et) => et.teamId === teamFilter)

    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title)
          break
        case "duration":
          cmp = a.duration - b.duration
          break
        case "bookingCount":
          cmp = a.bookingCount - b.bookingCount
          break
        case "lastBooking": {
          cmp = (a.lastBooking?.getTime() ?? 0) - (b.lastBooking?.getTime() ?? 0)
          break
        }
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [eventTypes, search, statusFilter, teamFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  if (eventTypes.length === 0) {
    return (
      <EmptyState
        icon={<CalendarPlusIcon />}
        title="No event types yet"
        description="Create your first event type to start scheduling meetings."
        action={<CreateEventTypeButton teams={teams} />}
      />
    )
  }

  const uniqueTeams = teams?.filter((t) => eventTypes.some((et) => et.teamId === t.id)) ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search event types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Status filter */}
        <NativeSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as FilterStatus)}
          className="w-[115px]"
          icon={<SlidersHorizontalIcon className="size-3" />}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </NativeSelect>

        {/* Team filter */}
        {uniqueTeams.length > 0 && (
          <NativeSelect value={teamFilter} onChange={setTeamFilter} className="w-[130px]">
            <option value="all">All teams</option>
            {uniqueTeams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </NativeSelect>
        )}

        {/* Sort */}
        <NativeSelect
          value={sortKey}
          onChange={(v) => toggleSort(v as SortKey)}
          className="w-[120px]"
          icon={<ArrowUpDownIcon className="size-3" />}
        >
          <option value="title">Name {sortKey === "title" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</option>
          <option value="duration">Duration {sortKey === "duration" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</option>
          <option value="bookingCount">Bookings {sortKey === "bookingCount" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</option>
          <option value="lastBooking">Last booked {sortKey === "lastBooking" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</option>
          <option value="createdAt">Created {sortKey === "createdAt" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}</option>
        </NativeSelect>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setView("grid")}
            className="rounded-md"
            title="Grid view"
          >
            <LayoutGridIcon className="size-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => setView("list")}
            className="rounded-md"
            title="List view"
          >
            <ListIcon className="size-3.5" />
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create button */}
        <CreateEventTypeButton teams={teams} />
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {eventTypes.length} event type{eventTypes.length !== 1 ? "s" : ""}
        {search.trim() && <> matching &ldquo;{search}&rdquo;</>}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        view === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                teams={teams}
                view="grid"
                baseUrl={baseUrl}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                teams={teams}
                view="list"
                baseUrl={baseUrl}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <SearchIcon className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
              Try adjusting your search or filters.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setTeamFilter("all") }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
