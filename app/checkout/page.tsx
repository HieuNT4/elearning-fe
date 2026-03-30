import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { CheckoutScreen } from "@/features/payment"
import { AUTH_COOKIE_ACCESS } from "@/lib/auth/constants"

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Thanh toán khóa học hoặc combo qua SePay.",
}

type CheckoutPageProps = {
  searchParams: Promise<{
    courseId?: string
    comboId?: string
    courseSlug?: string
    comboSlug?: string
    title?: string
    price?: string
  }>
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { courseId, comboId, courseSlug, comboSlug, title, price } = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_ACCESS)?.value

  if (!token) {
    const callback = `/checkout?${new URLSearchParams(
      Object.entries({
        ...(courseId ? { courseId } : {}),
        ...(comboId ? { comboId } : {}),
        ...(courseSlug ? { courseSlug } : {}),
        ...(comboSlug ? { comboSlug } : {}),
        ...(title ? { title } : {}),
        ...(price ? { price } : {}),
      }),
    ).toString()}`
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`)
  }

  return (
    <CheckoutScreen
      courseId={courseId}
      comboId={comboId}
      courseSlug={courseSlug}
      comboSlug={comboSlug}
      title={title}
      price={toNumber(price)}
    />
  )
}
