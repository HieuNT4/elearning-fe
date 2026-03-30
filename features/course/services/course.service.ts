"use client"

import type {
  AdminCourseListQuery,
  AdminCourseListResponse,
  CourseItem,
  UpsertCoursePayload,
  UpdateCoursePayload,
} from "../types"

function toQueryString(query: AdminCourseListQuery): string {
  const params = new URLSearchParams()
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.q?.trim()) params.set("q", query.q.trim())
  if (query.sort) params.set("sort", query.sort)
  if (query.categoryId?.trim()) params.set("categoryId", query.categoryId.trim())
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

export const courseService = {
  listAdminCourses(query: AdminCourseListQuery): Promise<AdminCourseListResponse> {
    return fetch(`/api/admin/courses${toQueryString(query)}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<AdminCourseListResponse>(response))
  },

  getCourseById(id: string): Promise<CourseItem> {
    return fetch(`/api/admin/courses/${id}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<CourseItem>(response))
  },

  createCourse(payload: UpsertCoursePayload): Promise<CourseItem> {
    return fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<CourseItem>(response))
  },

  updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseItem> {
    return fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<CourseItem>(response))
  },

  togglePublish(id: string): Promise<CourseItem> {
    return fetch(`/api/admin/courses/${id}/publish`, {
      method: "POST",
    }).then((response) => parseJson<CourseItem>(response))
  },

  deleteCourse(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
    }).then((response) => parseJson<{ success: boolean }>(response))
  },
}
