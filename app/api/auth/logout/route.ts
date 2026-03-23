import { NextResponse } from "next/server"

import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_REFRESH } from "@/lib/auth/constants"

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(AUTH_COOKIE_ACCESS, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  res.cookies.set(AUTH_COOKIE_REFRESH, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
