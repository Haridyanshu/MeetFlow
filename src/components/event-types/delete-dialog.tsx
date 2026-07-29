"use client"

import { useTransition } from "react"
import { Loader2Icon, Trash2Icon } from "lucide-react"

import { deleteEventType } from "@/lib/actions/event-types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DeleteDialogProps {
  eventTypeId: string
  eventTypeTitle: string
  children?: React.ReactNode
}

export function DeleteDialog({
  eventTypeId,
  eventTypeTitle,
  children,
}: DeleteDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteEventType(eventTypeId)
      toast.add({
        title: "Event type deleted",
        description: `"${eventTypeTitle}" has been deleted.`,
        type: "success",
      })
    })
  }

  return (
    <Dialog>
      {children && <DialogTrigger render={children as React.ReactElement} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete event type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{eventTypeTitle}&rdquo;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            <Trash2Icon />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
