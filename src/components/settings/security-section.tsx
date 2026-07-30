"use client"

import { KeyIcon, LockIcon, SmartphoneIcon, HistoryIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const items = [
  {
    icon: KeyIcon,
    title: "Password",
    description: "Set a password for your account. Currently using Google OAuth.",
    action: "Set password",
    disabled: true,
  },
  {
    icon: LockIcon,
    title: "Two-factor authentication",
    description: "Add an extra layer of security to your account.",
    action: "Enable 2FA",
    disabled: true,
  },
  {
    icon: HistoryIcon,
    title: "Active sessions",
    description: "Manage your active login sessions across devices.",
    action: "View sessions",
    disabled: true,
  },
  {
    icon: SmartphoneIcon,
    title: "Trusted devices",
    description: "Manage devices that can access your account without verification.",
    action: "Manage devices",
    disabled: true,
  },
]

export function SecuritySection() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground">Manage your account security preferences.</p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                {item.disabled && (
                  <span className="shrink-0 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground font-medium">
                    Coming soon
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
