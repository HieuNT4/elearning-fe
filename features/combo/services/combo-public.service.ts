import { getApiBaseUrl } from "@/lib/env"

import type { ListPublishedCombosQuery } from "../types"
import type { ComboDetailPublic, ComboPublicItem } from "../types/public"
import { parseComboDetailPublic, parseComboPublicList } from "../types/public"

function toQueryString(query: ListPublishedCombosQuery): string {
  const params = new URLSearchParams()
  if (query.page != null) params.set("page", String(query.page))
  if (query.limit != null) params.set("limit", String(query.limit))
  if (query.q?.trim()) params.set("q", query.q.trim())
  if (query.sort) params.set("sort", query.sort)
  const q = params.toString()
  return q ? `?${q}` : ""
}

/**
 * Server-only: GET /combos (public, no auth).
 */
export async function listPublishedCombos(
  query: ListPublishedCombosQuery = {},
): Promise<ComboPublicItem[]> {
  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return []
  }

  const response = await fetch(`${apiUrl}/combos${toQueryString(query)}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null)

  if (!response?.ok) return []
  const payload = (await response.json().catch(() => null)) as unknown
  return parseComboPublicList(payload)
}

/**
 * Server-only: GET /combos/slug/:slug (public).
 */
export async function getComboBySlug(slug: string): Promise<ComboDetailPublic | null> {
  const trimmed = slug?.trim()
  if (!trimmed) return null

  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return null
  }

  const response = await fetch(`${apiUrl}/combos/slug/${encodeURIComponent(trimmed)}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null)

  if (!response?.ok) return null
  const payload = (await response.json().catch(() => null)) as unknown
  return parseComboDetailPublic(payload)
}
