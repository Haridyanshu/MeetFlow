"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon, HomeIcon } from "lucide-react"

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  "event-types": "Event Types",
  availability: "Availability",
  bookings: "Bookings",
  integrations: "Integrations",
  settings: "Settings",
}

export function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === "/dashboard") return null

  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground"
      >
        <HomeIcon className="size-3.5" />
        Dashboard
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/")
        const label = labelMap[segment] ?? segment
        const isLast = index === segments.slice(1).length - 1

        return (
          <div key={segment} className="flex items-center gap-1">
            <ChevronRightIcon className="size-3.5" />
            {isLast ? (
              <span className="text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
