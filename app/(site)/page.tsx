import type { Metadata } from "next"

import { Banner } from "@/components/layout/banner"
import type { CategoryItem } from "@/features/category/types"
import { ComboCatalog } from "@/features/combo/components/combo-catalog"
import { comboCatalogMessagesVi } from "@/features/combo/messages/combo-catalog"
import { listPublishedCombos } from "@/features/combo/services/combo-public.service"
import { CourseCatalog } from "@/features/course/components/course-catalog"
import type { CourseCatalogItem, CoursePublicItem } from "@/features/course/types"
import { getApiBaseUrl } from "@/lib/env"

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Khám phá khóa học theo danh mục và combo đang mở bán.",
}

type ApiListResponse<T> = {
  data?: T[]
}

const pageMessages = {
  categoryDescription: "Danh sách khóa học nổi bật và được cập nhật thường xuyên.",
  emptyCategory: "Danh mục này chưa có khóa học đang mở bán.",
}

const viCatalogMessages = {
  gridHeading: "Tất cả khóa học",
  gridDescription: "Danh sách khóa học nổi bật và được cập nhật thường xuyên.",
  courseFallbackTitle: "Khóa học",
  openCourse: "Xem khóa học",
  bestseller: "Bán chạy",
  lessonCount: "{count} bài học",
  lessonsInTitle: "({count} bài)",
  instructorPrefix: "Giảng viên:",
  ratingPrefix: "Đánh giá:",
  outOfFive: "trên 5",
  reviews: "{count} đánh giá",
  priceFree: "Miễn phí",
} as const

function readArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const data = (payload as ApiListResponse<T>).data
    if (Array.isArray(data)) return data
  }
  return []
}

function toCatalogItem(course: CoursePublicItem): CourseCatalogItem {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    summary: course.summary ?? null,
    thumbnail: course.thumbnail ?? null,
    price: course.price ?? 0,
    oldPrice: course.oldPrice ?? null,
    createdAt: course.createdAt,
    lessonCount: 0,
    instructorName: "N/A",
    rating: 0,
    reviewCount: 0,
    isBestseller: false,
  }
}

async function fetchJson<T>(path: string): Promise<T | null> {
  let apiUrl: string
  try {
    apiUrl = getApiBaseUrl()
  } catch {
    return null
  }

  const response = await fetch(`${apiUrl}${path}`, {
    method: "GET",
    cache: "no-store",
  }).catch(() => null)

  if (!response?.ok) return null
  return (await response.json().catch(() => null)) as T | null
}

export default async function Home() {
  const [categoriesPayload, combos] = await Promise.all([
    fetchJson<unknown>("/categories"),
    listPublishedCombos({ page: 1, limit: 20, sort: "created_desc" }),
  ])

  const categories = readArray<CategoryItem>(categoriesPayload)

  const categoryCatalogs = await Promise.all(
    categories.map(async (category) => {
      const coursesPayload = await fetchJson<unknown>(
        `/courses?categoryId=${encodeURIComponent(category.id)}`,
      )
      const courses = readArray<CoursePublicItem>(coursesPayload).map(toCatalogItem)
      return { category, courses }
    }),
  )

  const firstCategoryIdWithCourses = categoryCatalogs.find(
    (row) => row.category && row.courses.length > 0,
  )?.category?.id

  return (
    <div className="Home w-full">
      <Banner />

      <div className=" w-full px-4 py-10 md:px-6">

        <div className="w-full max-w-[1180px] mx-auto flex flex-col gap-10">
          {/* <FeedbackTestimonials
          messages={feedbackTestimonialsMessagesVi}
          items={mockFeedbackTestimonialsVi}
        /> */}
          <ComboCatalog combos={combos} messages={comboCatalogMessagesVi} />
          {categoryCatalogs.map(({ category, courses }) =>
            category && courses.length > 0 ? (
              <CourseCatalog
                key={category.id}
                sectionId={category.id === firstCategoryIdWithCourses ? "khoa-hoc" : undefined}
                messages={{
                  ...viCatalogMessages,
                  gridHeading: category.title,
                  gridDescription: pageMessages.categoryDescription,
                }}
                courses={courses}
              />
            ) : null,
          )}
        </div>
      </div >
    </div>
  )
}
