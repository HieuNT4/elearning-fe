import { NextResponse } from "next/server"

import { loginSchema } from "@/features/auth/validations"
import { getApiBaseUrl } from "@/lib/env"
import { setAuthCookiesOnResponse } from "@/lib/auth/set-auth-cookies"

type BackendLoginResponse = {
  access_token: string
  refresh_token: string
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { email, password } = parsed.data

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json(
      { error: "Server misconfiguration: NEXT_PUBLIC_API_URL" },
      { status: 500 }
    )
  }

  const upstream = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })

  if (!upstream.ok) {
    let message = "Đăng nhập thất bại"
    try {
      const err = (await upstream.json()) as { message?: string; error?: string }
      message = err.message ?? err.error ?? message
    } catch {
      // ignore
    }
    return NextResponse.json({ error: message }, { status: upstream.status })
  }

  let data: BackendLoginResponse
  try {
    data = (await upstream.json()) as BackendLoginResponse
  } catch {
    return NextResponse.json(
      { error: "Invalid response from auth server" },
      { status: 502 }
    )
  }

  if (!data.access_token || !data.refresh_token) {
    return NextResponse.json(
      { error: "Missing tokens in auth response" },
      { status: 502 }
    )
  }

  const res = NextResponse.json({ success: true })
  setAuthCookiesOnResponse(res, data)

  return res
}
