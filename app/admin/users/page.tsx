import { UserAdminPanel } from "@/features/user"

export default function AdminUsersPage() {
  return (
    <div className="AdminUsersPage flex flex-col gap-4">
      <h1 className="text-2xl font-semibold leading-tight tracking-tight">
        Quản lý người dùng
      </h1>
      <p className="text-muted-foreground text-sm leading-normal">
        Quản lý tài khoản local dành cho admin: tìm kiếm, tạo user mới và bật/tắt active.
      </p>
      <UserAdminPanel />
    </div>
  )
}
