import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getApiBaseUrl } from "@/lib/env"
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH } from "@/lib/auth/constants"
import type { AuthMeUser } from "@/features/auth/types"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_ACCESS)?.value
  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("callbackUrl", pathname)

  if (!token) {
    return NextResponse.redirect(loginUrl)
  }

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.redirect(loginUrl)
  }

  let meRes: Response
  try {
    meRes = await fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return NextResponse.redirect(loginUrl)
  }

  if (!meRes.ok) {
    const res = NextResponse.redirect(loginUrl)
    res.cookies.delete(AUTH_COOKIE_ACCESS)
    res.cookies.delete(AUTH_COOKIE_REFRESH)
    return res
  }

  let user: AuthMeUser
  try {
    user = (await meRes.json()) as AuthMeUser
  } catch {
    return NextResponse.redirect(loginUrl)
  }

  if (!user.isActive) {
    const res = NextResponse.redirect(new URL("/login?reason=inactive", request.url))
    res.cookies.delete(AUTH_COOKIE_ACCESS)
    res.cookies.delete(AUTH_COOKIE_REFRESH)
    return res
  }

  if (user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
