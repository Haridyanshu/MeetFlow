"use client"

import { UsersIcon, CalendarIcon, UserIcon, ShieldIcon } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <Badge variant="outline" className="text-[10px] border-brand/20 text-brand">Round Robin</Badge>
      )}
      {types.includes("COLLECTIVE") && (
        <Badge variant="outline" className="text-[10px] border-brand/20 text-brand">Collective</Badge>
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
      <Card className="relative h-full transition-all duration-150 hover:translate-y-[-1px] hover:shadow-md hover:border-brand/15">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar size="default">
                <AvatarFallback className="bg-brand-soft text-brand text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-[15px]">{team.name}</CardTitle>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <UserIcon className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                  </span>
                  {team.owner && !isOwner && (
                    <>
                      <span className="text-muted-foreground/30">&middot;</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {team.owner.name ?? team.owner.email}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={isOwner ? "brand" : "secondary"} className="shrink-0 px-2 py-0.5 text-[10px] font-medium">
              {isOwner ? (
                <><ShieldIcon className="size-2.5 mr-1" />Owner</>
              ) : (
                "Member"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Member avatars */}
          {team.members.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {team.members.slice(0, 5).map((member) => (
                  <Avatar key={member.id} size="sm" className="ring-2 ring-background">
                    <AvatarImage src={member.user.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {member.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {team.members.length > 5 && (
                <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                  +{team.members.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Event types + scheduling badges */}
          <div className="flex items-center gap-2 pt-0.5">
            {team.eventTypeCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="size-3 text-brand/60" />
                {team.eventTypeCount} event type{team.eventTypeCount !== 1 ? "s" : ""}
              </span>
            )}
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
        description="Create your first team to start collaborating on scheduling."
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
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ShieldIcon className="size-3.5 text-brand/60" />
            Owned teams
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ownedTeams.map((team) => (
              <TeamCard key={team.id} team={team} isOwner />
            ))}
          </div>
        </div>
      )}

      {memberTeams.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UsersIcon className="size-3.5 text-muted-foreground/60" />
            Member teams
          </h2>
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
