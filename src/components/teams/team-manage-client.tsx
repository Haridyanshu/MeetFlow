"use client"

import { useState, useTransition } from "react"
import { Loader2Icon, Trash2Icon, MailIcon, LinkIcon, CheckIcon, XIcon, CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createInvitationSchema, type CreateInvitationInput } from "@/lib/schemas/team"
import { removeMember, createInvitation, deleteTeam } from "@/lib/actions/teams"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

interface Member {
  id: string
  role: string
  userId: string
  user: { id: string; name: string | null; email: string; image: string | null }
}

interface Invitation {
  id: string
  email: string
  token: string
  expiresAt: Date
  createdAt: Date
}

interface EventType {
  id: string
  title: string
  slug: string
  duration: number
  schedulingType: string
  isActive: boolean
}

interface Team {
  id: string
  name: string
  slug: string
  ownerId: string
  owner: { id: string; name: string | null; email: string }
  members: Member[]
  invitations: Invitation[]
  eventTypes: EventType[]
  eventTypeCount: number
  schedulingTypes: string[]
}

interface TeamManageClientProps {
  team: Team
  isOwner: boolean
  userId: string
  baseUrl: string
}

function SchedulingTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    INDIVIDUAL: { label: "Individual", variant: "secondary" },
    ROUND_ROBIN: { label: "Round Robin", variant: "default" },
    COLLECTIVE: { label: "Collective", variant: "outline" },
  }
  const { label, variant } = map[type] ?? { label: type, variant: "secondary" as const }
  return <Badge variant={variant}>{label}</Badge>
}

export function TeamManageClient({ team, isOwner, userId, baseUrl }: TeamManageClientProps) {
  const [invitePending, startInviteTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deletePending, startDeleteTransition] = useTransition()
  const [invitationLink, setInvitationLink] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: "" },
  })

  async function onInvite(data: CreateInvitationInput) {
    startInviteTransition(async () => {
      const formData = new FormData()
      formData.set("email", data.email)

      const result = await createInvitation(team.id, formData)

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          const message = Array.isArray(messages) ? messages[0] : messages
          setError(field as keyof CreateInvitationInput, { message })
        }
        return
      }

      const link = `${baseUrl}/teams/invite/${result.token}`
      setInvitationLink(link)
      toast.add({ title: "Invitation created", type: "success" })
      reset()
    })
  }

  function copyLink() {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
      toast.add({ title: "Link copied to clipboard", type: "success" })
    }
  }

  async function handleRemove(memberId: string) {
    setRemovingId(memberId)
    const result = await removeMember(team.id, memberId)
    setRemovingId(null)

    if (result?.errors) return

    toast.add({ title: "Member removed", type: "success" })
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteTeam(team.id)
      toast.add({ title: "Team deleted", type: "success" })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {isOwner && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Invite member</CardTitle>
            <CardDescription>Generate an invitation link to share.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onInvite)} className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="colleague@company.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button type="submit" disabled={invitePending}>
                {invitePending ? <Loader2Icon className="size-4 animate-spin" /> : <MailIcon className="size-4" />}
                Generate link
              </Button>
            </form>
            {invitationLink && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-muted-foreground">{invitationLink}</span>
                <Button variant="ghost" size="icon-sm" onClick={copyLink}>
                  <CheckIcon className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setInvitationLink(null)}>
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Members ({team.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {team.members.length === 0 ? (
                <div className="px-(--card-spacing) pb-(--card-spacing)">
                  <EmptyState title="No members" description="Invite members to your team." />
                </div>
              ) : (
                <div className="divide-y">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between px-(--card-spacing) py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar size="sm">
                          <AvatarImage src={member.user.image ?? undefined} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{member.user.name ?? "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                          {member.role === "OWNER" ? "Owner" : "Member"}
                        </Badge>
                        {isOwner && member.userId !== userId && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemove(member.id)}
                            disabled={removingId === member.id}
                          >
                            {removingId === member.id ? (
                              <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                              <Trash2Icon className="size-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Event types ({team.eventTypes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {team.eventTypes.length === 0 ? (
                <div className="px-(--card-spacing) pb-(--card-spacing)">
                  <EmptyState
                    title="No event types"
                    description="Create event types for this team to start scheduling."
                  />
                </div>
              ) : (
                <div className="divide-y">
                  {team.eventTypes.map((et) => (
                    <div key={et.id} className="flex items-center justify-between px-(--card-spacing) py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{et.title}</p>
                          <p className="text-xs text-muted-foreground truncate">/{et.slug} &middot; {et.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <SchedulingTypeBadge type={et.schedulingType} />
                        <Badge variant={et.isActive ? "success" : "secondary"}>
                          {et.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Team info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Owner:</span>{" "}
                {team.owner.name ?? team.owner.email}
              </div>
              <div>
                <span className="text-muted-foreground">Slug:</span>{" "}
                <span className="font-mono">{team.slug}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Members:</span> {team.members.length}
              </div>
              <div>
                <span className="text-muted-foreground">Event types:</span> {team.eventTypeCount}
              </div>
              {team.schedulingTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {team.schedulingTypes.map((t) => (
                    <SchedulingTypeBadge key={t} type={t} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {isOwner && (
            <Card size="sm" className="ring-destructive/30">
              <CardHeader>
                <CardTitle>Danger zone</CardTitle>
                <CardDescription>Permanently delete this team and all associated data.</CardDescription>
              </CardHeader>
              <CardContent>
                {!deleteConfirm ? (
                  <Button variant="destructive" className="w-full" onClick={() => setDeleteConfirm(true)}>
                    <Trash2Icon className="size-4" />
                    Delete team
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-destructive">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deletePending} className="flex-1">
                        {deletePending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                        Confirm
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
