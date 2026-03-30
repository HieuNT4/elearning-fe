import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { AUTH_COOKIE_ACCESS } from "@/lib/auth/constants"
import { getApiBaseUrl } from "@/lib/env"

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_ACCESS)?.value
  if (!token) return unauthorizedResponse()

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const body = await request.text()
  const upstream = await fetch(`${apiUrl}/orders/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  })

  const raw = await upstream.text()
  return new NextResponse(raw, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
