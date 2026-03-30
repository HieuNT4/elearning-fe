import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Đang tải trang"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
        <div className="text-sm font-medium text-muted-foreground">Đang tải...</div>
      </div>
    </div>
  )
}

