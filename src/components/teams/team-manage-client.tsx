"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import {
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  LinkIcon,
  Loader2Icon,
  MailIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  UserMinusIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function SchedulingTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    INDIVIDUAL: { label: "Individual", variant: "secondary" },
    ROUND_ROBIN: { label: "Round Robin", variant: "default" },
    COLLECTIVE: { label: "Collective", variant: "outline" },
  }
  const { label, variant } = map[type] ?? { label: type, variant: "secondary" as const }
  return <Badge variant={variant} className="px-2 py-0.5 text-[10px]">{label}</Badge>
}

function ActionMenu({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground"
      >
        <EllipsisIcon className="size-3.5" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}

export function TeamManageClient({ team, isOwner, userId, baseUrl }: TeamManageClientProps) {
  const [invitePending, startInviteTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deletePending, startDeleteTransition] = useTransition()
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      setCopied(false)
      toast.add({ title: "Invitation created", type: "success" })
      reset()
    })
  }

  function copyLink() {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      toast.add({ title: "Link copied to clipboard", type: "success" })
      setTimeout(() => setCopied(false), 2000)
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
      {/* Team header */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-brand-soft text-brand text-lg font-semibold">
              {getInitials(team.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xl font-heading font-semibold text-foreground">{team.name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-muted-foreground">
              <span className="font-mono">/{team.slug}</span>
              <span className="text-muted-foreground/30">&middot;</span>
              <span className="inline-flex items-center gap-1">
                <ShieldIcon className="size-3 text-brand/60" />
                {team.owner.name ?? team.owner.email}
              </span>
              <span className="text-muted-foreground/30">&middot;</span>
              <span className="inline-flex items-center gap-1">
                <UsersIcon className="size-3" />
                {team.members.length} member{team.members.length !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground/30">&middot;</span>
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="size-3" />
                {team.eventTypeCount} event type{team.eventTypeCount !== 1 ? "s" : ""}
              </span>
            </div>
            {team.schedulingTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {team.schedulingTypes.map((t) => (
                  <SchedulingTypeBadge key={t} type={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Invite section */}
          {isOwner && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MailIcon className="size-4 text-brand" />
                  <CardTitle>Invite member</CardTitle>
                </div>
                <CardDescription>Send an invitation link via email.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onInvite)} className="flex items-end gap-3">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" placeholder="colleague@company.com" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <Button type="submit" disabled={invitePending} className="shrink-0">
                    {invitePending ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <LinkIcon className="size-4" />
                    )}
                    Generate link
                  </Button>
                </form>
                {invitationLink && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-brand/15 bg-brand-soft/30 px-3 py-2 text-sm">
                    <LinkIcon className="size-3.5 shrink-0 text-brand" />
                    <span className="flex-1 truncate text-muted-foreground font-mono text-[11px]">{invitationLink}</span>
                    <Button variant="ghost" size="icon-xs" onClick={copyLink} className="text-brand hover:text-brand">
                      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => setInvitationLink(null)}>
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-brand" />
                <CardTitle>Members ({team.members.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {team.members.length === 0 ? (
                <div className="px-(--card-spacing) pb-(--card-spacing)">
                  <EmptyState title="No members" description="Invite members to your team." />
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {team.members.map((member) => {
                    const isOwnerMember = member.role === "OWNER"
                    const isSelf = member.userId === userId
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-(--card-spacing) py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar size="sm">
                            <AvatarImage src={member.user.image ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {member.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{member.user.name ?? "Unnamed"}</p>
                              {isSelf && (
                                <span className="text-[10px] text-muted-foreground">(you)</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {isOwnerMember ? (
                            <Badge variant="brand" className="px-2 py-0.5 text-[10px] font-medium">
                              <ShieldIcon className="size-2.5 mr-1" />
                              Owner
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                              <UserIcon className="size-2.5 mr-1" />
                              Member
                            </Badge>
                          )}
                          {isOwner && !isOwnerMember && (
                            <ActionMenu>
                              <button
                                type="button"
                                onClick={() => handleRemove(member.id)}
                                disabled={removingId === member.id}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                              >
                                {removingId === member.id ? (
                                  <Loader2Icon className="size-3 animate-spin" />
                                ) : (
                                  <UserMinusIcon className="size-3" />
                                )}
                                Remove member
                              </button>
                            </ActionMenu>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event types */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-brand" />
                <CardTitle>Event types ({team.eventTypes.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {team.eventTypes.length === 0 ? (
                <div className="px-(--card-spacing) pb-(--card-spacing)">
                  <EmptyState
                    icon={<CalendarIcon />}
                    title="No event types"
                    description="Create event types for this team to start scheduling."
                  />
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {team.eventTypes.map((et) => (
                    <div
                      key={et.id}
                      className="flex items-center justify-between px-(--card-spacing) py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                          <CalendarIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{et.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            <span className="font-mono">/{et.slug}</span>
                            <span className="mx-1">&middot;</span>
                            {et.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <SchedulingTypeBadge type={et.schedulingType} />
                        <Badge
                          variant={et.isActive ? "success" : "secondary"}
                          className="px-2 py-0.5 text-[10px]"
                        >
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

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Team info */}
          <Card size="sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldIcon className="size-4 text-brand" />
                <CardTitle>Team info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Owner</span>
                <div className="flex items-center gap-1.5">
                  <Avatar size="sm">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(team.owner.name ?? team.owner.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate max-w-[120px]">{team.owner.name ?? team.owner.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono text-xs">/{team.slug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Members</span>
                <span className="tabular-nums font-medium">{team.members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Event types</span>
                <span className="tabular-nums font-medium">{team.eventTypeCount}</span>
              </div>
              {team.schedulingTypes.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Scheduling</span>
                  <div className="flex flex-wrap gap-1">
                    {team.schedulingTypes.map((t) => (
                      <SchedulingTypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger zone */}
          {isOwner && (
            <Card size="sm" className="border-destructive/20 ring-destructive/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trash2Icon className="size-4 text-destructive" />
                  <CardTitle>Danger zone</CardTitle>
                </div>
                <CardDescription>Permanently delete this team and all associated data.</CardDescription>
              </CardHeader>
              <CardContent>
                {!deleteConfirm ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setDeleteConfirm(true)}
                  >
                    <Trash2Icon className="size-4" />
                    Delete team
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 rounded-lg bg-destructive/5 border border-destructive/15 p-3">
                    <p className="text-xs text-destructive font-medium">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deletePending}
                        className="flex-1"
                      >
                        {deletePending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(false)}
                        className="flex-1"
                      >
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
