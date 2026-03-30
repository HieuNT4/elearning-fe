"use client"

import { BookOpen, CreditCard, FolderTree, LogOut, Package, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Khóa học",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Danh mục",
    href: "/admin/category",
    icon: FolderTree,
  },
    {
      title: "Combo",
      href: "/admin/combo",
      icon: Package,
    },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Thanh toán",
    href: "/admin/orders",
    icon: CreditCard,
  },
] as const

export function AdminAppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="AdminAppSidebar" collapsible="icon">
      <SidebarHeader className="h-14 flex flex-col justify-center gap-2 border-b border-sidebar-border px-4">
        <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
          Quản trị
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-0">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Đăng xuất"
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/"
              }}
            >
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
