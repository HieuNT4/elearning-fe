import { z } from "zod"

export const comboValidationMessages = {
  en: {
    titleRequired: "Title is required",
    titleMax: "Title must be at most 200 characters",
    descriptionMax: "Description must be at most 2000 characters",
    thumbnailMax: "Thumbnail must be at most 2000 characters",
    priceMin: "Price must be greater than or equal to 0",
    courseIdsMin: "At least one course must be selected",
    courseIdInvalid: "Invalid course id",
    duplicateCourseIds: "Duplicate course ids are not allowed",
  },
  ja: {
    titleRequired: "タイトルは必須です",
    titleMax: "タイトルは200文字以内で入力してください",
    descriptionMax: "説明は2000文字以内で入力してください",
    thumbnailMax: "サムネイルは2000文字以内で入力してください",
    priceMin: "価格は0以上で入力してください",
    courseIdsMin: "少なくとも1つのコースを選択してください",
    courseIdInvalid: "無効なコースIDです",
    duplicateCourseIds: "重複したコースIDは選択できません",
  },
} as const

const m = comboValidationMessages.en

/** Create / edit combo modal: fields + at least one course. New combos stay unpublished until toggled in the table. */
export const comboModalSchema = z
  .object({
    title: z.string().trim().min(1, m.titleRequired).max(200, m.titleMax),
    description: z
      .string()
      .trim()
      .max(2000, m.descriptionMax)
      .optional()
      .or(z.literal("")),
    thumbnail: z
      .string()
      .trim()
      .max(2000, m.thumbnailMax)
      .optional()
      .or(z.literal("")),
    price: z.number().min(0, m.priceMin),
    courseIds: z
      .array(z.string().uuid(m.courseIdInvalid))
      .min(1, m.courseIdsMin)
      .refine((value) => new Set(value).size === value.length, {
        message: m.duplicateCourseIds,
      }),
  })
  .strict()

export type ComboModalFormData = z.infer<typeof comboModalSchema>
