import { redirect } from "next/navigation"

/**
 * Legacy entry: forwards to the OAuth start route (sets post-login path cookie).
 */
export default async function GoogleLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const q = new URLSearchParams()
  if (callbackUrl) q.set("callbackUrl", callbackUrl)
  const suffix = q.toString()
  redirect(suffix ? `/api/auth/google/start?${suffix}` : "/api/auth/google/start")
}
