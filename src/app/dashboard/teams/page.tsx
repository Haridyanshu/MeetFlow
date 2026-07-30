import { auth } from "@/lib/auth"
import { getTeamsByOwner, getTeamsByMember } from "@/lib/queries/teams"
import { TeamsList } from "@/components/teams/teams-list"

export default async function TeamsPage() {
  const session = await auth()
  const [owned, member] = await Promise.all([
    getTeamsByOwner(session!.user.id),
    getTeamsByMember(session!.user.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Teams</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your teams and members.</p>
      </div>
      <TeamsList ownedTeams={owned} memberTeams={member} />
    </div>
  )
}
