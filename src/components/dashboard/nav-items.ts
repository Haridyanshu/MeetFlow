import {
  LayoutDashboardIcon,
  CalendarPlusIcon,
  ClockIcon,
  CalendarCheckIcon,
  PuzzleIcon,
  SettingsIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
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
]
