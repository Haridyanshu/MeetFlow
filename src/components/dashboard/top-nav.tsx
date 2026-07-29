"use client"

import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import { UserNav } from "@/components/dashboard/user-nav"

export function TopNav() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <>
      <header className="flex h-14 items-center gap-3 border-b px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <MenuIcon />
        </Button>
        <div className="flex-1" />
        <UserNav />
      </header>
      <MobileSidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
    </>
  )
}
