"use client"

import { useState } from "react"
import {
  CalendarPlusIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  CalendarDaysIcon,
  CheckIcon,
  XIcon,
} from "lucide-react"

import { deleteDateOverride } from "@/lib/actions/availability"
import { toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    timeZone: "UTC",
  })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteDateOverride(id)
    toast.add({ title: "Date override deleted", type: "success" })
    setDeletingId(null)
  }

  const sorted = [...dateOverrides].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )

  const upcoming = sorted.filter((d) => d.date >= new Date())
  const past = sorted.filter((d) => d.date < new Date())

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="size-4 text-brand" />
          <CardTitle>Date overrides</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <PlusIcon className="size-3.5" />
          <span className="hidden sm:inline">Add override</span>
        </Button>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
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
          <div className="flex flex-col gap-3">
            {upcoming.length > 0 && (
              <div className="flex flex-col gap-1">
                {upcoming.map((override) => (
                  <OverrideRow
                    key={override.id}
                    override={override}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-1 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <span className="transition-transform group-open:rotate-90 mr-0.5">&rsaquo;</span>
                  Past ({past.length})
                </summary>
                <div className="flex flex-col gap-1 mt-1.5">
                  {past.map((override) => (
                    <OverrideRow
                      key={override.id}
                      override={override}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                      isPast
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
      <DateOverrideDialog
        mode={dialogMode}
        defaultValues={editDefaults}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}

function OverrideRow({
  override,
  onEdit,
  onDelete,
  deletingId,
  isPast,
}: {
  override: DateOverride
  onEdit: (o: DateOverride) => void
  onDelete: (id: string) => void
  deletingId: string | null
  isPast?: boolean
}) {
  const isDeleting = deletingId === override.id

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-card px-3 py-2 transition-all duration-150 hover:shadow-sm ${
        isPast ? "opacity-50" : ""
      }`}
    >
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
          override.isAvailable ? "bg-brand-soft text-brand" : "bg-destructive/10 text-destructive"
        }`}
      >
        {override.isAvailable ? <CheckIcon className="size-3.5" /> : <XIcon className="size-3.5" />}
      </div>

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {isPast ? formatDate(override.date) : formatShortDate(override.date)}
        </span>
        <Badge
          variant={override.isAvailable ? "brand" : "destructive"}
          className="px-1.5 py-0 text-[10px] shrink-0"
        >
          {override.isAvailable ? "Available" : "Unavailable"}
        </Badge>
        {override.isAvailable && override.startTime && override.endTime && (
          <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
            {override.startTime}&ndash;{override.endTime}
          </span>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <Button variant="ghost" size="icon-xs" title="Edit" onClick={() => onEdit(override)} disabled={isDeleting}>
          <PencilIcon className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="Delete"
          onClick={() => onDelete(override.id)}
          disabled={isDeleting}
          className="hover:text-destructive"
        >
          {isDeleting ? <Loader2Icon className="size-3 animate-spin" /> : <Trash2Icon className="size-3" />}
        </Button>
      </div>
    </div>
  )
}
