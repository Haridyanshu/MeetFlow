"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { navItems } from "@/components/dashboard/nav-items"
import { buttonVariants } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 shrink-0 border-r md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4 font-heading text-base font-medium">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
          M
        </div>
        MeetFlow
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "justify-start gap-2.5 font-normal",
                isActive && "bg-muted font-medium text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
