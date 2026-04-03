"use client"

import { getApiErrorMessage } from "@/lib/api/get-api-error-message"

import type {
  AdminCourseListQuery,
  AdminCourseListResponse,
  CourseItem,
  CourseSort,
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
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `Request failed (${response.status})`)
    )
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

  /**
   * Loads admin courses for pickers (paginates until done or maxItems).
   * Uses the same query shape as other admin screens (sort required by some backends).
   */
  async listAdminCoursesForPicker(maxItems = 500): Promise<CourseItem[]> {
    const sort: CourseSort = "created_desc"
    const limit = 100
    const merged: CourseItem[] = []
    let page = 1
    let totalPages = 1
    do {
      const res = await this.listAdminCourses({ page, limit, sort })
      const batch = res.data ?? []
      merged.push(...batch)
      totalPages = Math.max(res.meta?.totalPages ?? 1, 1)
      if (batch.length < limit) break
      page += 1
    } while (page <= totalPages && merged.length < maxItems)
    return merged.slice(0, maxItems)
  },
}
