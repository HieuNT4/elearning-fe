"use client"

import type {
  AdminUserItem,
  AdminUserListMeta,
  AdminUserListQuery,
  AdminUserListResponse,
  CreateUserPayload,
  UpdateUserActivePayload,
} from "../types"

function toQueryString(query: AdminUserListQuery): string {
  const params = new URLSearchParams()
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.q?.trim()) params.set("q", query.q.trim())
  const q = params.toString()
  return q ? `?${q}` : ""
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | { error?: string } | null
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? (data.error ?? "Request failed")
        : "Request failed"
    throw new Error(message)
  }
  return data as T
}

function toSafeMeta(
  meta: Partial<AdminUserListMeta> | undefined,
  fallbackPage: number,
  fallbackLimit: number
): AdminUserListMeta {
  return {
    page: Math.max(meta?.page ?? fallbackPage, 1),
    limit: Math.max(meta?.limit ?? fallbackLimit, 1),
    total: Math.max(meta?.total ?? 0, 0),
    totalPages: Math.max(meta?.totalPages ?? 1, 1),
  }
}

export const userAdminService = {
  async listUsers(query: AdminUserListQuery): Promise<AdminUserListResponse> {
    const response = await fetch(`/api/admin/users${toQueryString(query)}`, {
      method: "GET",
      cache: "no-store",
    })

    const raw = await parseJson<unknown>(response)

    if (Array.isArray(raw)) {
      const list = raw as AdminUserItem[]
      const fallbackLimit = query.limit ?? Math.max(list.length, 1)
      return {
        data: list,
        meta: toSafeMeta(undefined, query.page ?? 1, fallbackLimit),
      }
    }

    if (typeof raw === "object" && raw !== null) {
      const candidate = raw as Partial<AdminUserListResponse> & { items?: AdminUserItem[] }
      const data = Array.isArray(candidate.data)
        ? candidate.data
        : Array.isArray(candidate.items)
          ? candidate.items
          : []

      return {
        data,
        meta: toSafeMeta(candidate.meta, query.page ?? 1, query.limit ?? 10),
      }
    }

    return {
      data: [],
      meta: toSafeMeta(undefined, query.page ?? 1, query.limit ?? 10),
    }
  },

  createUser(payload: CreateUserPayload): Promise<AdminUserItem> {
    return fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<AdminUserItem>(response))
  },

  updateActive(id: string, payload: UpdateUserActivePayload): Promise<AdminUserItem> {
    return fetch(`/api/admin/users/${id}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<AdminUserItem>(response))
  },
}
