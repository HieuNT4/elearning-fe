import { z } from "zod"

export const courseValidationMessages = {
  en: {
    titleRequired: "Title is required",
    titleMin: "Title must be at least 2 characters",
    summaryMax: "Summary must be at most 500 characters",
    thumbnailUrl: "Thumbnail must be a valid URL",
    priceMin: "Price must be greater than or equal to 0",
    oldPriceMin: "Old price must be greater than or equal to 0",
    categoryRequired: "Category is required",
    categoryIdInvalid: "Select a valid category",
  },
  ja: {
    titleRequired: "タイトルは必須です",
    titleMin: "タイトルは2文字以上で入力してください",
    summaryMax: "概要は500文字以内で入力してください",
    thumbnailUrl: "サムネイルは有効なURLである必要があります",
    priceMin: "価格は0以上である必要があります",
    oldPriceMin: "旧価格は0以上である必要があります",
    categoryRequired: "カテゴリは必須です",
    categoryIdInvalid: "有効なカテゴリを選択してください",
  },
} as const

const m = courseValidationMessages.en

export const createCourseSchema = z.object({
  categoryId: z.union([z.literal(""), z.string().uuid(m.categoryIdInvalid)]),
  title: z.string().trim().min(1, m.titleRequired).min(2, m.titleMin),
  summary: z.string().trim().max(500, m.summaryMax).optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  thumbnail: z.string().trim().url(m.thumbnailUrl).optional().or(z.literal("")),
  price: z.number().min(0, m.priceMin),
  oldPrice: z.number().min(0, m.oldPriceMin).optional(),
})

export const updateCourseSchema = createCourseSchema
  .partial()
  .extend({
    isPublished: z.boolean().optional(),
  })

export type CreateCourseFormData = z.infer<typeof createCourseSchema>
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>
