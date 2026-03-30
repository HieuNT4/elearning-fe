import type { Metadata } from "next"

import { CheckoutResultScreen } from "@/features/payment"

export const metadata: Metadata = {
  title: "Hủy thanh toán",
  description: "Bạn đã hủy giao dịch thanh toán.",
}

export default function CheckoutCancelPage() {
  return <CheckoutResultScreen variant="cancel" />
}
