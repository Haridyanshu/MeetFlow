"use client"

import { useSession, signOut } from "next-auth/react"
import { LogOutIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function SidebarUserNav() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const initials = (session.user.name ?? session.user.email ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <button
        type="button"
        onClick={() => signOut({ redirectTo: "/login" })}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-muted transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
      >
        <Avatar className="size-7 shrink-0 ring-1 ring-sidebar-border">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
          <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col items-start text-left">
          <span className="truncate text-[13px] font-medium leading-tight text-sidebar-foreground">
            {session.user.name ?? session.user.email}
          </span>
          <span className="truncate text-[11px] text-sidebar-muted/60">Free plan</span>
        </div>
        <LogOutIcon className="size-3.5 shrink-0 text-sidebar-muted/40 transition-opacity duration-150 group-hover:text-sidebar-muted" />
      </button>
    </div>
  )
}
