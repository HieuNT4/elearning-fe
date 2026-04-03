"use client"

import { getApiErrorMessage } from "@/lib/api/get-api-error-message"

import type {
  CourseGrantsAdminResponse,
  CourseGrantsEmailCourseIdsPayload,
} from "../types"

async function parseJson<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `Request failed (${response.status})`)
    )
  }
  return data as T
}

export const courseGrantAdminService = {
  getByEmail(email: string): Promise<CourseGrantsAdminResponse> {
    const params = new URLSearchParams({ email: email.trim().toLowerCase() })
    return fetch(`/api/admin/course-grants?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<CourseGrantsAdminResponse>(response))
  },

  addCourses(payload: CourseGrantsEmailCourseIdsPayload): Promise<CourseGrantsAdminResponse> {
    const body = {
      email: payload.email.trim().toLowerCase(),
      courseIds: payload.courseIds,
    }
    return fetch("/api/admin/course-grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((response) => parseJson<CourseGrantsAdminResponse>(response))
  },

  setCourses(payload: CourseGrantsEmailCourseIdsPayload): Promise<CourseGrantsAdminResponse> {
    const body = {
      email: payload.email.trim().toLowerCase(),
      courseIds: payload.courseIds,
    }
    return fetch("/api/admin/course-grants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((response) => parseJson<CourseGrantsAdminResponse>(response))
  },

  revokeOne(email: string, courseId: string): Promise<CourseGrantsAdminResponse> {
    const params = new URLSearchParams({
      email: email.trim().toLowerCase(),
      courseId,
    })
    return fetch(`/api/admin/course-grants?${params.toString()}`, {
      method: "DELETE",
    }).then((response) => parseJson<CourseGrantsAdminResponse>(response))
  },
}
