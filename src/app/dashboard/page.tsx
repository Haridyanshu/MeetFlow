import { auth } from "@/lib/auth"
import { getTeamsByOwner, getTeamsByMember } from "@/lib/queries/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface TeamMinimal {
  id: string
  name: string
  slug: string
  members: { id: string; userId: string; user: { id: string; name: string | null; email: string; image: string | null } }[]
  eventTypeCount: number
  schedulingTypes: string[]
}

function TeamCardMinimal({ team, isOwner }: { team: TeamMinimal; isOwner: boolean }) {
  const initials = team.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  return (
    <Link href={`/dashboard/teams/${team.id}`}>
      <Card className="transition-colors hover:bg-muted/50 h-full">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm truncate">{team.name}</CardTitle>
            <p className="text-xs text-muted-foreground truncate">{team.eventTypeCount} event types</p>
          </div>
          <Badge variant={isOwner ? "default" : "secondary"} className="shrink-0">{isOwner ? "Owner" : "Member"}</Badge>
        </CardHeader>
      </Card>
    </Link>
  )
}

export default async function DashboardHome() {
  const session = await auth()
  const [ownedTeams, memberTeams] = await Promise.all([
    getTeamsByOwner(session!.user.id),
    getTeamsByMember(session!.user.id),
  ])
  const allTeams = [...ownedTeams, ...memberTeams].slice(0, 4)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s an overview of your meetings and activity.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No upcoming meetings
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {ownedTeams.length + memberTeams.length} team{(ownedTeams.length + memberTeams.length) !== 1 ? "s" : ""}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No meetings yet
          </CardContent>
        </Card>
      </div>
      {allTeams.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Your teams</h2>
            <Link href="/dashboard/teams" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {allTeams.map((team) => (
              <TeamCardMinimal key={team.id} team={team} isOwner={ownedTeams.some((t) => t.id === team.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
