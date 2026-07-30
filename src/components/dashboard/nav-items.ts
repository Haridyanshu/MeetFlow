"use client"

import {
  LayoutDashboardIcon,
  CalendarPlusIcon,
  ClockIcon,
  CalendarCheckIcon,
  UsersIcon,
  BarChart3Icon,
  PuzzleIcon,
  SettingsIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    label: "Scheduling",
    items: [
      {
        title: "Event Types",
        href: "/dashboard/event-types",
        icon: CalendarPlusIcon,
      },
      {
        title: "Availability",
        href: "/dashboard/availability",
        icon: ClockIcon,
      },
      {
        title: "Bookings",
        href: "/dashboard/bookings",
        icon: CalendarCheckIcon,
      },
    ],
  },
  {
    label: "Team",
    items: [
      {
        title: "Teams",
        href: "/dashboard/teams",
        icon: UsersIcon,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3Icon,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        title: "Integrations",
        href: "/dashboard/integrations",
        icon: PuzzleIcon,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
      },
    ],
  },
]
