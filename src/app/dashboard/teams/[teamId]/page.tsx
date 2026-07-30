import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getTeamById } from "@/lib/queries/teams"
import { TeamManageClient } from "@/components/teams/team-manage-client"

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const session = await auth()
  const team = await getTeamById(teamId)

  if (!team) notFound()

  const isOwner = team.ownerId === session!.user.id

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">{team.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwner ? "Manage your team, members, and event types." : "View your team and its members."}
        </p>
      </div>
      <TeamManageClient
        team={team}
        isOwner={isOwner}
        userId={session!.user.id}
        baseUrl={process.env.AUTH_URL ?? "http://localhost:3000"}
      />
    </div>
  )
}
