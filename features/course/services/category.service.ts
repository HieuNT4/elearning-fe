"use client"

import type { CategoryItem } from "@/features/category/types"

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

async function parseJson(response: Response): Promise<unknown> {
  const data = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error?: string }).error ?? "Request failed")
        : "Request failed"
    throw new Error(message)
  }
  return data
}

/**
 * Public categories list — used in course form / filters (GET /api/categories).
 */
export const categoryService = {
  listCategories(): Promise<CategoryItem[]> {
    return fetch("/api/categories", {
      method: "GET",
      cache: "no-store",
    }).then(async (response) => {
      const raw = await parseJson(response)
      return normalizeList(raw)
    })
  },
}
