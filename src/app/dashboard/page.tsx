import { Suspense } from "react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getTeamsByOwner, getTeamsByMember } from "@/lib/queries/teams"
import { getBookingsByUserId } from "@/lib/queries/bookings"
import { getActiveEventTypesByUserId } from "@/lib/queries/event-types"
import { getRecentActivity } from "@/lib/queries/analytics"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CalendarPlusIcon,
  LinkIcon,
  ClockIcon,
  CalendarCheckIcon,
  UsersIcon,
  ActivityIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react"

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getGreeting(name: string | null | undefined): string {
  if (!name) return "there"
  const first = name.split(" ")[0]
  const hour = new Date().getHours()
  if (hour < 12) return `good morning, ${first}`
  if (hour < 17) return `good afternoon, ${first}`
  return `good evening, ${first}`
}

function getTodayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

interface KpiCardProps {
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  icon: React.ReactNode
  description: string
}

function KpiCard({ label, value, trend, trendUp, icon, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-4">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-500">{value}</span>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trendUp !== undefined ? (trendUp ? "text-success" : "text-destructive") : "text-muted-foreground"
            )}>
              {trend}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({
  href,
  icon,
  label,
  description,
  brand,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  brand?: boolean
}) {
  return (
    <Link href={href}>
      <Card className={cn(
        "h-full cursor-pointer transition-all duration-150 hover:translate-y-[-1px] hover:shadow-md",
        brand && "border-brand/20 hover:border-brand/40"
      )}>
        <CardContent className="flex flex-col gap-2 py-4">
          <div className={cn(
            "flex size-9 items-center justify-center rounded-lg [&_svg]:size-4",
            brand ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"
          )}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ActivityIconMap({ type }: { type: string }) {
  switch (type) {
    case "booking_created":
      return <CalendarCheckIcon className="size-3.5 text-success" />
    case "booking_cancelled":
      return <span className="size-3.5 rounded-full bg-destructive/20 flex items-center justify-center"><span className="size-1.5 rounded-full bg-destructive" /></span>
    case "booking_rescheduled":
      return <ClockIcon className="size-3.5 text-info" />
    case "team_created":
      return <UsersIcon className="size-3.5 text-brand" />
    case "invitation_sent":
      return <span className="size-3.5 rounded-full bg-brand-soft flex items-center justify-center"><span className="size-1.5 rounded-full bg-brand" /></span>
    default:
      return <ActivityIcon className="size-3.5 text-brand" />
  }
}

function ActivityDescription({ description }: { description: string }) {
  return <span className="text-sm text-foreground">{description}</span>
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-56 animate-pulse rounded-lg bg-surface-secondary" />
          <div className="h-4 w-40 animate-pulse rounded-lg bg-surface-secondary/60" />
        </div>
        <div className="h-7 w-24 animate-pulse rounded-lg bg-surface-secondary" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-secondary" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-secondary" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl bg-surface-secondary" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-secondary" />
      </div>
    </div>
  )
}

async function DashboardInner() {
  const session = await auth()!
  const userId = session!.user.id

  const [bookings, activeEventTypes, ownedTeams, memberTeams, recentActivity] = await Promise.all([
    getBookingsByUserId(userId),
    getActiveEventTypesByUserId(userId),
    getTeamsByOwner(userId),
    getTeamsByMember(userId),
    getRecentActivity(userId, 6),
  ])

  const now = new Date()
  const upcoming = bookings
    .filter((b) => b.startTime >= now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5)

  const todayBookings = bookings.filter((b) => {
    const bDate = new Date(b.startTime)
    return bDate.toDateString() === now.toDateString() && b.startTime >= now
  })

  const allTeams = [...ownedTeams, ...memberTeams]
  const totalTeams = allTeams.length
  const totalBookings = bookings.length

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">

      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            {getGreeting(session?.user?.name)}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{getTodayDate()}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg bg-surface-secondary px-3 py-1.5 sm:flex">
          <ClockIcon className="size-3.5 text-muted-foreground" />
          <span className="text-sm tabular-nums text-foreground">{getCurrentTime()}</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Upcoming meetings"
          value={upcoming.length}
          description="Scheduled ahead"
          icon={<CalendarCheckIcon />}
        />
        <KpiCard
          label="Today"
          value={todayBookings.length}
          description="Remaining for today"
          icon={<ClockIcon />}
        />
        <KpiCard
          label="Active event types"
          value={activeEventTypes.length}
          description="Available to book"
          icon={<CalendarPlusIcon />}
        />
        <KpiCard
          label="Teams"
          value={totalTeams}
          description={totalTeams === 1 ? "1 team" : `${totalTeams} teams`}
          icon={<UsersIcon />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/dashboard/event-types"
            icon={<CalendarPlusIcon />}
            label="Create event type"
            description="Set up a new meeting type"
            brand
          />
          <QuickActionCard
            href={`/book/${session?.user?.name?.toLowerCase().replace(/\s+/g, "-") ?? "me"}`}
            icon={<LinkIcon />}
            label="Share booking link"
            description="Let others book with you"
          />
          <QuickActionCard
            href="/dashboard/availability"
            icon={<ClockIcon />}
            label="View availability"
            description="Manage your schedule"
          />
          <QuickActionCard
            href="/dashboard/bookings"
            icon={<CalendarCheckIcon />}
            label="Schedule meeting"
            description="Book a new session"
          />
        </div>
      </div>

      {/* Main Grid: Upcoming + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming</CardTitle>
            {upcoming.length > 0 && (
              <Link href="/dashboard/bookings">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-brand">
                  View all <ChevronRightIcon className="size-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {upcoming.length > 0 ? (
              <div className="flex flex-col gap-0 -mx-(--card-spacing)">
                {upcoming.map((booking, i) => (
                  <div
                    key={booking.id}
                    className={cn(
                      "flex items-center gap-4 px-(--card-spacing) py-2.5 transition-colors duration-150 hover:bg-hover",
                      i < upcoming.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
                      <span className="text-[13px] font-bold tabular-nums text-foreground">
                        {new Date(booking.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {booking.eventType?.duration ?? 30}min
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {booking.guestName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {booking.eventType?.title ?? "Meeting"}
                        {booking.assignedUser && ` \u00B7 ${booking.assignedUser.name}`}
                      </span>
                    </div>
                    <a
                      href="#"
                      className="shrink-0 rounded-lg border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-150 hover:border-brand-ring hover:bg-brand-soft hover:text-brand"
                    >
                      Join
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand [&_svg]:size-6">
                  <CalendarCheckIcon />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">No upcoming meetings</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    Share your booking link to get started.
                  </p>
                </div>
                <Link href={`/book/${session?.user?.name?.toLowerCase().replace(/\s+/g, "-") ?? "me"}`}>
                  <Button variant="brand" size="sm" className="mt-1">
                    <LinkIcon className="size-3.5" />
                    Copy booking link
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Activity</CardTitle>
            {recentActivity.length > 0 && (
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-brand">
                  View all <ChevronRightIcon className="size-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="flex flex-col gap-0 -mx-(--card-spacing)">
                {recentActivity.map((event, i) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center gap-3 px-(--card-spacing) py-2.5 transition-colors duration-150 hover:bg-hover",
                      i < recentActivity.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <ActivityIconMap type={event.type} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <ActivityDescription description={event.description} />
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand [&_svg]:size-6">
                  <ActivityIcon />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    Activity will appear here as you use MeetFlow.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Analytics Preview (mini) */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Analytics preview</CardTitle>
            <CardDescription>Quick overview of your booking metrics</CardDescription>
          </div>
          <Link href="/dashboard/analytics">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-brand">
              Full analytics <ExternalLinkIcon className="size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Total bookings</span>
              <span className="text-xl font-bold tabular-nums text-foreground">{totalBookings}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Active event types</span>
              <span className="text-xl font-bold tabular-nums text-foreground">{activeEventTypes.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Upcoming</span>
              <span className="text-xl font-bold tabular-nums text-foreground">{upcoming.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Completion rate</span>
              <span className="text-xl font-bold tabular-nums text-foreground">
                {totalBookings > 0
                  ? Math.round((bookings.filter((b) => b.status === "BOOKED" && new Date(b.endTime) < now).length / totalBookings) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams */}
      {allTeams.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Your teams</h2>
            <Link href="/dashboard/teams">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-brand">
                View all <ChevronRightIcon className="size-3" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {allTeams.slice(0, 4).map((team) => {
              const isOwner = ownedTeams.some((t) => t.id === team.id)
              const initials = team.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              const memberAvatars = team.members.slice(0, 3)
              const extraCount = team.members.length - 3
              return (
                <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
                  <Card className="h-full cursor-pointer transition-all duration-150 hover:translate-y-[-1px] hover:shadow-md hover:border-brand/20">
                    <CardContent className="flex flex-col gap-3 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="size-9 ring-1 ring-border">
                          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{team.name}</p>
                          <p className="text-xs text-muted-foreground">{team.eventTypeCount} event types</p>
                        </div>
                        <Badge variant={isOwner ? "brand" : "default"} className="shrink-0">
                          {isOwner ? "Owner" : "Member"}
                        </Badge>
                      </div>
                      {memberAvatars.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {memberAvatars.map((m) => {
                              const mi = (m.user.name ?? m.user.email ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                              return (
                                <Avatar key={m.id} className="size-6 ring-1 ring-background">
                                  <AvatarImage src={m.user.image ?? undefined} alt={m.user.name ?? ""} />
                                  <AvatarFallback className="text-[8px] font-medium">{mi}</AvatarFallback>
                                </Avatar>
                              )
                            })}
                          </div>
                          {extraCount > 0 && (
                            <span className="text-[11px] text-muted-foreground">+{extraCount} more</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

export default async function DashboardHome() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  )
}
