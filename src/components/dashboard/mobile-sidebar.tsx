"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { navItems } from "@/components/dashboard/nav-items"
import { buttonVariants } from "@/components/ui/button"

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 h-full max-w-[16rem] translate-x-0 translate-y-0 rounded-none p-0 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 sm:max-w-[16rem]"
        showCloseButton={false}
      >
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
                onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  )
}
