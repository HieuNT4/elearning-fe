"use client"

import type {
  ChapterDetail,
  ChapterItem,
  CreateChapterPayload,
  LessonItem,
  LessonPartItem,
  CreateLessonPayload,
  UpdateChapterPayload,
  UpdateLessonPayload,
  CreateLessonPartPayload,
  UpdateLessonPartPayload,
} from "../types"

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

export const chapterLessonService = {
  listChaptersByCourse(courseId: string): Promise<ChapterItem[]> {
    return fetch(`/api/admin/chapters/course/${courseId}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<ChapterItem[]>(response))
  },

  getChapterDetail(id: string): Promise<ChapterDetail> {
    return fetch(`/api/admin/chapters/${id}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<ChapterDetail>(response))
  },

  createChapter(payload: CreateChapterPayload): Promise<ChapterItem> {
    return fetch("/api/admin/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<ChapterItem>(response))
  },

  updateChapter(id: string, payload: UpdateChapterPayload): Promise<ChapterItem> {
    return fetch(`/api/admin/chapters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<ChapterItem>(response))
  },

  deleteChapter(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/admin/chapters/${id}`, {
      method: "DELETE",
    }).then((response) => parseJson<{ success: boolean }>(response))
  },

  listLessonsByChapter(chapterId: string): Promise<LessonItem[]> {
    return fetch(`/api/admin/lessons/chapter/${chapterId}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<LessonItem[]>(response))
  },

  createLesson(payload: CreateLessonPayload): Promise<LessonItem> {
    return fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<LessonItem>(response))
  },

  updateLesson(id: string, payload: UpdateLessonPayload): Promise<LessonItem> {
    return fetch(`/api/admin/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<LessonItem>(response))
  },

  deleteLesson(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/admin/lessons/${id}`, {
      method: "DELETE",
    }).then((response) => parseJson<{ success: boolean }>(response))
  },

  listLessonPartsByLesson(lessonId: string): Promise<LessonPartItem[]> {
    return fetch(`/api/admin/lesson-parts/lesson/${lessonId}`, {
      method: "GET",
      cache: "no-store",
    }).then((response) => parseJson<LessonPartItem[]>(response))
  },

  createLessonPart(payload: CreateLessonPartPayload): Promise<LessonPartItem> {
    return fetch("/api/admin/lesson-parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<LessonPartItem>(response))
  },

  updateLessonPart(
    id: string,
    payload: UpdateLessonPartPayload
  ): Promise<LessonPartItem> {
    return fetch(`/api/admin/lesson-parts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => parseJson<LessonPartItem>(response))
  },

  deleteLessonPart(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/admin/lesson-parts/${id}`, {
      method: "DELETE",
    }).then((response) => parseJson<{ success: boolean }>(response))
  },
}
