/**
 * Aligns with backend CreateCategoryDto / category entity (OpenAPI).
 */
export type CategoryItem = {
  id: string
  title: string
  slug: string
  createdAt?: string
  updatedAt?: string
}

export type CreateCategoryPayload = {
  title: string
  slug?: string
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>
