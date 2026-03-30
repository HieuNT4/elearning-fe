"use client"

import { ChevronDown, Lock, PlayCircle } from "lucide-react"
import { Plyr } from "plyr-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckoutPaymentModal } from "@/features/payment"
import { cn } from "@/lib/utils"

import "plyr-react/plyr.css"

type LessonPartView = {
  id: string
  title: string
  videoUrl: string | null
  videoType: "youtube" | "vimeo" | "iframe" | "html5"
  isPreview: boolean
  durationSeconds?: number
}

type LessonView = {
  id: string
  title: string
  orderIndex: number
  lessonParts: LessonPartView[]
}

type ChapterView = {
  id: string
  title: string
  orderIndex: number
  lessons: LessonView[]
}

type CourseLearningScreenProps = {
  /** Course UUID from API — required to open checkout from this screen */
  courseId?: string
  /** URL slug (same as route) — redirect after successful payment */
  courseSlug: string
  courseTitle: string
  coursePrice?: number
  chapters: ChapterView[]
}

type PartWithContext = LessonPartView & {
  chapterId: string
  chapterTitle: string
  lessonId: string
  lessonTitle: string
}

function normalizeVideoType(videoType: string | null | undefined): LessonPartView["videoType"] {
  if (videoType === "youtube" || videoType === "vimeo" || videoType === "iframe") return videoType
  return "html5"
}

function formatDurationSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—"
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function sumPartDurations(parts: { durationSeconds?: number }[]): number {
  return parts.reduce((acc, p) => acc + (typeof p.durationSeconds === "number" ? p.durationSeconds : 0), 0)
}

function toPlyrSource(part: LessonPartView | null) {
  if (!part?.videoUrl) return null
  if (part.videoType === "youtube" || part.videoType === "vimeo") {
    return {
      type: "video" as const,
      sources: [{ src: part.videoUrl, provider: part.videoType }],
    }
  }
  return {
    type: "video" as const,
    sources: [{ src: part.videoUrl, type: "video/mp4" }],
  }
}

