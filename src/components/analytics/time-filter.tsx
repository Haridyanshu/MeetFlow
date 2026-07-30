"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarDaysIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const PRESETS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "This year", value: "year" },
] as const

export function TimeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("range") ?? "30d"

  function setRange(range: string) {
    const params = new URLSearchParams(searchParams)
    params.set("range", range)
    params.delete("start")
    params.delete("end")
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 mr-2">
        <CalendarDaysIcon className="size-4 text-brand" />
        <span className="text-xs font-medium text-foreground">Period</span>
      </div>
      <div className="flex items-center gap-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant={current === preset.value ? "brand" : "ghost"}
            size="sm"
            onClick={() => setRange(preset.value)}
            className={current === preset.value ? "" : "text-muted-foreground hover:text-foreground"}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
