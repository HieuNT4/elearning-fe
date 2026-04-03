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
    importLessonsMin: "At least one lesson is required",
    importPartsMin: "Each lesson needs at least one part",
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
    importLessonsMin: "レッスンは1件以上必要です",
    importPartsMin: "各レッスンには少なくとも1つのパートが必要です",
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

const importPartSchema = z.object({
  title: z.string().trim().min(1, m.titleRequired).max(300),
  videoUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  videoType: z.enum(["youtube", "iframe", "vimeo"]).optional(),
  documentUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  isPreview: z.boolean().optional(),
  orderIndex: z.number().int().min(1, m.orderMin).optional(),
})

const importLessonSchema = z.object({
  title: z.string().trim().min(1, m.titleRequired).max(300),
  orderIndex: z.number().int().min(1, m.orderMin).optional(),
  parts: z.array(importPartSchema).min(1, m.importPartsMin),
})

export const chapterImportSchema = z.object({
  courseId: z.string().uuid(m.courseId),
  chapterOrderIndex: z.number().int().min(1, m.orderMin),
  chapterTitle: z.string().trim().min(1, m.titleRequired).max(300),
  lessons: z.array(importLessonSchema).min(1, m.importLessonsMin),
})

export type ChapterImportFormData = z.infer<typeof chapterImportSchema>

export type CreateLessonFormData = z.infer<typeof createLessonSchema>
export type CreateLessonPartFormData = z.infer<typeof createLessonPartSchema>
export type UpdateLessonPartFormData = z.infer<typeof updateLessonPartSchema>
