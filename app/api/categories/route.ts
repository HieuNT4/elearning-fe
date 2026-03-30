import { NextResponse } from "next/server"

import { getApiBaseUrl } from "@/lib/env"

/**
 * Public categories list (no auth) — used for course form and filters.
 */
export async function GET() {
  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const upstream = await fetch(`${apiUrl}/categories`, {
    method: "GET",
    cache: "no-store",
  })

  const raw = await upstream.text()
  return new NextResponse(raw, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
