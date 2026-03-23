import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Browser lands here only after the Nest API redirects (302) post–Google OAuth success.
 * Google sends `code` to the API (`GOOGLE_CALLBACK_URL` on the API host), not to Next.
 * After Passport + signInWithGoogle + generateTokens, the API must respond with:
 *   Location: {NEXT_PUBLIC_APP_URL}/api/auth/google/callback?access_token=...&refresh_token=...
 * Returning JSON on the API callback URL leaves users stuck on :3000 with an opaque URL.
 */

import { OAUTH_NEXT_PATH_COOKIE } from "@/lib/auth/constants"
import { safeCallbackUrl } from "@/lib/auth/safe-callback"
import { setAuthCookiesOnResponse } from "@/lib/auth/set-auth-cookies"

function readTokens(searchParams: URLSearchParams) {
  const access = searchParams.get("access_token") ?? searchParams.get("accessToken")
  const refresh = searchParams.get("refresh_token") ?? searchParams.get("refreshToken")
  return { access, refresh }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const error =
    searchParams.get("error") ?? searchParams.get("message") ?? searchParams.get("error_description")

  if (error) {
    const login = new URL("/login", request.url)
    login.searchParams.set("reason", "google_oauth")
    login.searchParams.set("detail", error)
    const res = NextResponse.redirect(login)
    res.cookies.delete(OAUTH_NEXT_PATH_COOKIE)
    return res
  }

  const { access, refresh } = readTokens(searchParams)

  if (!access || !refresh) {
    const login = new URL("/login", request.url)
    login.searchParams.set("reason", "google_oauth")
    login.searchParams.set("detail", "missing_tokens")
    const res = NextResponse.redirect(login)
    res.cookies.delete(OAUTH_NEXT_PATH_COOKIE)
    return res
  }

  const storedPath = request.cookies.get(OAUTH_NEXT_PATH_COOKIE)?.value
  const nextPath = safeCallbackUrl(storedPath)

  const res = NextResponse.redirect(new URL(nextPath, request.url))
  setAuthCookiesOnResponse(res, {
    access_token: access,
    refresh_token: refresh,
  })
  res.cookies.delete(OAUTH_NEXT_PATH_COOKIE)

  return res
}
