"use client"

import type {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types"

function normalizeList(data: unknown): CategoryItem[] {
  if (Array.isArray(data)) {
    return data as CategoryItem[]
  }
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: CategoryItem[] }).data
  }
  return []
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | { error?: string; message?: string } | null
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error?: string }).error ?? "Request failed")
        : typeof data === "object" && data && "message" in data
          ? String((data as { message?: string }).message ?? "Request failed")
          : "Request failed"
    throw new Error(message)
  }
  return data as T
}

export const categoryAdminService = {
  listCategories(): Promise<CategoryItem[]> {
    return fetch("/api/admin/categories", {
      method: "GET",
      cache: "no-store",
    }).then(async (response) => {
      const raw = await parseJson<unknown>(response)
      return normalizeList(raw)
    })
  },

  createCategory(payload: CreateCategoryPayload): Promise<CategoryItem> {
    const body: CreateCategoryPayload = {
      title: payload.title,
      ...(payload.slug?.trim() ? { slug: payload.slug.trim() } : {}),
    }
    return fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((response) => parseJson<CategoryItem>(response))
  },

  updateCategory(id: string, payload: UpdateCategoryPayload): Promise<CategoryItem> {
    const body: Record<string, string> = {}
    if (payload.title !== undefined) body.title = payload.title.trim()
    if (payload.slug !== undefined && payload.slug.trim()) body.slug = payload.slug.trim()
    return fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((response) => parseJson<CategoryItem>(response))
  },

  deleteCategory(id: string): Promise<void> {
    return fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    }).then(async (response) => {
      if (response.ok) return
      const data = (await response.json().catch(() => null)) as { error?: string; message?: string } | null
      const message =
        typeof data === "object" && data && "error" in data
          ? String(data.error ?? "Request failed")
          : typeof data === "object" && data && "message" in data
            ? String(data.message ?? "Request failed")
            : "Request failed"
      throw new Error(message)
    })
  },
}
