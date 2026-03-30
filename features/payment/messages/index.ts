export type PaymentLocale = "en" | "ja"

export type PaymentMessages = {
  checkoutTitle: string
  checkoutDescription: string
  proceedPayment: string
  loginRequired: string
  viewCourse: string
}

export const paymentMessages: Record<PaymentLocale, PaymentMessages> = {
  en: {
    checkoutTitle: "Checkout",
    checkoutDescription: "Review your item and continue with secure bank transfer.",
    proceedPayment: "Proceed to payment",
    loginRequired: "Please sign in to continue checkout.",
    viewCourse: "View course details",
  },
  ja: {
    checkoutTitle: "チェックアウト",
    checkoutDescription: "商品内容を確認して、銀行振込でお支払いください。",
    proceedPayment: "支払いへ進む",
    loginRequired: "チェックアウトを続けるにはログインが必要です。",
    viewCourse: "コース詳細を見る",
  },
}
