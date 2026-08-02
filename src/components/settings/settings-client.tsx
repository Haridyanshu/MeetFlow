"use client"

import { useState } from "react"
import {
  UserIcon,
  ShieldIcon,
  PaletteIcon,
  AlertTriangleIcon,
  CreditCardIcon,
  GlobeIcon,
} from "lucide-react"

import { ProfileSection } from "@/components/settings/profile-section"
import { AccountSection } from "@/components/settings/account-section"
import { SecuritySection } from "@/components/settings/security-section"
import { AppearanceSection } from "@/components/settings/appearance-section"
import { DangerZoneSection } from "@/components/settings/danger-zone-section"
import { TimezoneSection } from "@/components/settings/timezone-section"
import { cn } from "@/lib/utils"

interface SettingsClientProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    createdAt: Date
    timezone: string
  }
}

const sections = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "account", label: "Account", icon: CreditCardIcon },
  { id: "timezone", label: "Timezone", icon: GlobeIcon },
  { id: "security", label: "Security", icon: ShieldIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "danger-zone", label: "Danger zone", icon: AlertTriangleIcon },
] as const

type SectionId = (typeof sections)[number]["id"]

export function SettingsClient({ user }: SettingsClientProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("profile")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading font-medium">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar */}
        <nav className="flex shrink-0 flex-col gap-0.5 lg:w-44">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition-all duration-150",
                  activeSection === section.id
                    ? "bg-brand-soft text-brand font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "profile" && <ProfileSection user={user} />}
          {activeSection === "account" && <AccountSection user={user} />}
          {activeSection === "timezone" && <TimezoneSection user={user} />}
          {activeSection === "security" && <SecuritySection />}
          {activeSection === "appearance" && <AppearanceSection />}
          {activeSection === "danger-zone" && <DangerZoneSection />}
        </div>
      </div>
    </div>
  )
}
