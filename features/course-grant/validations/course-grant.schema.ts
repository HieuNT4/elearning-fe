import { z } from "zod"

export const courseGrantValidationMessages = {
  en: {
    email: "Valid email is required",
    courseIdsMin: "Select at least one course",
    courseIdUuid: "Each course id must be a valid UUID",
  },
  ja: {
    email: "有効なメールアドレスが必要です",
    courseIdsMin: "少なくとも1つのコースを選択してください",
    courseIdUuid: "各コースIDは有効なUUIDである必要があります",
  },
} as const

const m = courseGrantValidationMessages.en

export const courseGrantsAddSchema = z.object({
  email: z.string().trim().email(m.email),
  courseIds: z.array(z.string().uuid(m.courseIdUuid)).min(1, m.courseIdsMin),
})

export const courseGrantsSetSchema = z.object({
  email: z.string().trim().email(m.email),
  courseIds: z.array(z.string().uuid(m.courseIdUuid)),
})

export type CourseGrantsAddFormData = z.infer<typeof courseGrantsAddSchema>
export type CourseGrantsSetFormData = z.infer<typeof courseGrantsSetSchema>
