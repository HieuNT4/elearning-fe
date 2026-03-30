import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { AUTH_COOKIE_ACCESS } from "@/lib/auth/constants"
import { getApiBaseUrl } from "@/lib/env"

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_ACCESS)?.value ?? null
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  const { id } = await context.params

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const upstream = await fetch(`${apiUrl}/courses/${id}`, {
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

export async function PATCH(request: Request, context: RouteContext) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  const { id } = await context.params

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const body = await request.text()
  const upstream = await fetch(`${apiUrl}/courses/${id}`, {
    method: "PATCH",
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

export async function DELETE(_: Request, context: RouteContext) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  const { id } = await context.params

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const upstream = await fetch(`${apiUrl}/courses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  const raw = await upstream.text()
  return new NextResponse(raw, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
