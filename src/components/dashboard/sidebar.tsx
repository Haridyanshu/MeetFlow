"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { navSections } from "@/components/dashboard/nav-items"
import { SidebarUserNav } from "@/components/dashboard/sidebar-user-nav"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col" role="navigation" aria-label="Main navigation">
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background">
          M
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">MeetFlow</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-sidebar-muted/40">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-normal text-sidebar-muted transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-0.5 before:rounded-r-full before:bg-brand before:opacity-0 before:transition-opacity before:duration-150",
                      isActive && "bg-brand-soft font-medium text-sidebar-accent-foreground shadow-sm before:opacity-100"
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0 transition-transform duration-150", isActive && "scale-105")} />
                    <span className={cn(isActive && "")}>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <SidebarUserNav />
    </aside>
  )
}
