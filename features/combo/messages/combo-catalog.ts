export type ComboCatalogLocale = "en" | "ja"

export type ComboCatalogMessages = {
  sectionHeading: string
  sectionDescription: string
  newBadge: string
  courseCount: string
  lessonCount: string
  questionCount: string
  learnMore: string
  buyNow: string
  instructorLine: string
  /** Accessible name for the course name list on combo cards */
  courseListLabel: string
  priceFree: string
  empty: string
}

export const comboCatalogMessages: Record<ComboCatalogLocale, ComboCatalogMessages> = {
  en: {
    sectionHeading: "Combo packages",
    sectionDescription: "Save more with curated course bundles.",
    newBadge: "NEW",
    courseCount: "{count} courses",
    lessonCount: "{count} lessons",
    questionCount: "{count} questions",
    learnMore: "Learn more",
    buyNow: "Buy now",
    instructorLine: "{count} courses in bundle",
    courseListLabel: "Courses in this bundle",
    priceFree: "Free",
    empty: "No combo packages available yet.",
  },
  ja: {
    sectionHeading: "コンボパック",
    sectionDescription: "お得なコースバンドルをご用意しています。",
    newBadge: "NEW",
    courseCount: "{count} コース",
    lessonCount: "{count} レッスン",
    questionCount: "{count} 問",
    learnMore: "詳しく見る",
    buyNow: "今すぐ購入",
    instructorLine: "バンドル内 {count} コース",
    courseListLabel: "このバンドルのコース",
    priceFree: "無料",
    empty: "表示できるコンボはまだありません。",
  },
}

/** Vietnamese copy for the site default locale (vi). */
export const comboCatalogMessagesVi = {
  sectionHeading: "Combo khóa học",
  sectionDescription: "Gói ưu đãi nhiều khóa học trong một — học chủ động, tiết kiệm hơn.",
  newBadge: "NEW",
  courseCount: "{count} khóa học",
  lessonCount: "{count} bài giảng",
  questionCount: "{count} câu hỏi",
  learnMore: "Tìm hiểu thêm",
  buyNow: "Mua ngay",
  instructorLine: "Gói gồm {count} khóa học",
  courseListLabel: "Khóa học trong gói",
  priceFree: "Miễn phí",
  empty: "Chưa có combo nào đang mở bán.",
} as const

export type ComboCatalogMessagesVi = typeof comboCatalogMessagesVi
