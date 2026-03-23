import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { OAUTH_NEXT_PATH_COOKIE } from "@/lib/auth/constants"
import { safeCallbackUrl } from "@/lib/auth/safe-callback"
import { getApiBaseUrl } from "@/lib/env"

const OAUTH_NEXT_MAX_AGE = 60 * 10

export async function GET(request: NextRequest) {
  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json(
      { error: "Server misconfiguration: NEXT_PUBLIC_API_URL" },
      { status: 500 }
    )
  }

  const raw = request.nextUrl.searchParams.get("callbackUrl")
  const nextPath = safeCallbackUrl(raw)

  const res = NextResponse.redirect(new URL(`${apiUrl}/auth/google`))
  res.cookies.set(OAUTH_NEXT_PATH_COOKIE, nextPath, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_NEXT_MAX_AGE,
  })

  return res
}
