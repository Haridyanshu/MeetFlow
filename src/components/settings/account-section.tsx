"use client"

import { CreditCardIcon, CalendarIcon, MailIcon, UserIcon, ShieldCheckIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatZoned } from "@/lib/date"

interface AccountSectionProps {
  user: {
    id: string
    name: string | null
    email: string | null
    createdAt: Date
    timezone: string
  }
}

export function AccountSection({ user }: AccountSectionProps) {
  const memberSince = formatZoned(user.createdAt, user.timezone, "MMMM yyyy")

  const details = [
    { icon: UserIcon, label: "Name", value: user.name ?? "Not set" },
    { icon: MailIcon, label: "Email", value: user.email ?? "Not set" },
    { icon: CalendarIcon, label: "Member since", value: memberSince },
    { icon: ShieldCheckIcon, label: "Account type", value: "Free" },
    { icon: CreditCardIcon, label: "User ID", value: user.id.slice(0, 12) + "..." },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">Overview of your account details.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {details.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground truncate ml-4">
                      {item.value}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
