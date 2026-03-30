export type CourseCatalogItem = {
  id: string
  title: string
  slug: string
  summary: string | null
  thumbnail: string | null
  price: number
  oldPrice: number | null
  createdAt: string
  lessonCount: number
  instructorName: string
  rating: number
  reviewCount: number
  isBestseller?: boolean
}
