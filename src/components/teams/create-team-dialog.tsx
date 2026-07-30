"use client"

import { useState, useTransition, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, PlusIcon, UsersIcon } from "lucide-react"

import { createTeamSchema } from "@/lib/schemas/team"
import type { CreateTeamInput } from "@/lib/schemas/team"
import { createTeam } from "@/lib/actions/teams"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "", slug: "" },
  })

  const watchName = watch("name")

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value
      setValue("name", name)
      if (!errors.slug) {
        setValue("slug", slugify(name))
      }
    },
    [setValue, errors.slug],
  )

  async function onSubmit(data: CreateTeamInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("name", data.name)
      formData.set("slug", data.slug)

      const result = await createTeam(formData)

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          const message = Array.isArray(messages) ? messages[0] : messages
          setError(field as keyof CreateTeamInput, { message })
        }
        return
      }

      toast.add({ title: "Team created", type: "success" })
      setOpen(false)
      reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="brand"><PlusIcon />Create team</Button>} />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand mb-1">
              <UsersIcon className="size-5" />
            </div>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>Create a new team to collaborate on scheduling.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="Engineering"
                {...register("name", { onChange: handleNameChange })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-mono">
                  /
                </span>
                <Input
                  id="slug"
                  placeholder="engineering"
                  className="pl-5 font-mono text-sm"
                  {...register("slug")}
                />
              </div>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              {!errors.slug && watchName && (
                <p className="text-[11px] text-muted-foreground">
                  https://meetflow.com/team/{slugify(watchName) || "..."}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); reset() }} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Create team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
