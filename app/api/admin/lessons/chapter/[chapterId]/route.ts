import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { AUTH_COOKIE_ACCESS } from "@/lib/auth/constants"
import { getApiBaseUrl } from "@/lib/env"

type RouteContext = {
  params: Promise<{ chapterId: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_ACCESS)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { chapterId } = await context.params
  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const upstream = await fetch(`${apiUrl}/lessons/chapter/${chapterId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const raw = await upstream.text()
  return new NextResponse(raw, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
