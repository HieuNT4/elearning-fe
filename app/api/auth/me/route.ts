import { NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/env"
import { AUTH_COOKIE_ACCESS } from "@/lib/auth/constants"
import type { AuthMeUser } from "@/features/auth/types"

import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_ACCESS)?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    )
  }

  const upstream = await fetch(`${apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: upstream.status }
    )
  }

  const user = (await upstream.json()) as AuthMeUser
  return NextResponse.json(user)
}
