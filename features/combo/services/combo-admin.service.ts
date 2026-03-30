"use client"

import type { CourseItem } from "@/features/course/types"

import type {
  AdminComboListQuery,
  AdminComboListResponse,
  ComboItem,
  CreateComboPayload,
  UpdateComboPayload,
} from "../types"

function parseErrorMessage(data: unknown): string {
  if (typeof data === "object" && data && "error" in data) {
    return String((data as { error?: unknown }).error ?? "Request failed")
  }
  if (typeof data === "object" && data && "message" in data) {
    return String((data as { message?: unknown }).message ?? "Request failed")
  }
  return "Request failed"
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | unknown
  if (!response.ok) {
    throw new Error(parseErrorMessage(data))
  }
  return data as T
}

async function parseVoid(response: Response): Promise<void> {
  if (response.ok) return
  const data = (await response.json().catch(() => null)) as unknown
  throw new Error(parseErrorMessage(data))
}

function toQueryString(query: AdminComboListQuery): string {
  const params = new URLSearchParams()
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.q?.trim()) params.set("q", query.q.trim())
  if (query.sort) params.set("sort", query.sort)
  const q = params.toString()
  return q ? `?${q}` : ""
}

function normalizeCourseList(data: unknown): CourseItem[] {
  if (Array.isArray(data)) {
    return data as CourseItem[]
  }
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    return (data as { data: CourseItem[] }).data
  }
  return []
}

export const comboAdminService = {
  listAdminCombos(query: AdminComboListQuery): Promise<AdminComboListResponse> {
    return fetch(`/api/admin/combos${toQueryString(query)}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<AdminComboListResponse>(response))
  },

  createCombo(payload: CreateComboPayload): Promise<ComboItem> {
    return fetch("/api/admin/combos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }).then((response) => parseJson<ComboItem>(response))
  },

  getComboById(id: string): Promise<ComboItem> {
    return fetch(`/api/admin/combos/${id}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<ComboItem>(response))
  },

  updateCombo(id: string, payload: UpdateComboPayload): Promise<ComboItem> {
    return fetch(`/api/admin/combos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }).then((response) => parseJson<ComboItem>(response))
  },

  deleteCombo(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/admin/combos/${id}`, {
      method: "DELETE",
      cache: "no-store",
    }).then((response) => parseJson<{ success: boolean }>(response))
  },

  togglePublish(id: string): Promise<ComboItem> {
    return fetch(`/api/admin/combos/${id}/publish`, {
      method: "POST",
      cache: "no-store",
    }).then((response) => parseJson<ComboItem>(response))
  },

  listComboCourses(comboId: string): Promise<CourseItem[]> {
    return fetch(`/api/admin/combos/${comboId}/courses`, {
      method: "GET",
      cache: "no-store",
    }).then(async (response) => {
      const raw = await parseJson<unknown>(response)
      return normalizeCourseList(raw)
    })
  },

  addCoursesToCombo(id: string, courseIds: string[]): Promise<void> {
    return fetch(`/api/admin/combos/${id}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds }),
      cache: "no-store",
    }).then((response) => parseVoid(response))
  },

  removeCourseFromCombo(id: string, courseId: string): Promise<void> {
    return fetch(`/api/admin/combos/${id}/courses/${courseId}`, {
      method: "DELETE",
      cache: "no-store",
    }).then((response) => parseVoid(response))
  },
}
