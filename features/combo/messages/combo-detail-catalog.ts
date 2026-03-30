import type { CatalogMessages } from "@/features/course/messages/catalog"

export type ComboDetailCatalogLocale = "vi" | "en" | "ja"

const baseVi: Omit<CatalogMessages, "gridHeading"> = {
  gridDescription: "Các khóa học bạn sẽ được học sau khi thanh toán thành công.",
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
}

const baseEn: Omit<CatalogMessages, "gridHeading"> = {
  gridDescription: "Courses you get access to after successful payment.",
  courseFallbackTitle: "Course",
  openCourse: "View course",
  bestseller: "Bestseller",
  lessonCount: "{count} lessons",
  lessonsInTitle: "({count} lessons)",
  instructorPrefix: "Instructor:",
  ratingPrefix: "Rating:",
  outOfFive: "out of 5",
  reviews: "{count} reviews",
  priceFree: "Free",
}

const baseJa: Omit<CatalogMessages, "gridHeading"> = {
  gridDescription: "お支払い完了後にアクセスできるコースです。",
  courseFallbackTitle: "コース",
  openCourse: "コースを見る",
  bestseller: "ベストセラー",
  lessonCount: "{count} レッスン",
  lessonsInTitle: "（{count} レッスン）",
  instructorPrefix: "インストラクター:",
  ratingPrefix: "評価:",
  outOfFive: "5点満点中",
  reviews: "{count} 件のレビュー",
  priceFree: "無料",
}

/**
 * CourseCatalog messages for combo detail; heading includes the combo name.
 */
export function getComboDetailCatalogMessages(
  comboTitle: string,
  locale: ComboDetailCatalogLocale = "vi",
): CatalogMessages {
  const name = comboTitle.trim() || (locale === "ja" ? "コンボ" : locale === "en" ? "Bundle" : "Combo")
  const gridHeading =
    locale === "en"
      ? `Courses in the ${name} bundle`
      : locale === "ja"
        ? `コンボ「${name}」に含まれるコース`
        : `Các khoá học trong combo ${name}`

  if (locale === "en") {
    return { ...baseEn, gridHeading }
  }
  if (locale === "ja") {
    return { ...baseJa, gridHeading }
  }
  return { ...baseVi, gridHeading }
}

export const comboDetailEmptyCoursesVi =
  "Danh sách khóa học đang được cập nhật hoặc chưa có dữ liệu chi tiết."
export const comboDetailEmptyCoursesEn =
  "The course list is being updated or detailed data is not available yet."
export const comboDetailEmptyCoursesJa = "コース一覧を更新中か、詳細データがありません。"
