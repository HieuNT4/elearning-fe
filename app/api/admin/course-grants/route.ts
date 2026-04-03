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

const UPSTREAM_PATH = "/course-grants/admin"

export async function GET(request: Request) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const incoming = new URL(request.url)
  const email = incoming.searchParams.get("email")?.trim()
  if (!email) {
    return NextResponse.json(
      { error: "Missing email query parameter", message: "Query email is required" },
      { status: 400 }
    )
  }

  const upstreamQuery = new URLSearchParams({ email: email.toLowerCase() }).toString()
  const upstream = await fetch(`${apiUrl}${UPSTREAM_PATH}?${upstreamQuery}`, {
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

export async function POST(request: Request) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const body = await request.text()
  const upstream = await fetch(`${apiUrl}${UPSTREAM_PATH}`, {
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

export async function PUT(request: Request) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const body = await request.text()
  const upstream = await fetch(`${apiUrl}${UPSTREAM_PATH}`, {
    method: "PUT",
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

export async function DELETE(request: Request) {
  const token = await getAccessToken()
  if (!token) return unauthorizedResponse()

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const incoming = new URL(request.url)
  const email = incoming.searchParams.get("email")?.trim()
  const courseId = incoming.searchParams.get("courseId")?.trim()
  if (!email || !courseId) {
    return NextResponse.json(
      {
        error: "Bad Request",
        message: "Query parameters email and courseId are required",
      },
      { status: 400 }
    )
  }

  const upstreamQuery = new URLSearchParams({
    email: email.toLowerCase(),
    courseId,
  }).toString()
  const upstream = await fetch(`${apiUrl}${UPSTREAM_PATH}?${upstreamQuery}`, {
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
