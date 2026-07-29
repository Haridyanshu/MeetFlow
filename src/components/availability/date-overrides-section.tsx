"use client"

import { useState, useTransition } from "react"
import {
  CalendarPlusIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { deleteDateOverride } from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { DateOverrideDialog } from "@/components/availability/date-override-dialog"

interface DateOverride {
  id: string
  date: Date
  isAvailable: boolean
  startTime: string | null
  endTime: string | null
}

interface DateOverridesSectionProps {
  dateOverrides: DateOverride[]
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function DateOverridesSection({
  dateOverrides,
}: DateOverridesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editDefaults, setEditDefaults] = useState<
    | {
        id?: string
        date?: string
        isAvailable?: boolean
        startTime?: string | null
        endTime?: string | null
      }
    | undefined
  >()
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    setDialogMode("create")
    setEditDefaults(undefined)
    setDialogOpen(true)
  }

  function handleEdit(override: DateOverride) {
    const dateStr = override.date.toISOString().split("T")[0]
    setDialogMode("edit")
    setEditDefaults({
      id: override.id,
      date: dateStr,
      isAvailable: override.isAvailable,
      startTime: override.startTime,
      endTime: override.endTime,
    })
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDateOverride(id)
      toast.add({
        title: "Date override deleted",
        type: "success",
      })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-medium">Date overrides</h2>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <PlusIcon className="size-3.5" />
          Add override
        </Button>
      </div>
      {dateOverrides.length === 0 ? (
        <EmptyState
          icon={<CalendarPlusIcon />}
          title="No date overrides"
          description="Override your availability for specific dates."
          action={
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <PlusIcon className="size-3.5" />
              Add override
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {dateOverrides.map((override) => (
            <div
              key={override.id}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {formatDate(override.date)}
                </span>
                <Badge
                  variant={override.isAvailable ? "success" : "destructive"}
                >
                  {override.isAvailable ? "Available" : "Unavailable"}
                </Badge>
                {override.isAvailable &&
                  override.startTime &&
                  override.endTime && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {override.startTime}&ndash;{override.endTime}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleEdit(override)}
                >
                  <PencilIcon className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(override.id)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  {isPending ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <DateOverrideDialog
        mode={dialogMode}
        defaultValues={editDefaults}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
