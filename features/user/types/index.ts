export type AdminUserItem = {
  id: string
  email: string
  isActive: boolean
  role?: string
  createdAt?: string
  updatedAt?: string
  totalPaid?: number
  totalSpent?: number
  paidAmount?: number
  courses?: Array<{
    id?: string
    title?: string
    name?: string
  }>
  purchasedCourses?: Array<{
    id?: string
    title?: string
    name?: string
  }>
  orders?: Array<{
    totalAmount?: number
    amount?: number
    finalAmount?: number
    status?: string
    paidAt?: string | null
    isPaid?: boolean
    items?: Array<{
      courseId?: string
      courseTitle?: string
      title?: string
      course?: {
        id?: string
        title?: string
        name?: string
      }
    }>
  }>
}

export type AdminUserListQuery = {
  page?: number
  limit?: number
  q?: string
}

export type AdminUserListMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminUserListResponse = {
  data: AdminUserItem[]
  meta: AdminUserListMeta
}

export type CreateUserPayload = {
  email: string
  password: string
}

export type UpdateUserActivePayload = {
  isActive: boolean
}
