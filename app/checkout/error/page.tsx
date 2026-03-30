import type { Metadata } from "next"

import { CheckoutResultScreen } from "@/features/payment"

export const metadata: Metadata = {
  title: "Thanh toán lỗi",
  description: "Thanh toán thất bại, vui lòng thử lại.",
}

export default function CheckoutErrorPage() {
  return <CheckoutResultScreen variant="error" />
}
