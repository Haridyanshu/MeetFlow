"use client"

import { useState } from "react"
import { MenuIcon, SearchIcon, BellIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { UserNav } from "@/components/dashboard/user-nav"
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs"

export function TopNav() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <MenuIcon className="size-4" />
        </Button>
        <Breadcrumbs />
        <div className="flex-1" />
        <button
          type="button"
          className="mr-1 hidden items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-[13px] text-muted-foreground transition-all duration-150 hover:border-brand-ring hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring sm:flex"
        >
          <SearchIcon className="size-3.5" />
          <span>Search...</span>
          <kbd className="ml-1 rounded-[4px] border border-border bg-background px-1 py-[1px] text-[10px] text-muted-foreground/60">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          className="hidden sm:flex sm:size-7 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-hover hover:text-foreground"
          aria-label="Notifications"
        >
          <BellIcon className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-hover hover:text-foreground"
          aria-label="Create"
        >
          <PlusIcon className="size-4" />
        </button>
        <UserNav />
      </header>
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
    </>
  )
}
