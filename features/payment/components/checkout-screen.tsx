"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { orderPaymentService } from "../services/order-payment.service"
import type { CheckoutPayload } from "../types"

type OrderCheckoutMap = Record<string, { courseSlug?: string; comboSlug?: string }>

type CheckoutScreenProps = {
  courseId?: string
  comboId?: string
  courseSlug?: string
  comboSlug?: string
  title?: string
  price?: number
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function CheckoutScreen({
  courseId,
  comboId,
  courseSlug,
  comboSlug,
  title,
  price,
}: CheckoutScreenProps) {
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(courseId || comboId))
  const [error, setError] = useState<string | null>(null)
  const [orderDescription, setOrderDescription] = useState("")
  const [orderAmount, setOrderAmount] = useState<number | null>(null)

  const payload = useMemo<CheckoutPayload | null>(() => {
    if (courseId) return { courseId }
    if (comboId) return { comboId }
    return null
  }, [comboId, courseId])

  const backHref = courseSlug
    ? `/khoa-hoc/${courseSlug}`
    : comboSlug
      ? `/combo/${comboSlug}`
      : "/"

  const productError = !payload ? "Thiếu thông tin sản phẩm để thanh toán." : null

  useEffect(() => {
    if (!payload) return
    const checkoutPayload = payload
    let cancelled = false

    async function initOrder() {
      setBootstrapping(true)
      setError(null)
      try {
        const data = await orderPaymentService.createCheckout(checkoutPayload)
        if (cancelled) return

        const code = data.formFields.order_invoice_number ?? ""
        const amountRaw = Number(data.formFields.order_amount ?? "")
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

        setBootstrapping(false)

        // Defer one frame so the UI can paint order summary; then POST to SePay (doc §3.1).
        requestAnimationFrame(() => {
          if (cancelled) return
          orderPaymentService.submitSepayForm(data.checkoutURL, data.formFields)
        })
      } catch (checkoutError) {
        if (cancelled) return
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "Không thể khởi tạo thanh toán. Vui lòng thử lại.",
        )
        setBootstrapping(false)
      }
    }

    void initOrder()
    return () => {
      cancelled = true
    }
  }, [comboSlug, courseSlug, payload])

  const displayTitle = title?.trim() || "Sản phẩm"

  return (
    <div className="CheckoutScreen mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {bootstrapping ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span>Đang khởi tạo đơn hàng...</span>
                </div>
              ) : null}

              <div>
                <p className="text-sm text-muted-foreground">Mô tả</p>
                <p className="text-lg font-semibold">{orderDescription || displayTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số tiền</p>
                <p className="text-3xl font-semibold">
                  {orderAmount != null
                    ? formatVnd(orderAmount)
                    : typeof price === "number" && Number.isFinite(price)
                      ? formatVnd(price)
                      : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button asChild type="button" variant="ghost" className="justify-start px-1 text-primary">
            <Link href={backHref}>Quay về</Link>
          </Button>
        </div>

        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-none ring-1 ring-primary-foreground/15">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Thanh toán qua SePay</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Sau khi tạo đơn, trình duyệt sẽ chuyển sang trang SePay để chuyển khoản. Khi hoàn tất, bạn sẽ được đưa về
              trang xác nhận; hệ thống kiểm tra trạng thái đơn qua API (không chỉ dựa vào redirect).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            {error || productError ? (
              <Alert variant="destructive">
                <AlertDescription>{error ?? productError}</AlertDescription>
              </Alert>
            ) : null}
            {!error && !productError && !bootstrapping ? (
              <p className="text-center text-sm text-primary-foreground/95">
                Đang chuyển đến cổng thanh toán SePay...
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