export function CourseLearningScreen({
  courseId,
  courseSlug,
  courseTitle,
  coursePrice,
  chapters,
}: CourseLearningScreenProps) {
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.orderIndex - b.orderIndex),
    [chapters],
  )

  const allParts: PartWithContext[] = useMemo(
    () =>
      sortedChapters
        .flatMap((chapter) =>
          [...chapter.lessons]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .flatMap((lesson) =>
              lesson.lessonParts.map((part) => ({
                ...part,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                lessonId: lesson.id,
                lessonTitle: lesson.title,
              })),
            ),
        )
        .map((part) => ({
          ...part,
          videoType: normalizeVideoType(part.videoType),
        })),
    [sortedChapters],
  )

  const partGlobalIndex = useMemo(() => {
    const map = new Map<string, number>()
    allParts.forEach((p, i) => {
      map.set(p.id, i + 1)
    })
    return map
  }, [allParts])

  const firstPlayable = allParts.find((part) => part.isPreview && part.videoUrl) ?? null
  const [selectedPartId, setSelectedPartId] = useState<string | null>(firstPlayable?.id ?? null)
  const [sidebarTab, setSidebarTab] = useState<"content" | "outline">("content")
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const hasAutoOpenedPurchaseModal = useRef(false)

  const hasLockedPaidParts = useMemo(
    () => allParts.some((p) => Boolean(p.videoUrl) && !p.isPreview),
    [allParts],
  )
  const hasPreviewPlayable = useMemo(
    () => allParts.some((p) => Boolean(p.videoUrl) && p.isPreview),
    [allParts],
  )

  useEffect(() => {
    if (hasAutoOpenedPurchaseModal.current) return
    if (!courseId?.trim() || !hasLockedPaidParts || hasPreviewPlayable) return
    hasAutoOpenedPurchaseModal.current = true
    const id = window.requestAnimationFrame(() => {
      setCheckoutOpen(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [courseId, hasLockedPaidParts, hasPreviewPlayable])

  const selectedPart = allParts.find((part) => part.id === selectedPartId) ?? firstPlayable
  const plyrSource = toPlyrSource(selectedPart ?? null)
  const chapterCount = sortedChapters.length
  const videoCount = allParts.length
  const sidebarTitle = courseTitle?.trim() || "Khóa học"

  const lessonLabel = selectedPart?.lessonTitle?.trim() || "Bài học"
  const partLabel = selectedPart?.title?.trim() || "Học phần"
  const playerHeading =
    selectedPart != null
      ? `${lessonLabel} — ${partLabel}`
      : courseTitle?.trim() || "Khóa học"

  return (
    <div className="CourseLearningScreen relative flex w-full flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:items-start lg:gap-0 lg:px-6">
      <section className="flex min-w-0 flex-1 flex-col gap-4 lg:min-w-0 lg:pr-6">
        <div className="overflow-hidden rounded-xl border border-border bg-black">
          {plyrSource ? (
            <Plyr source={plyrSource} />
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-sm leading-normal text-white/80">
              Video chưa sẵn sàng cho bài học này.
            </div>
          )}
        </div>

        <h1 className="mt-1 text-xl font-semibold leading-tight md:text-2xl">{playerHeading}</h1>
      </section>

      <aside
        className={cn(
          "flex w-full shrink-0 flex-col overflow-hidden border border-border bg-background",
          "lg:fixed lg:right-0 lg:top-[72px] lg:z-30 lg:h-[calc(100vh-72px)] lg:w-[360px] lg:border-l lg:border-t-0 lg:shadow-sm",
        )}
      >
        <div className="flex max-h-[70vh] flex-col overflow-hidden lg:max-h-none lg:h-full">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <h2 className="line-clamp-3 text-base font-semibold leading-tight tracking-tight">
              {sidebarTitle}
            </h2>
            <p className="mt-2 text-xs leading-normal text-muted-foreground">
              {chapterCount} chương / {videoCount} video
            </p>
            {courseId && hasLockedPaidParts ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setCheckoutOpen(true)}
              >
                Mua khóa học
              </Button>
            ) : null}
          </div>

          <div className="flex shrink-0 border-b border-border">
            <button
              type="button"
              onClick={() => setSidebarTab("content")}
              className={cn(
                "flex-1 border-b-2 px-2 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm",
                sidebarTab === "content"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Nội dung
            </button>
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed border-b-2 border-transparent px-2 py-2.5 text-center text-xs font-medium text-muted-foreground opacity-60 sm:text-sm"
            >
              Tài liệu
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("outline")}
              className={cn(
                "flex-1 border-b-2 px-2 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm",
                sidebarTab === "outline"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Mục lục
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {sidebarTab === "outline" ? (
              sortedChapters.length === 0 ? (
                <p className="px-4 py-4 text-sm leading-normal text-muted-foreground">
                  Chưa có nội dung bài học.
                </p>
              ) : (
                <nav
                  className="CourseOutlineTree px-3 py-3 pb-6"
                  aria-label="Mục lục nhanh: chương, bài, học phần"
                >
                  <ul className="flex flex-col gap-3">
                    {sortedChapters.map((chapter, chapterIdx) => {
                      const lessonsSorted = chapter.lessons
                        .slice()
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                      return (
                        <li key={chapter.id}>
                          <div className="rounded-md bg-muted/40 px-2 py-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Chương {chapterIdx + 1}
                            </p>
                            <p className="text-sm font-semibold leading-snug text-foreground">{chapter.title}</p>
                          </div>
                          <ul className="mt-1.5 ml-2 flex flex-col gap-2 border-l border-border pl-3">
                            {lessonsSorted.map((lesson, lessonIdx) => (
                              <li key={lesson.id}>
                                <div className="py-0.5">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Bài {lessonIdx + 1}
                                  </p>
                                  <p className="text-xs font-medium leading-snug text-foreground">{lesson.title}</p>
                                </div>
                                <ul className="mt-1 ml-1 flex flex-col gap-0.5 border-l border-dashed border-border/80 pl-2.5">
                                  {lesson.lessonParts.length === 0 ? (
                                    <li className="py-1 text-[11px] text-muted-foreground">—</li>
                                  ) : (
                                    lesson.lessonParts.map((part) => {
                                      const playable = part.isPreview && Boolean(part.videoUrl)
                                      const isActive = part.id === selectedPart?.id
                                      const idx = partGlobalIndex.get(part.id) ?? 0
                                      const durationLabel =
                                        typeof part.durationSeconds === "number" &&
                                          part.durationSeconds > 0
                                          ? formatDurationSeconds(part.durationSeconds)
                                          : null
                                      return (
                                        <li key={part.id}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (playable) setSelectedPartId(part.id)
                                              else if (courseId) setCheckoutOpen(true)
                                            }}
                                            disabled={!playable && !courseId}
                                            className={cn(
                                              "flex w-full items-center gap-2 rounded-md py-1 pr-1 text-left text-xs transition-colors",
                                              isActive && playable
                                                ? "bg-primary/12 text-primary"
                                                : "text-foreground hover:bg-muted/60",
                                              !playable && !courseId && "cursor-not-allowed opacity-75",
                                              !playable && courseId && "cursor-pointer opacity-90",
                                            )}
                                          >
                                            <span
                                              className={cn(
                                                "flex size-5 shrink-0 items-center justify-center rounded border text-[10px] font-semibold tabular-nums",
                                                isActive && playable
                                                  ? "border-primary bg-primary text-primary-foreground"
                                                  : "border-border bg-background text-muted-foreground",
                                              )}
                                              aria-hidden
                                            >
                                              {idx}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate font-medium leading-tight">
                                              {part.title}
                                            </span>
                                            {playable ? (
                                              <PlayCircle
                                                className="size-3.5 shrink-0 text-muted-foreground"
                                                aria-hidden
                                              />
                                            ) : (
                                              <Lock
                                                className="size-3.5 shrink-0 text-amber-600"
                                                aria-hidden
                                              />
                                            )}
                                            {durationLabel ? (
                                              <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">
                                                {durationLabel}
                                              </span>
                                            ) : null}
                                          </button>
                                        </li>
                                      )
                                    })
                                  )}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              )
            ) : sortedChapters.length === 0 ? (
              <p className="px-4 py-4 text-sm leading-normal text-muted-foreground">
                Chưa có nội dung bài học.
              </p>
            ) : (
              <div className="flex flex-col gap-0 pb-4">
                {sortedChapters.map((chapter, chapterIdx) => {
                  const lessonsSorted = chapter.lessons.slice().sort((a, b) => a.orderIndex - b.orderIndex)
                  const partsInChapter = lessonsSorted.flatMap((l) => l.lessonParts)
                  const chapterDuration = sumPartDurations(partsInChapter)
                  const lessonCount = lessonsSorted.length
                  const partCount = partsInChapter.length

                  return (
                    <Collapsible key={chapter.id}>
                      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 border-b border-border bg-muted/50 px-3 py-3 text-left hover:bg-muted/80 [&[data-state=open]>svg]:rotate-180">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Chương
                          </p>
                          <p className="text-sm font-semibold leading-snug text-foreground">
                            {chapterIdx + 1}. {chapter.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
                            {lessonCount} bài · {partCount} học phần
                            {chapterDuration > 0 ? ` · ${formatDurationSeconds(chapterDuration)}` : ""}
                          </p>
                        </div>
                        <ChevronDown className="size-4 shrink-0 transition-transform" aria-hidden />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-b border-border bg-muted/10">
                          {lessonsSorted.map((lesson, lessonIdx) => {
                            const parts = lesson.lessonParts
                            const lessonDuration = sumPartDurations(parts)

                            return (
                              <Collapsible key={lesson.id}>
                                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 border-b border-border/80 bg-background/80 px-3 py-2.5 pl-4 text-left hover:bg-muted/40 [&[data-state=open]>svg]:rotate-180">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                      Bài
                                    </p>
                                    <p className="text-sm font-medium leading-snug text-foreground">
                                      {lessonIdx + 1}. {lesson.title}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
                                      {parts.length} học phần
                                      {lessonDuration > 0 ? ` · ${formatDurationSeconds(lessonDuration)}` : ""}
                                    </p>
                                  </div>
                                  <ChevronDown className="size-4 shrink-0 transition-transform" aria-hidden />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <ul
                                    className="flex flex-col gap-px border-b border-border/60 bg-muted/15 py-1 pl-3"
                                    aria-label={`Học phần — ${lesson.title}`}
                                  >
                                    {parts.length === 0 ? (
                                      <li className="px-3 py-2 text-xs text-muted-foreground">
                                        Chưa có học phần.
                                      </li>
                                    ) : (
                                      parts.map((part) => {
                                        const playable = part.isPreview && Boolean(part.videoUrl)
                                        const isActive = part.id === selectedPart?.id
                                        const idx = partGlobalIndex.get(part.id) ?? 0
                                        const durationLabel =
                                          typeof part.durationSeconds === "number" &&
                                            part.durationSeconds > 0
                                            ? formatDurationSeconds(part.durationSeconds)
                                            : null

                                        return (
                                          <li key={part.id}>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (playable) setSelectedPartId(part.id)
                                                else if (courseId) setCheckoutOpen(true)
                                              }}
                                              disabled={!playable && !courseId}
                                              className={cn(
                                                "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors",
                                                isActive && playable ? "bg-primary/10" : "hover:bg-muted/50",
                                                !playable && !courseId && "cursor-not-allowed opacity-90",
                                                !playable && courseId && "cursor-pointer",
                                              )}
                                            >
                                              <span
                                                className={cn(
                                                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold leading-none tabular-nums",
                                                  isActive && playable
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-muted-foreground",
                                                )}
                                                aria-hidden
                                              >
                                                {idx}
                                              </span>
                                              <span className="min-w-0 flex-1">
                                                <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                                                  {part.title}
                                                </span>
                                                {playable ? (
                                                  <span
                                                    className={cn(
                                                      "mt-1 inline-flex items-center gap-1 text-xs font-medium leading-normal",
                                                      isActive ? "text-primary" : "text-muted-foreground",
                                                    )}
                                                  >
                                                    <PlayCircle className="size-3.5 shrink-0" aria-hidden />
                                                    Xem video
                                                  </span>
                                                ) : (
                                                  <span className="mt-1 inline-flex items-center gap-1 text-xs leading-normal text-amber-700">
                                                    <Lock className="size-3.5 shrink-0" aria-hidden />
                                                    Cần thanh toán để xem
                                                  </span>
                                                )}
                                              </span>
                                              {durationLabel ? (
                                                <span className="shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                                                  {durationLabel}
                                                </span>
                                              ) : (
                                                <span className="w-8 shrink-0" aria-hidden />
                                              )}
                                            </button>
                                          </li>
                                        )
                                      })
                                    )}
                                  </ul>
                                </CollapsibleContent>
                              </Collapsible>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Reserve space so main column does not sit under fixed sidebar */}
      <div className="hidden shrink-0 lg:block lg:w-[360px]" aria-hidden />

      {courseId ? (
        <CheckoutPaymentModal
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          courseId={courseId}
          productTitle={courseTitle?.trim() || "Khóa học"}
          priceHint={coursePrice}
          courseSlug={courseSlug}
        />
      ) : null}
    </div>
  )
}
