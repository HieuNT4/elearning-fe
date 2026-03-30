import { z } from "zod"

export const categoryValidationMessages = {
  en: {
    titleRequired: "Title is required",
    titleMax: "Title must be at most 200 characters",
    slugMax: "Slug must be at most 200 characters",
    slugInvalid:
      "Slug must be lowercase letters, numbers, and hyphens only (e.g. lap-trinh-web)",
  },
  ja: {
    titleRequired: "タイトルは必須です",
    titleMax: "タイトルは200文字以内で入力してください",
    slugMax: "スラッグは200文字以内で入力してください",
    slugInvalid: "スラッグは小文字・数字・ハイフンのみ使用できます",
  },
} as const

const m = categoryValidationMessages.en

export const createCategorySchema = z.object({
  title: z.string().trim().min(1, m.titleRequired).max(200, m.titleMax),
  slug: z
    .string()
    .trim()
    .max(200, m.slugMax)
    .refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      m.slugInvalid
    ),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
