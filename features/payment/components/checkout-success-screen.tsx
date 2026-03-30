"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { orderPaymentService } from "../services/order-payment.service"

type CheckoutSuccessScreenProps = {
  orderCode?: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function CheckoutSuccessScreen({ orderCode }: CheckoutSuccessScreenProps) {
  const router = useRouter()
  const [statusText, setStatusText] = useState("Đang xác nhận thanh toán...")
  const [error, setError] = useState<string | null>(null)

  const canPoll = useMemo(() => Boolean(orderCode?.trim()), [orderCode])

  useEffect(() => {
    const trimmed = orderCode?.trim()
    if (!trimmed) return
    const stableOrderCode: string = trimmed
    let cancelled = false

    async function run() {
      setError(null)
      for (let attempt = 0; attempt < 30; attempt += 1) {
        if (cancelled) return
        try {
          const status = await orderPaymentService.getOrderStatus(stableOrderCode)
          if (status.status === "PAID") {
            const raw = window.localStorage.getItem("order_checkout_map")
            const map = raw
              ? (JSON.parse(raw) as Record<string, { courseSlug?: string; comboSlug?: string }>)
              : {}
            const mapped = map[stableOrderCode]
            if (mapped?.courseSlug) {
              router.replace(`/khoa-hoc/${mapped.courseSlug}`)
              return
            }
            if (mapped?.comboSlug) {
              router.replace(`/combo/${mapped.comboSlug}`)
              return
            }
            router.replace("/")
            return
          }
          setStatusText(`Trạng thái hiện tại: ${status.status}. Đang kiểm tra lại...`)
        } catch (pollError) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Không thể kiểm tra trạng thái đơn hàng. Vui lòng thử lại.",
          )
          return
        }
        await sleep(2000)
      }
      setError("Hết thời gian xác nhận thanh toán. Vui lòng thử lại sau.")
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [orderCode, router])

  return (
    <div className="CheckoutSuccessScreen mx-auto w-full max-w-2xl px-4 py-16 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán thành công</CardTitle>
          <CardDescription>Hệ thống đang xác nhận trạng thái đơn hàng từ backend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!error ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span>{statusText}</span>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            Mã đơn hàng: <span className="font-medium text-foreground">{orderCode || "N/A"}</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" type="button">
              <Link href="/">Về trang chủ</Link>
            </Button>
            {!canPoll ? (
              <Button asChild type="button">
                <Link href="/checkout">Tạo lại thanh toán</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
