import type { Metadata } from "next"

import { ComboAdminPanel } from "@/features/combo"

export const metadata: Metadata = {
  title: "Combo",
}

export default function AdminComboPage() {
  return (
    <div className="AdminComboPage flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">Combo</h1>
        <p className="text-muted-foreground text-sm leading-normal">
          Tạo combo từ danh sách khóa học (API: <code className="text-xs">title</code>,{" "}
          <code className="text-xs">price</code> bắt buộc).
        </p>
      </div>
      <ComboAdminPanel />
    </div>
  )
}

