import { UserAdminPanel } from "@/features/user"

export default function AdminUsersPage() {
  return (
    <div className="AdminUsersPage flex flex-col gap-4">
      <h1 className="text-2xl font-semibold leading-tight tracking-tight">
        Quản lý người dùng
      </h1>
      <p className="text-muted-foreground text-sm leading-normal">
        Tìm kiếm, tạo user, bật/tắt active và gán quyền học khóa (GRANT) theo email qua API admin.
      </p>
      <UserAdminPanel />
    </div>
  )
}
