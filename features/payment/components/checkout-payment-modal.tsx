"use client"

import { Loader2 } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { GoogleLoginButton } from "@/features/auth/components/google-login-button"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { orderPaymentService } from "../services/order-payment.service"
import type { CheckoutPayload } from "../types"

type OrderCheckoutMap = Record<string, { courseSlug?: string; comboSlug?: string }>

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

type CheckoutPaymentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId?: string
  comboId?: string
  productTitle: string
  priceHint?: number
  courseSlug?: string
  comboSlug?: string
}

export function CheckoutPaymentModal({
  open,
  onOpenChange,
  courseId,
  comboId,
  productTitle,
  priceHint,
  courseSlug,
  comboSlug,
}: CheckoutPaymentModalProps) {
  const router = useRouter()
  const pathname = usePathname()

  const payload = useMemo<CheckoutPayload | null>(() => {
    if (courseId) return { courseId }
    if (comboId) return { comboId }
    return null
  }, [comboId, courseId])

  const [bootstrapping, setBootstrapping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderCode, setOrderCode] = useState("")
  const [orderDescription, setOrderDescription] = useState("")
  const [orderAmount, setOrderAmount] = useState<number | null>(null)

  useEffect(() => {
    if (!open || !payload) return
    const checkoutPayload = payload
    let cancelled = false

    async function init() {
      setBootstrapping(true)
      setError(null)
      setOrderCode("")
      setOrderDescription("")
      setOrderAmount(null)
      try {
        const data = await orderPaymentService.createCheckout(checkoutPayload)
        if (cancelled) return
        const code = data.formFields.order_invoice_number ?? ""
        const amountRaw = Number(data.formFields.order_amount ?? "")
        setOrderCode(code)
        setOrderDescription(data.formFields.order_description ?? "")
        setOrderAmount(Number.isFinite(amountRaw) ? amountRaw : null)
        if (code) {
          try {
            const previous = window.localStorage.getItem("order_checkout_map")
            const parsed: OrderCheckoutMap = previous ? JSON.parse(previous) : {}
            parsed[code] = {
              ...(courseSlug ? { courseSlug } : {}),
              ...(comboSlug ? { comboSlug } : {}),
            }
            window.localStorage.setItem("order_checkout_map", JSON.stringify(parsed))
          } catch {
            // ignore storage errors
          }
        }
      } catch (checkoutError) {
        if (cancelled) return
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "Không thể tạo đơn hàng. Vui lòng thử lại.",
        )
      } finally {
        if (!cancelled) {
          setBootstrapping(false)
        }
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [open, payload, courseSlug, comboSlug])

  useEffect(() => {
    if (!open || !orderCode || error) return
    let cancelled = false

    async function poll() {
      for (let attempt = 0; attempt < 30; attempt += 1) {
        if (cancelled) return
        try {
          const status = await orderPaymentService.getOrderStatus(orderCode)
          if (status.status === "PAID") {
            onOpenChange(false)
            if (courseSlug) {
              router.replace(`/khoa-hoc/${courseSlug}`)
              return
            }
            if (comboSlug) {
              router.replace(`/combo/${comboSlug}`)
              return
            }
            router.replace("/")
            return
          }
        } catch {
          // Keep polling; backend may lag after IPN.
        }
        await sleep(2000)
      }
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [open, orderCode, error, courseSlug, comboSlug, onOpenChange, router])

  const displayTitle = orderDescription.trim() || productTitle.trim() || "Sản phẩm"
  const displayAmount =
    orderAmount != null
      ? orderAmount
      : typeof priceHint === "number" && Number.isFinite(priceHint)
        ? priceHint
        : null

  const showLoginCta =
    error != null &&
    (error === "Unauthorized" || error.toLowerCase().includes("unauthorized"))

  const loginOnly = showLoginCta && !bootstrapping

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "CheckoutPaymentModal",
          "flex max-h-[min(92dvh,100svh)] flex-col gap-3 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:max-h-[min(90dvh,100vh)] sm:gap-4 sm:p-6 sm:pb-6",
          // Mobile: full-width bottom sheet (thumb-friendly; avoids a narrow floating card)
          "fixed inset-x-0 bottom-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-0 border-t border-border shadow-lg",
          // sm+: centered dialog
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-border sm:shadow-lg",
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 gap-1.5 pr-10 text-left">
          <DialogTitle>Thanh toán</DialogTitle>
          <DialogDescription className="break-words">
            {loginOnly
              ? "Vui lòng đăng nhập với google để mua khóa học nhé!"
              : "Quét mã QR bằng app ngân hàng và thanh toán đúng số tiền nhé! Hệ thống sẽ tự xác nhận khi thanh toán sau 30s hãy load lại trình duyệt và học tập. Nếu có vấn đề gì vui lòng liên hệ admin qua facebook để được hỗ trợ khẩn cấp."}
          </DialogDescription>
        </DialogHeader>

        {loginOnly ? (
          <div className="CheckoutPaymentModal-loginOnly flex justify-center py-1">
            <GoogleLoginButton
              callbackUrl={pathname || "/"}
              className="h-10 min-h-10 w-full shrink-0 cursor-pointer justify-center gap-2 rounded-lg border-primary/35 px-4 text-sm font-bold text-primary hover:bg-primary/10 hover:text-primary"
            />
          </div>
        ) : (
          <>
            {bootstrapping ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                <span>Đang tạo đơn hàng...</span>
              </div>
            ) : null}

            {error && !showLoginCta ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {!bootstrapping && !error && orderCode ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">Tên khóa học / combo</p>
                  <p className="text-base font-semibold leading-snug">{displayTitle}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">Số tiền</p>
                  <p className="text-xl font-semibold text-[color:var(--primary)] sm:text-2xl">
                    {displayAmount != null ? formatVnd(displayAmount) : "—"}
                  </p>
                </div>

                <div className="mx-auto w-full max-w-[min(280px,85vw)] overflow-hidden rounded-lg border border-border bg-white p-1.5 sm:p-2">
                  <Image
                    src="/images/sepay-qr.png"
                    alt="QR chuyển khoản ngân hàng"
                    width={280}
                    height={280}
                    sizes="(max-width: 640px) 85vw, 280px"
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm leading-normal text-foreground max-sm:text-xs">
                  <p className="font-medium text-foreground">Hướng dẫn</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
                    <li>Mở app ngân hàng và quét mã QR.</li>
                    <li>Ghi chính xác mã đơn ở phần nội dung chuyển khoản.</li>
                    <li>Sau khoảng 30 giây từ lúc chuyển khoản, hãy tải lại trang để cập nhật quyền học.</li>                  </ul>
                </div>
              </div>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
