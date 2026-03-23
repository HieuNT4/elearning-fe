"use client"

import { LayoutDashboard, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AuthMeUser } from "@/features/auth/types"

import { GoogleLoginButton } from "./google-login-button"

function getInitials(user: AuthMeUser): string {
  const fromName = user.fullName?.trim()
  if (fromName) {
    return fromName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return user.email.slice(0, 2).toUpperCase()
}

export function UserButton() {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthMeUser | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        if (!res.ok) {
          if (!cancelled) setUser(null)
          return
        }
        const data = (await res.json()) as AuthMeUser
        if (!cancelled) setUser(data)
      } catch {
        if (!cancelled) setUser(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    window.location.assign(pathname || "/")
  }

  if (user === undefined) {
    return (
      <div
        className="bg-muted h-10 w-[200px] max-w-[min(100%,200px)] animate-pulse rounded-lg"
        aria-hidden
      />
    )
  }

  if (!user) {
    return (
      <GoogleLoginButton
        callbackUrl={pathname || "/"}
        className="h-10 min-h-10 shrink-0 cursor-pointer justify-center gap-2 rounded-lg border-primary/35 px-4 text-sm font-bold text-primary hover:bg-primary/10 hover:text-primary"
      />
    )
  }

  const displayName = user.fullName?.trim() || user.email
  const initials = getInitials(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="border-input h-9 w-9 shrink-0 cursor-pointer rounded-full border"
          aria-label="Menu tài khoản"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.avatar ?? undefined} alt="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72" sideOffset={8}>
        <div className="flex items-center gap-3 p-2">
          <Avatar size="lg">
            <AvatarImage src={user.avatar ?? undefined} alt="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {user.role === "ADMIN" ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex cursor-pointer items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
                Quản trị
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            void handleLogout()
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
