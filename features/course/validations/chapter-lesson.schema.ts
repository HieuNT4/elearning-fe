import { z } from "zod"

export const chapterLessonValidationMessages = {
  en: {
    courseId: "Course id must be a valid UUID",
    chapterId: "Chapter id must be a valid UUID",
    lessonId: "Lesson id must be a valid UUID",
    titleRequired: "Title is required",
    orderMin: "Order index must be greater than or equal to 1",
    videoTypeRequired: "Video type is required",
    videoUrlInvalid: "Video URL must be valid",
    documentUrlInvalid: "Document URL must be valid",
  },
  ja: {
    courseId: "コースIDは有効なUUIDである必要があります",
    chapterId: "チャプターIDは有効なUUIDである必要があります",
    lessonId: "レッスンIDは有効なUUIDである必要があります",
    titleRequired: "タイトルは必須です",
    orderMin: "表示順は1以上である必要があります",
    videoTypeRequired: "動画タイプは必須です",
    videoUrlInvalid: "動画URLは有効である必要があります",
    documentUrlInvalid: "資料URLは有効である必要があります",
  },
} as const

const m = chapterLessonValidationMessages.en

export const createChapterSchema = z.object({
  courseId: z.string().uuid(m.courseId),
  title: z.string().trim().min(1, m.titleRequired),
  orderIndex: z.number().int().min(1, m.orderMin),
})

export const updateChapterSchema = createChapterSchema.partial()

export const createLessonSchema = z.object({
  chapterId: z.string().uuid(m.chapterId),
  title: z.string().trim().min(1, m.titleRequired),
  orderIndex: z.number().int().min(1, m.orderMin),
})

export const updateLessonSchema = createLessonSchema.partial()

export type CreateChapterFormData = z.infer<typeof createChapterSchema>

export const createLessonPartSchema = z.object({
  lessonId: z.string().uuid(m.lessonId),
  title: z.string().trim().min(1, m.titleRequired),
  videoUrl: z.string().trim().url(m.videoUrlInvalid).optional().or(z.literal("")),
  videoType: z.enum(["youtube", "iframe", "vimeo"], {
    message: m.videoTypeRequired,
  }),
  documentUrl: z
    .string()
    .trim()
    .url(m.documentUrlInvalid)
    .optional()
    .or(z.literal("")),
  orderIndex: z.number().int().min(1, m.orderMin),
  isPreview: z.boolean().optional(),
})

export const updateLessonPartSchema = createLessonPartSchema.partial()

export type CreateLessonFormData = z.infer<typeof createLessonSchema>
export type CreateLessonPartFormData = z.infer<typeof createLessonPartSchema>
export type UpdateLessonPartFormData = z.infer<typeof updateLessonPartSchema>
