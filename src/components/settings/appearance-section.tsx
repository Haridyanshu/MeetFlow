"use client"

import { useState } from "react"
import { MonitorIcon, SunIcon, MoonIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const themes = [
  {
    id: "system",
    label: "System",
    description: "Follow your device's theme",
    icon: MonitorIcon,
  },
  {
    id: "light",
    label: "Light",
    description: "Always use light mode",
    icon: SunIcon,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: MoonIcon,
  },
] as const

export function AppearanceSection() {
  const [compact, setCompact] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how the dashboard looks.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-5">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => {
                const Icon = theme.icon
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-3 text-center transition-all duration-150",
                      theme.id === "system"
                        ? "border-brand bg-brand-soft/30"
                        : "border-border hover:border-muted-foreground/30",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        theme.id === "system" ? "text-brand" : "text-muted-foreground",
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          "text-xs font-medium",
                          theme.id === "system" ? "text-brand" : "text-foreground",
                        )}
                      >
                        {theme.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Compact view</p>
              <p className="text-xs text-muted-foreground">Reduce spacing for a denser layout.</p>
            </div>
            <Switch checked={compact} onChange={setCompact} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
