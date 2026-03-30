export type CatalogLocale = "en" | "ja"

export type CatalogMessages = {
  gridHeading: string
  gridDescription: string
  courseFallbackTitle: string
  openCourse: string
  bestseller: string
  lessonCount: string
  lessonsInTitle: string
  instructorPrefix: string
  ratingPrefix: string
  outOfFive: string
  reviews: string
  priceFree: string
}

export const catalogMessages: Record<CatalogLocale, CatalogMessages> = {
  en: {
    gridHeading: "All courses",
    gridDescription: "Curated list — more courses added regularly.",
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
  },
  ja: {
    gridHeading: "すべてのコース",
    gridDescription: "厳選リスト — 随時追加予定です。",
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
  },
}
