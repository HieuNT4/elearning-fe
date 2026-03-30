export type ComboItem = {
  id: string
  title: string
  description?: string | null
  thumbnail?: string | null
  price: number
  isPublished: boolean
  createdAt?: string
  updatedAt?: string
}

export type ComboSort =
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"
  | "created_desc"

export type ComboListMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type AdminComboListResponse = {
  data: ComboItem[]
  meta: ComboListMeta
}

export type AdminComboListQuery = {
  page?: number
  limit?: number
  q?: string
  sort?: ComboSort
}

/** Query params for public GET /combos */
export type ListPublishedCombosQuery = {
  page?: number
  limit?: number
  q?: string
  sort?: ComboSort
}

export type CreateComboPayload = {
  title: string
  description?: string
  thumbnail?: string
  price: number
}

export type UpdateComboPayload = Partial<CreateComboPayload> & {
  isPublished?: boolean
}
