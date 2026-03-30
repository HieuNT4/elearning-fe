export type CheckoutPayload =
  | {
      courseId: string
      comboId?: never
    }
  | {
      courseId?: never
      comboId: string
    }

export type CheckoutResponse = {
  checkoutURL: string
  formFields: Record<string, string>
}

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED"

export type OrderStatusResponse = {
  orderCode: string
  status: OrderStatus
  amount: number
  courseId: string | null
  comboId: string | null
  completedAt: string | null
}
