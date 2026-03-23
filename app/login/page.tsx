import type { Metadata } from "next"

import { LoginScreen } from "@/features/auth/components/login-screen"

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return <LoginScreen callbackUrl={callbackUrl} />
}
