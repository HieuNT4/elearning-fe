"use client"

import { AdminAppSidebar } from "@/components/layout/admin-app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <SidebarProvider className="AdminShell">
      <AdminAppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <span className="text-muted-foreground text-sm">Bảng điều khiển</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
