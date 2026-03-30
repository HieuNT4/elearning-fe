import type { Metadata } from "next"

import { CategoryAdminPanel } from "@/features/category"

export const metadata: Metadata = {
  title: "Danh mục",
}

export default function AdminCategoryPage() {
  return (
    <div className="AdminCategoryPage flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">Danh mục</h1>
        <p className="text-muted-foreground text-sm leading-normal">
          Tạo và chỉnh sửa danh mục (API: <code className="text-xs">title</code> bắt buộc,{" "}
          <code className="text-xs">slug</code> tuỳ chọn).
        </p>
      </div>
      <CategoryAdminPanel />
    </div>
  )
}
