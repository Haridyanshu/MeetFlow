"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LogOutIcon, UserIcon } from "lucide-react"

export function UserNav() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null

  const initials = (session.user.name ?? session.user.email ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-muted data-open:bg-muted" />
        }
      >
        <Avatar className="size-7">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
          <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden font-medium sm:inline">
          {session.user.name ?? session.user.email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setOpen(false)}
          className="cursor-pointer"
        >
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirectTo: "/login" })}
          className="cursor-pointer text-destructive focus:text-destructive data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:text-destructive"
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
