import type { CategoryItem } from "@/features/category/types"

export type { CategoryItem }

export type CourseCategorySummary = Pick<CategoryItem, "id" | "title" | "slug">

export type CourseSort =
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"
  | "created_desc"

export type CourseItem = {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  thumbnail: string | null
  price: number
  oldPrice: number | null
  isPublished: boolean
  categoryId: string | null
  category?: CourseCategorySummary | null
  createdAt: string
  updatedAt: string
}

export type CourseListMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type AdminCourseListResponse = {
  data: CourseItem[]
  meta: CourseListMeta
}

export type AdminCourseListQuery = {
  page?: number
  limit?: number
  q?: string
  sort?: CourseSort
  categoryId?: string
}

export type UpsertCoursePayload = {
  categoryId?: string
  title: string
  summary?: string
  description?: string
  thumbnail?: string
  price: number
  oldPrice?: number
}

export type UpdateCoursePayload = Partial<
  UpsertCoursePayload & {
    isPublished: boolean
  }
>

export type CoursePublicItem = {
  id: string
  title: string
  slug: string
  summary: string | null
  thumbnail: string | null
  price: number
  oldPrice: number | null
  createdAt: string
}

export type ChapterItem = {
  id: string
  courseId: string
  title: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type LessonVideoType = "youtube" | "iframe" | "vimeo"

export type LessonItem = {
  id: string
  chapterId: string
  title: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type LessonPartItem = {
  id: string
  lessonId: string
  title: string
  videoUrl: string | null
  videoType: LessonVideoType
  documentUrl: string | null
  orderIndex: number
  isPreview: boolean
  createdAt: string
  updatedAt: string
}

export type LessonWithParts = LessonItem & {
  lessonParts: LessonPartItem[]
}

export type ChapterDetail = ChapterItem & {
  lessons: LessonWithParts[]
}

export type CreateChapterPayload = {
  courseId: string
  title: string
  orderIndex: number
}

export type UpdateChapterPayload = Partial<CreateChapterPayload>

export type CreateLessonPayload = {
  chapterId: string
  title: string
  orderIndex: number
}

export type UpdateLessonPayload = Partial<CreateLessonPayload>

export type CreateLessonPartPayload = {
  lessonId: string
  title: string
  videoUrl?: string
  videoType: LessonVideoType
  documentUrl?: string
  orderIndex: number
  isPreview?: boolean
}

export type UpdateLessonPartPayload = Partial<CreateLessonPartPayload>

export type { CourseCatalogItem } from "./catalog"
