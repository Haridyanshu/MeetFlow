"use client"

import { UsersIcon, CalendarIcon } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateTeamDialog } from "@/components/teams/create-team-dialog"

interface Member {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface Team {
  id: string
  name: string
  slug: string
  owner?: { id: string; name: string | null; email: string }
  members: Member[]
  eventTypeCount: number
  schedulingTypes: string[]
}

interface TeamsListProps {
  ownedTeams: Team[]
  memberTeams: Team[]
}

function SchedulingBadges({ types }: { types: string[] }) {
  if (types.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {types.includes("ROUND_ROBIN") && (
        <Badge variant="outline" className="text-[10px]">Round Robin</Badge>
      )}
      {types.includes("COLLECTIVE") && (
        <Badge variant="outline" className="text-[10px]">Collective</Badge>
      )}
    </div>
  )
}

function TeamCard({ team, isOwner }: { team: Team; isOwner: boolean }) {
  const initials = team.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/dashboard/teams/${team.id}`}>
      <Card className="transition-colors hover:bg-muted/50 h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                  {team.owner && !isOwner && ` · ${team.owner.name ?? team.owner.email}`}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isOwner ? "default" : "secondary"}>
              {isOwner ? "Owner" : "Member"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {team.members.slice(0, 4).map((member) => (
                <Avatar key={member.id} size="sm" className="ring-2 ring-background">
                  <AvatarImage src={member.user.image ?? undefined} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {team.members.length > 4 && (
              <span className="text-xs text-muted-foreground">+{team.members.length - 4}</span>
            )}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="size-3" />
              {team.eventTypeCount} event type{team.eventTypeCount !== 1 ? "s" : ""}
            </span>
            <SchedulingBadges types={team.schedulingTypes} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function TeamsList({ ownedTeams, memberTeams }: TeamsListProps) {
  const totalTeams = ownedTeams.length + memberTeams.length

  if (totalTeams === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="No teams yet"
        description="Create your first team to start collaborating."
        action={<CreateTeamDialog />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalTeams} team{totalTeams !== 1 ? "s" : ""}
        </p>
        <CreateTeamDialog />
      </div>

      {ownedTeams.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Owned teams</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ownedTeams.map((team) => (
              <TeamCard key={team.id} team={team} isOwner />
            ))}
          </div>
        </div>
      )}

      {memberTeams.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Member teams</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {memberTeams.map((team) => (
              <TeamCard key={team.id} team={team} isOwner={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
