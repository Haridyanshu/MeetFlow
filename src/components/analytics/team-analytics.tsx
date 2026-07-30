"use client"

import { UsersIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"

interface MemberLeaderboardEntry {
  name: string
  email: string
  image: string | null
  bookings: number
}

interface TeamAnalyticsData {
  id: string
  name: string
  totalBookings: number
  memberLeaderboard: MemberLeaderboardEntry[]
  roundRobinBookings: number
  collectiveBookings: number
}

export function TeamAnalyticsSection({ data }: { data: TeamAnalyticsData[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-brand" />
            <CardTitle>Team analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<UsersIcon />}
            title="No teams"
            description="Create a team to see team analytics."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-brand" />
                <CardTitle>{team.name}</CardTitle>
              </div>
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {team.totalBookings} booking{team.totalBookings !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Round Robin</span>
                <span className="font-medium tabular-nums text-foreground">{team.roundRobinBookings}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">Collective</span>
                <span className="font-medium tabular-nums text-foreground">{team.collectiveBookings}</span>
              </div>
            </div>
            {team.memberLeaderboard.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Member leaderboard</p>
                <div className="divide-y divide-border/30 rounded-lg border border-border/50">
                  {team.memberLeaderboard.map((member, idx) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between px-3 py-2 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs tabular-nums text-muted-foreground w-4 shrink-0 text-right">
                          {idx + 1}
                        </span>
                        <Avatar size="sm">
                          <AvatarFallback className="text-[10px]">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">{member.name}</span>
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {member.bookings} booking{member.bookings !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
