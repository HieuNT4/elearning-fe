import type { CourseCatalogItem } from "@/features/course/types/catalog"

/**
 * Published combo as returned by GET /combos and GET /combos/slug/:slug (public).
 * `courses` is an array of course display names (strings).
 * `courseCatalogItems` is populated from `courses[]`, or from `comboItems[].course` (API shape).
 */
export type ComboPublicItem = {
  id: string
  title: string
  /** Required for user-facing detail URL GET /combos/slug/:slug */
  slug: string
  description: string | null
  thumbnail: string | null
  price: number
  createdAt?: string
  /** Course names included in the combo (from `courses` or derived from `comboItems`) */
  courses: string[]
  /** Full course rows for catalog UI when API returns embedded course objects */
  courseCatalogItems: CourseCatalogItem[]
  isPublished?: boolean
  /** When API exposes counts (optional; may also derive from `courses.length`) */
  courseCount?: number
  lessonCount?: number
  questionCount?: number
}

export type ComboDetailPublic = ComboPublicItem

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function toNumberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function pickData(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data
  }
  return payload
}

/**
 * Parses `courses` as string[] or legacy array of objects with `title`.
 */
function parseCourseNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const item of raw) {
    if (typeof item === "string") {
      const t = item.trim()
      if (t) out.push(t)
    } else if (item && typeof item === "object" && "title" in item) {
      const title = (item as { title?: unknown }).title
      if (typeof title === "string" && title.trim()) out.push(title.trim())
    }
  }
  return out
}

/**
 * Maps one API course object to a catalog row (flat `courses[]` or `comboItems[].course`).
 */
function courseRecordToCatalogItem(o: Record<string, unknown>): CourseCatalogItem | null {
  const id = typeof o.id === "string" ? o.id : ""
  const slug = typeof o.slug === "string" ? o.slug : ""
  if (!id || !slug) return null
  const title = typeof o.title === "string" ? o.title : ""
  const price = typeof o.price === "number" && Number.isFinite(o.price) ? o.price : 0
  const oldPrice =
    typeof o.oldPrice === "number" && Number.isFinite(o.oldPrice) ? o.oldPrice : null
  const lessonCount =
    typeof o.lessonCount === "number" && Number.isFinite(o.lessonCount)
      ? o.lessonCount
      : typeof o.lessonsCount === "number" && Number.isFinite(o.lessonsCount)
        ? o.lessonsCount
        : 0
  const instructorName =
    typeof o.instructorName === "string" && o.instructorName.trim()
      ? o.instructorName.trim()
      : "N/A"
  const rating =
    typeof o.rating === "number" && Number.isFinite(o.rating) ? o.rating : 0
  const reviewCount =
    typeof o.reviewCount === "number" && Number.isFinite(o.reviewCount)
      ? o.reviewCount
      : typeof o.reviewsCount === "number" && Number.isFinite(o.reviewsCount)
        ? o.reviewsCount
        : 0
  return {
    id,
    title: title.trim(),
    slug,
    summary: typeof o.summary === "string" ? o.summary : null,
    thumbnail: typeof o.thumbnail === "string" ? o.thumbnail : null,
    price,
    oldPrice,
    createdAt:
      typeof o.createdAt === "string" && o.createdAt.trim()
        ? o.createdAt.trim()
        : new Date(0).toISOString(),
    lessonCount,
    instructorName,
    rating,
    reviewCount,
    isBestseller: typeof o.isBestseller === "boolean" ? o.isBestseller : undefined,
  }
}

/**
 * Maps embedded course objects in `courses` to catalog items (same shape as home page).
 */
function parseCourseCatalogItems(raw: unknown): CourseCatalogItem[] {
  if (!Array.isArray(raw)) return []
  const out: CourseCatalogItem[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const c = courseRecordToCatalogItem(item as Record<string, unknown>)
    if (c) out.push(c)
  }
  return out
}

/**
 * GET /combos/slug/:slug may return `comboItems: { course: { ... } }[]` instead of flat `courses`.
 */
function parseCourseCatalogItemsFromComboItems(raw: unknown): CourseCatalogItem[] {
  if (!Array.isArray(raw)) return []
  const out: CourseCatalogItem[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    const course = row.course
    if (!course || typeof course !== "object") continue
    const c = courseRecordToCatalogItem(course as Record<string, unknown>)
    if (c) out.push(c)
  }
  return out
}

function parseComboPublicItem(raw: unknown): ComboPublicItem | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = toStringOrEmpty(o.id)
  if (!id) return null
  const slug = toStringOrEmpty(o.slug)
  const desc = o.description
  const thumb = o.thumbnail
  const catalogFromComboItems = parseCourseCatalogItemsFromComboItems(o.comboItems)
  const flatCourseNames = parseCourseNames(o.courses)
  const catalogFromFlatCourses = parseCourseCatalogItems(o.courses)

  const courseCatalogItems =
    catalogFromComboItems.length > 0 ? catalogFromComboItems : catalogFromFlatCourses
  const courses =
    catalogFromComboItems.length > 0
      ? catalogFromComboItems.map((c) => c.title.trim()).filter((t) => t.length > 0)
      : flatCourseNames
  const courseCountRaw = o.courseCount ?? o.coursesCount
  const lessonCount = o.lessonCount ?? o.lessonsCount
  const questionCount = o.questionCount ?? o.questionsCount

  const explicitCourseCount =
    typeof courseCountRaw === "number" && Number.isFinite(courseCountRaw)
      ? courseCountRaw
      : undefined

  return {
    id,
    title: toStringOrEmpty(o.title) || "Combo",
    slug,
    description: typeof desc === "string" ? desc : null,
    thumbnail: typeof thumb === "string" ? thumb : null,
    price: toNumberOrZero(o.price),
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
    courses,
    courseCatalogItems,
    isPublished: typeof o.isPublished === "boolean" ? o.isPublished : undefined,
    courseCount:
      explicitCourseCount ?? (courses.length > 0 ? courses.length : undefined),
    lessonCount: typeof lessonCount === "number" ? lessonCount : undefined,
    questionCount: typeof questionCount === "number" ? questionCount : undefined,
  }
}

export function parseComboPublicList(payload: unknown): ComboPublicItem[] {
  const root = pickData(payload)
  const list = Array.isArray(root) ? root : []
  return list.map(parseComboPublicItem).filter((x): x is ComboPublicItem => x !== null)
}

export function parseComboDetailPublic(payload: unknown): ComboDetailPublic | null {
  const raw = pickData(payload)
  return parseComboPublicItem(raw)
}
