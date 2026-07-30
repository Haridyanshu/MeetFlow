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
          <CardTitle>Team analytics</CardTitle>
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
              <CardTitle>{team.name}</CardTitle>
              <span className="text-sm text-muted-foreground">{team.totalBookings} bookings</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-4 text-sm">
              <div className="rounded-lg bg-muted px-3 py-2">
                <span className="text-muted-foreground">Round Robin: </span>
                <span className="font-medium tabular-nums">{team.roundRobinBookings}</span>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <span className="text-muted-foreground">Collective: </span>
                <span className="font-medium tabular-nums">{team.collectiveBookings}</span>
              </div>
            </div>
            {team.memberLeaderboard.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Member leaderboard</p>
                <div className="divide-y">
                  {team.memberLeaderboard.map((member, idx) => (
                    <div key={member.email} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                        <Avatar size="sm">
                          <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                      <span className="text-sm tabular-nums text-muted-foreground">{member.bookings} bookings</span>
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
