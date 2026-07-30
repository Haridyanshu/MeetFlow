"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant={current === preset.value ? "default" : "outline"}
          size="sm"
          onClick={() => setRange(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
