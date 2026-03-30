import type { Metadata } from "next"

import { CheckoutSuccessScreen } from "@/features/payment"

export const metadata: Metadata = {
  title: "Thanh toán thành công",
  description: "Xác nhận trạng thái đơn hàng sau khi thanh toán SePay.",
}

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ order_code?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { order_code: orderCode } = await searchParams
  return <CheckoutSuccessScreen orderCode={orderCode} />
}
