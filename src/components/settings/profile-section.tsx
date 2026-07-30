"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { Loader2Icon, SaveIcon } from "lucide-react"

import { updateProfile } from "@/lib/actions/settings"
import { toast } from "@/components/ui/toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileSectionProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: user.name ?? "" },
  })

  async function onSubmit(data: { name: string }) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("name", data.name)

      const result = await updateProfile(formData)

      if (result?.errors) {
        for (const [, messages] of Object.entries(result.errors)) {
          toast.add({ title: Array.isArray(messages) ? messages[0] : messages, type: "error" })
        }
        return
      }

      toast.add({ title: "Profile updated", type: "success" })
    })
  }

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">Update your personal information.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 p-5">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-brand-soft text-brand text-base font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{user.name ?? "Unnamed"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
                className="max-w-sm"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input
                value={user.email ?? ""}
                disabled
                className="max-w-sm text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Email cannot be changed. Contact support for email changes.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
