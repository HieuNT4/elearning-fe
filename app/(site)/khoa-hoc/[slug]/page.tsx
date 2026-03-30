import type { Metadata } from "next"
import Link from "next/link"

import { CourseLearningScreen } from "@/features/course/components/course-learning-screen"
import { getApiBaseUrl } from "@/lib/env"

type CourseLearningPageProps = {
  params: Promise<{ slug: string }>
}

type LessonPartView = {
  id: string
  title: string
  videoUrl: string | null
  videoType: "youtube" | "vimeo" | "iframe" | "html5"
  isPreview: boolean
  /** Video length in seconds (optional, from API) */
  durationSeconds?: number
}

type LessonView = {
  id: string
  title: string
  orderIndex: number
  lessonParts: LessonPartView[]
}

type ChapterView = {
  id: string
  title: string
  orderIndex: number
  lessons: LessonView[]
}

type CourseDetailView = {
  id: string
  title: string
  summary: string | null
  price: number
  chapters: ChapterView[]
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  return ""
}

function toBoolean(value: unknown): boolean {
  return value === true
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  return fallback
}

function pickData(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data
  }
  return payload
}

function parseCourseDetail(payload: unknown): CourseDetailView | null {
  const raw = pickData(payload)
  if (!raw || typeof raw !== "object") return null
  const data = raw as Record<string, unknown>

  const chaptersRaw = Array.isArray(data.chapters) ? data.chapters : []
  const chapters: ChapterView[] = chaptersRaw
    .map((chapterRaw) => {
      if (!chapterRaw || typeof chapterRaw !== "object") return null
      const chapter = chapterRaw as Record<string, unknown>
      const lessonsRaw = Array.isArray(chapter.lessons) ? chapter.lessons : []
      const lessons: LessonView[] = lessonsRaw
        .map((lessonRaw) => {
          if (!lessonRaw || typeof lessonRaw !== "object") return null
          const lesson = lessonRaw as Record<string, unknown>
          const lessonPartsRaw = Array.isArray(lesson.lessonParts) ? lesson.lessonParts : []
          const lessonParts: LessonPartView[] = lessonPartsRaw
            .map((partRaw) => {
              if (!partRaw || typeof partRaw !== "object") return null
              const part = partRaw as Record<string, unknown>
              const videoType = toStringValue(part.videoType)
              const durationRaw = part.durationSeconds ?? part.duration
              const durationSeconds =
                typeof durationRaw === "number" && Number.isFinite(durationRaw) && durationRaw > 0
                  ? durationRaw
                  : undefined
              const item: LessonPartView = {
                id: toStringValue(part.id),
                title: toStringValue(part.title),
                videoUrl: toStringValue(part.videoUrl) || null,
                videoType:
                  videoType === "youtube" || videoType === "vimeo" || videoType === "iframe"
                    ? videoType
                    : "html5",
                isPreview: toBoolean(part.isPreview),
              }
              if (durationSeconds !== undefined) {
                item.durationSeconds = durationSeconds
              }
              return item
            })
            .filter((part): part is LessonPartView => part !== null && part.id.length > 0)
          return {
            id: toStringValue(lesson.id),
            title: toStringValue(lesson.title) || "Bài học",
            orderIndex: toNumber(lesson.orderIndex),
            lessonParts,
          }
        })
        .filter((lesson): lesson is LessonView => lesson !== null && lesson.id.length > 0)
      return {
        id: toStringValue(chapter.id),
        title: toStringValue(chapter.title) || "Chương học",
        orderIndex: toNumber(chapter.orderIndex),
        lessons,
      }
    })
    .filter((chapter): chapter is ChapterView => chapter !== null && chapter.id.length > 0)

  return {
    id: toStringValue(data.id),
    title: toStringValue(data.title) || "Khóa học",
    summary: toStringValue(data.summary) || null,
    price: toNumber(data.price, 0),
    chapters,
  }
}

async function fetchCourseBySlug(slug: string): Promise<CourseDetailView | null> {
  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return null
  }

  const response = await fetch(`${apiUrl}/courses/slug/${encodeURIComponent(slug)}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null)

  if (!response?.ok) return null
  const payload = (await response.json().catch(() => null)) as unknown
  return parseCourseDetail(payload)
}

export async function generateMetadata({ params }: CourseLearningPageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await fetchCourseBySlug(slug)
  return {
    title: course?.title ?? "Học tập",
    description: course?.summary ?? "Màn hình học tập trực tuyến.",
  }
}

export default async function CourseLearningPage({ params }: CourseLearningPageProps) {
  const { slug } = await params
  const course = await fetchCourseBySlug(slug)

  if (!course) {
    return (
      <div className="CourseLearningPage mx-auto w-full max-w-[1180px] px-4 py-16 md:px-6">
        <p className="text-sm leading-normal text-muted-foreground">Không tìm thấy khóa học.</p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Quay lại trang chủ
        </Link>
      </div>
    )
  }

  return (
    <CourseLearningScreen
      courseId={course.id}
      courseSlug={slug}
      courseTitle={course.title}
      coursePrice={course.price}
      chapters={course.chapters}
    />
  )
}
