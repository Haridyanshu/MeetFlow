"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, PlusIcon } from "lucide-react"

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

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: "", slug: "" },
  })

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
      <DialogTrigger render={<Button variant="outline"><PlusIcon />Create team</Button>} />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>Create a new team to collaborate on scheduling.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Engineering" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="engineering" {...register("slug")} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); reset() }} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
