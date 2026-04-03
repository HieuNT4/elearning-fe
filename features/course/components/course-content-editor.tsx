"use client"

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { courseContentEditorMessagesVi as ccMsg } from "../messages/course-content-editor"
import { chapterLessonService, courseService } from "../services"
import { chapterImportSchema } from "../validations/chapter-lesson.schema"
import type {
  ChapterItem,
  CourseItem,
  CreateLessonPayload,
  LessonItem,
  LessonVideoType,
  LessonPartItem,
  LessonWithParts,
  CreateLessonPartPayload,
  UpdateLessonPayload,
  UpdateLessonPartPayload,
} from "../types"

type ChapterWithLessons = ChapterItem & {
  lessons: LessonWithParts[]
}

type CourseContentEditorProps = {
  courseId: string
}

type LessonPartFormState = {
  title: string
  videoType: LessonVideoType
  videoUrl: string
  documentUrl: string
  isPreview: boolean
}

const defaultLessonPartForm: LessonPartFormState = {
  title: "",
  videoType: "youtube",
  videoUrl: "",
  documentUrl: "",
  isPreview: false,
}

function makeLocalId(prefix: string): string {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createEmptyLessonPart(lessonId: string, orderIndex: number): LessonPartItem {
  return {
    id: makeLocalId("part"),
    lessonId,
    title: "",
    videoUrl: null,
    videoType: "youtube",
    documentUrl: null,
    orderIndex,
    isPreview: false,
    createdAt: "",
    updatedAt: "",
  }
}

function createEmptyLesson(chapterId: string, orderIndex: number): LessonWithParts {
  const lessonId = makeLocalId("lesson")
  return {
    id: lessonId,
    chapterId,
    title: "",
    orderIndex,
    createdAt: "",
    updatedAt: "",
    lessonParts: [createEmptyLessonPart(lessonId, 1)],
  }
}

export function CourseContentEditor({ courseId }: CourseContentEditorProps) {
  const router = useRouter()
  const [course, setCourse] = useState<CourseItem | null>(null)
  const [chapters, setChapters] = useState<ChapterWithLessons[]>([])
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  const [openLessonMap, setOpenLessonMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [newChapterDialogOpen, setNewChapterDialogOpen] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState("")

  const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false)
  const [selectedChapterForLesson, setSelectedChapterForLesson] = useState<ChapterItem | null>(null)
  const [newLessonTitle, setNewLessonTitle] = useState("")

  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null)
  const [editingLessonTitle, setEditingLessonTitle] = useState("")

  const [createLessonPartDialogOpen, setCreateLessonPartDialogOpen] = useState(false)
  const [selectedLessonForPart, setSelectedLessonForPart] = useState<LessonWithParts | null>(null)
  const [newLessonPartState, setNewLessonPartState] = useState<LessonPartFormState>(
    defaultLessonPartForm
  )

  const [editingLessonPart, setEditingLessonPart] = useState<LessonPartItem | null>(null)
  const [editingLessonPartState, setEditingLessonPartState] = useState<LessonPartFormState>(
    defaultLessonPartForm
  )

  const [chapterQuickEdit, setChapterQuickEdit] = useState<Record<string, boolean>>({})
  const [chapterSnapshots, setChapterSnapshots] = useState<Record<string, ChapterWithLessons>>({})
  const [importingChapterId, setImportingChapterId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const courseDetail = await courseService.getCourseById(courseId)
      setCourse(courseDetail)

      const chapterList = await chapterLessonService.listChaptersByCourse(courseId)
      const lessonGroups = await Promise.all(
        chapterList.map(async (chapter) => {
          const lessons = await chapterLessonService.listLessonsByChapter(chapter.id)
          const lessonsWithParts = await Promise.all(
            lessons.map(async (lesson) => {
              const lessonParts = await chapterLessonService.listLessonPartsByLesson(lesson.id)
              return { ...lesson, lessonParts }
            })
          )
          return { ...chapter, lessons: lessonsWithParts }
        })
      )

      setChapters(lessonGroups)
      setChapterQuickEdit({})
      setChapterSnapshots({})
      setOpenMap((prev) => {
        const next = { ...prev }
        for (const chapter of chapterList) {
          if (next[chapter.id] === undefined) {
            next[chapter.id] = true
          }
        }
        return next
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải nội dung khóa học")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleCreateChapter() {
    if (!newChapterTitle.trim()) return
    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.createChapter({
        courseId,
        title: newChapterTitle.trim(),
        orderIndex: chapters.length + 1,
      })
      setNewChapterTitle("")
      setNewChapterDialogOpen(false)
      await loadData()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo chương")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteChapter(chapter: ChapterItem) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa chương "${chapter.title}"?`)
    if (!confirmed) return
    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.deleteChapter(chapter.id)
      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa chương")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveChapter(chapterId: string, direction: "up" | "down") {
    const sorted = [...chapters].sort((a, b) => a.orderIndex - b.orderIndex)
    const index = sorted.findIndex((chapter) => chapter.id === chapterId)
    if (index < 0) return

    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sorted.length) return

    const current = sorted[index]
    const target = sorted[targetIndex]

    setSaving(true)
    setError(null)
    try {
      await Promise.all([
        chapterLessonService.updateChapter(current.id, { orderIndex: target.orderIndex }),
        chapterLessonService.updateChapter(target.id, { orderIndex: current.orderIndex }),
      ])
      await loadData()
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Không thể đổi thứ tự chương")
    } finally {
      setSaving(false)
    }
  }

  function openCreateLessonDialog(chapter: ChapterItem) {
    setSelectedChapterForLesson(chapter)
    setNewLessonTitle("")
    setCreateLessonDialogOpen(true)
  }

  async function handleCreateLesson() {
    if (!selectedChapterForLesson || !newLessonTitle.trim()) return
    const payload: CreateLessonPayload = {
      chapterId: selectedChapterForLesson.id,
      title: newLessonTitle.trim(),
      orderIndex: (chapters.find((chapter) => chapter.id === selectedChapterForLesson.id)?.lessons
        .length ?? 0) + 1,
    }

    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.createLesson(payload)
      setCreateLessonDialogOpen(false)
      setSelectedChapterForLesson(null)
      setNewLessonTitle("")
      await loadData()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo bài học")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLesson(lesson: LessonItem) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`)
    if (!confirmed) return

    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.deleteLesson(lesson.id)
      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa bài học")
    } finally {
      setSaving(false)
    }
  }

  function openEditLessonDialog(lesson: LessonItem) {
    setEditingLesson(lesson)
    setEditingLessonTitle(lesson.title)
  }

  async function handleUpdateLesson() {
    if (!editingLesson) return
    setSaving(true)
    setError(null)
    try {
      const payload: UpdateLessonPayload = {
        title: editingLessonTitle.trim(),
      }
      await chapterLessonService.updateLesson(editingLesson.id, payload)
      setEditingLesson(null)
      setEditingLessonTitle("")
      await loadData()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Không thể cập nhật bài học")
    } finally {
      setSaving(false)
    }
  }

  function openCreateLessonPartDialog(lesson: LessonWithParts) {
    setSelectedLessonForPart(lesson)
    setNewLessonPartState(defaultLessonPartForm)
    setCreateLessonPartDialogOpen(true)
  }

  async function handleCreateLessonPart() {
    if (!selectedLessonForPart) return

    const payload: CreateLessonPartPayload = {
      lessonId: selectedLessonForPart.id,
      title: newLessonPartState.title.trim(),
      videoType: newLessonPartState.videoType,
      videoUrl: newLessonPartState.videoUrl.trim() || undefined,
      documentUrl: newLessonPartState.documentUrl.trim() || undefined,
      isPreview: newLessonPartState.isPreview,
      orderIndex: selectedLessonForPart.lessonParts.length + 1,
    }

    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.createLessonPart(payload)
      setCreateLessonPartDialogOpen(false)
      setSelectedLessonForPart(null)
      setNewLessonPartState(defaultLessonPartForm)
      await loadData()
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Không thể tạo học phần"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLessonPart(lessonPart: LessonPartItem) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa học phần này không?")
    if (!confirmed) return

    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.deleteLessonPart(lessonPart.id)
      await loadData()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xóa học phần"
      )
    } finally {
      setSaving(false)
    }
  }

  function openEditLessonPartDialog(lessonPart: LessonPartItem) {
    setEditingLessonPart(lessonPart)
    setEditingLessonPartState({
      title: lessonPart.title,
      videoType: lessonPart.videoType,
      videoUrl: lessonPart.videoUrl ?? "",
      documentUrl: lessonPart.documentUrl ?? "",
      isPreview: lessonPart.isPreview,
    })
  }

  async function handleUpdateLessonPart() {
    if (!editingLessonPart) return

    const payload: UpdateLessonPartPayload = {
      title: editingLessonPartState.title.trim(),
      videoType: editingLessonPartState.videoType,
      videoUrl: editingLessonPartState.videoUrl.trim() || undefined,
      documentUrl: editingLessonPartState.documentUrl.trim() || undefined,
      isPreview: editingLessonPartState.isPreview,
    }

    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.updateLessonPart(editingLessonPart.id, payload)
      setEditingLessonPart(null)
      setEditingLessonPartState(defaultLessonPartForm)
      await loadData()
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Không thể cập nhật học phần"
      )
    } finally {
      setSaving(false)
    }
  }

  function updateChapterById(
    chapterId: string,
    updater: (c: ChapterWithLessons) => ChapterWithLessons
  ) {
    setChapters((prev) => prev.map((c) => (c.id === chapterId ? updater(c) : c)))
  }

  function beginChapterQuickEdit(chapter: ChapterWithLessons) {
    setChapterSnapshots((prev) => ({ ...prev, [chapter.id]: structuredClone(chapter) }))
    setChapterQuickEdit((prev) => ({ ...prev, [chapter.id]: true }))
    setOpenLessonMap((prev) => {
      const next = { ...prev }
      for (const lesson of chapter.lessons) {
        next[lesson.id] = true
      }
      return next
    })
  }

  function cancelChapterQuickEdit(chapterId: string) {
    const snap = chapterSnapshots[chapterId]
    if (snap) {
      setChapters((prev) => prev.map((c) => (c.id === chapterId ? snap : c)))
    }
    setChapterSnapshots((prev) => {
      const next = { ...prev }
      delete next[chapterId]
      return next
    })
    setChapterQuickEdit((prev) => ({ ...prev, [chapterId]: false }))
  }

  function setChapterTitleInline(chapterId: string, title: string) {
    updateChapterById(chapterId, (c) => ({ ...c, title }))
  }

  function setLessonTitleInline(chapterId: string, lessonId: string, title: string) {
    updateChapterById(chapterId, (c) => ({
      ...c,
      lessons: c.lessons.map((l) => (l.id === lessonId ? { ...l, title } : l)),
    }))
  }

  function setPartFieldInline(
    chapterId: string,
    lessonId: string,
    partId: string,
    patch: Partial<
      Pick<LessonPartItem, "title" | "videoUrl" | "videoType" | "documentUrl" | "isPreview">
    >
  ) {
    updateChapterById(chapterId, (c) => ({
      ...c,
      lessons: c.lessons.map((l) =>
        l.id !== lessonId
          ? l
          : {
              ...l,
              lessonParts: l.lessonParts.map((p) => (p.id === partId ? { ...p, ...patch } : p)),
            }
      ),
    }))
  }

  function addLessonRow(chapterId: string) {
    updateChapterById(chapterId, (c) => {
      const orderIndex = c.lessons.length + 1
      return { ...c, lessons: [...c.lessons, createEmptyLesson(c.id, orderIndex)] }
    })
  }

  function addPartRow(chapterId: string, lessonId: string) {
    updateChapterById(chapterId, (c) => ({
      ...c,
      lessons: c.lessons.map((l) => {
        if (l.id !== lessonId) return l
        const nextOrder = l.lessonParts.length + 1
        return {
          ...l,
          lessonParts: [...l.lessonParts, createEmptyLessonPart(lessonId, nextOrder)],
        }
      }),
    }))
  }

  function removeLessonRow(chapterId: string, lessonId: string) {
    const confirmed = window.confirm(ccMsg.removeLessonRow)
    if (!confirmed) return
    updateChapterById(chapterId, (c) => ({
      ...c,
      lessons: c.lessons
        .filter((l) => l.id !== lessonId)
        .map((l, i) => ({ ...l, orderIndex: i + 1 })),
    }))
  }

  function removePartRow(chapterId: string, lessonId: string, partId: string) {
    updateChapterById(chapterId, (c) => ({
      ...c,
      lessons: c.lessons.map((l) => {
        if (l.id !== lessonId) return l
        if (l.lessonParts.length <= 1) {
          window.alert(ccMsg.mustKeepOnePart)
          return l
        }
        return {
          ...l,
          lessonParts: l.lessonParts
            .filter((p) => p.id !== partId)
            .map((p, i) => ({ ...p, orderIndex: i + 1 })),
        }
      }),
    }))
  }

  async function handleChapterImport(chapterId: string) {
    const chapter = chapters.find((c) => c.id === chapterId)
    if (!chapter) return

    const payload = {
      courseId,
      chapterOrderIndex: chapter.orderIndex,
      chapterTitle: chapter.title.trim(),
      lessons: chapter.lessons.map((lesson, li) => ({
        title: lesson.title.trim(),
        orderIndex: li + 1,
        parts: lesson.lessonParts.map((part, pi) => ({
          title: part.title.trim(),
          orderIndex: pi + 1,
          videoType: part.videoType,
          videoUrl: part.videoUrl?.trim() || undefined,
          documentUrl: part.documentUrl?.trim() || undefined,
          isPreview: part.isPreview,
        })),
      })),
    }

    const parsed = chapterImportSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join("; "))
      return
    }

    const confirmed = window.confirm(ccMsg.importConfirm)
    if (!confirmed) return

    setImportingChapterId(chapterId)
    setSaving(true)
    setError(null)
    try {
      await chapterLessonService.importChapter(parsed.data)
      setChapterQuickEdit((prev) => ({ ...prev, [chapterId]: false }))
      setChapterSnapshots((prev) => {
        const next = { ...prev }
        delete next[chapterId]
        return next
      })
      await loadData()
    } catch (importErr) {
      setError(
        importErr instanceof Error ? importErr.message : "Không thể import chương"
      )
    } finally {
      setImportingChapterId(null)
      setSaving(false)
    }
  }

  return (
    <div className="CourseContentEditor flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Quay lại"
              onClick={() => router.back()}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="min-w-0 truncate text-base">
              {course?.title ?? "Chi tiết khóa học"}
            </CardTitle>
          </div>
          <Button
            type="button"
            disabled={saving || loading}
            onClick={() => setNewChapterDialogOpen(true)}
          >
            <Plus />
            Tạo chương mới
          </Button>
        </CardHeader>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Đang tải dữ liệu khóa học"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
            <div className="text-sm font-medium text-muted-foreground">
              Đang tải dữ liệu khóa học...
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {chapters.map((chapter, chapterIndex) => {
          const isChapterOpen = openMap[chapter.id] ?? true
          const isQuick = chapterQuickEdit[chapter.id] ?? false

          return (
            <Card key={chapter.id}>
              <Collapsible
                open={isChapterOpen}
                onOpenChange={(nextOpen) =>
                  setOpenMap((prev) => ({ ...prev, [chapter.id]: nextOpen }))
                }
              >
                <CardHeader>
                  <div className="flex flex-col gap-3">
                    {isQuick ? (
                      <p className="text-muted-foreground text-sm leading-normal">{ccMsg.importHint}</p>
                    ) : null}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {isQuick ? (
                          <div className="grid gap-1">
                            <span className="text-muted-foreground text-xs font-medium">
                              {ccMsg.chapterTitleLabel}
                            </span>
                            <Input
                              value={chapter.title}
                              onChange={(event) =>
                                setChapterTitleInline(chapter.id, event.target.value)
                              }
                              disabled={saving || importingChapterId === chapter.id}
                              aria-label={ccMsg.chapterTitleLabel}
                              className="max-w-xl"
                            />
                            <CardDescription>
                              {chapter.lessons.length} bài học
                            </CardDescription>
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-base">
                              Chương {chapterIndex + 1}: {chapter.title}
                            </CardTitle>
                            <CardDescription>{chapter.lessons.length} bài học</CardDescription>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isQuick ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={saving || Boolean(importingChapterId)}
                              onClick={() => cancelChapterQuickEdit(chapter.id)}
                            >
                              {ccMsg.cancelQuickEdit}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={saving || importingChapterId === chapter.id}
                              aria-label={ccMsg.importChapter}
                              onClick={() => void handleChapterImport(chapter.id)}
                            >
                              {importingChapterId === chapter.id ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Upload />
                              )}
                              {ccMsg.importChapter}
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={saving}
                            aria-label={ccMsg.editChapterTable}
                            onClick={() => beginChapterQuickEdit(chapter)}
                          >
                            <Pencil />
                            {ccMsg.editChapterTable}
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={saving || isQuick || chapterIndex === 0}
                          aria-label={`Đưa chương ${chapter.title} lên trên`}
                          onClick={() => void handleMoveChapter(chapter.id, "up")}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={saving || isQuick || chapterIndex === chapters.length - 1}
                          aria-label={`Đưa chương ${chapter.title} xuống dưới`}
                          onClick={() => void handleMoveChapter(chapter.id, "down")}
                        >
                          <ArrowDown />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={saving || isQuick}
                          aria-label={`Tạo bài học trong chương ${chapter.title}`}
                          onClick={() => openCreateLessonDialog(chapter)}
                        >
                          <Plus />
                          Tạo bài học
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={saving || isQuick}
                          aria-label={`Xóa chương ${chapter.title}`}
                          onClick={() => void handleDeleteChapter(chapter)}
                        >
                          <Trash2 />
                          Xóa chương
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={isChapterOpen ? "Thu gọn chương" : "Mở rộng chương"}
                          >
                            <ChevronDown
                              className={
                                isChapterOpen ? "transition-transform rotate-180" : "transition-transform"
                              }
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="grid gap-4">
                    {isQuick && chapter.lessons.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-4">
                        <p className="text-center text-sm text-muted-foreground">
                          {ccMsg.addAtLeastOneLesson}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={saving}
                          onClick={() => addLessonRow(chapter.id)}
                        >
                          <Plus />
                          {ccMsg.addLessonRow}
                        </Button>
                      </div>
                    ) : chapter.lessons.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        Chưa có bài học trong chương này.
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {chapter.lessons.map((lesson) => {
                          const lessonOpen = isQuick || (openLessonMap[lesson.id] ?? false)
                          return (
                            <Collapsible
                              key={lesson.id}
                              open={lessonOpen}
                              onOpenChange={(nextOpen) => {
                                if (isQuick) return
                                setOpenLessonMap((prev) => ({
                                  ...prev,
                                  [lesson.id]: nextOpen,
                                }))
                              }}
                            >
                              <div className="rounded-xl border bg-card p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-2">
                                      <CollapsibleTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon-sm"
                                          className="mt-0.5 shrink-0"
                                          aria-label={
                                            lessonOpen
                                              ? `Thu gọn học phần của ${lesson.title}`
                                              : `Mở học phần của ${lesson.title}`
                                          }
                                          disabled={saving || isQuick}
                                        >
                                          <ChevronDown
                                            className={
                                              lessonOpen
                                                ? "transition-transform rotate-180"
                                                : "transition-transform"
                                            }
                                          />
                                        </Button>
                                      </CollapsibleTrigger>
                                      {isQuick ? (
                                        <div className="grid min-w-0 flex-1 gap-1">
                                          <span className="text-muted-foreground text-xs font-medium">
                                            {ccMsg.lessonTitleLabel}
                                          </span>
                                          <Input
                                            value={lesson.title}
                                            onChange={(event) =>
                                              setLessonTitleInline(
                                                chapter.id,
                                                lesson.id,
                                                event.target.value
                                              )
                                            }
                                            disabled={saving || importingChapterId === chapter.id}
                                            aria-label={ccMsg.lessonTitleLabel}
                                          />
                                          <div className="text-xs leading-normal text-muted-foreground">
                                            {lesson.lessonParts.length} học phần
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="min-w-0">
                                          <div className="text-sm font-semibold leading-snug">
                                            {lesson.title}
                                          </div>
                                          <div className="text-xs leading-normal text-muted-foreground">
                                            {lesson.lessonParts.length} học phần
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                    {isQuick ? (
                                      <>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          disabled={saving || importingChapterId === chapter.id}
                                          onClick={() => addPartRow(chapter.id, lesson.id)}
                                        >
                                          <Plus />
                                          {ccMsg.addPartRow}
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="destructive"
                                          disabled={saving || importingChapterId === chapter.id}
                                          aria-label={ccMsg.removeLessonRow}
                                          onClick={() => removeLessonRow(chapter.id, lesson.id)}
                                        >
                                          <Trash2 />
                                          {ccMsg.removeLessonRow}
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          type="button"
                                          size="icon-sm"
                                          variant="outline"
                                          aria-label={`Sửa bài học ${lesson.title}`}
                                          disabled={saving}
                                          onClick={() => openEditLessonDialog(lesson)}
                                        >
                                          <Pencil />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="icon-sm"
                                          variant="destructive"
                                          aria-label={`Xóa bài học ${lesson.title}`}
                                          disabled={saving}
                                          onClick={() => void handleDeleteLesson(lesson)}
                                        >
                                          <Trash2 />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="icon-sm"
                                          variant="outline"
                                          aria-label={`Thêm học phần cho bài học ${lesson.title}`}
                                          disabled={saving}
                                          onClick={() => openCreateLessonPartDialog(lesson)}
                                        >
                                          <Plus />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <CollapsibleContent>
                                  <div className="mt-3">
                                    {lesson.lessonParts.length === 0 ? (
                                      <div className="text-center text-muted-foreground">
                                        Chưa có học phần.
                                      </div>
                                    ) : (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Loại video</TableHead>
                                            <TableHead>Tên học phần</TableHead>
                                            <TableHead>Tài liệu URL</TableHead>
                                            <TableHead>Video URL</TableHead>
                                            <TableHead>Preview</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {lesson.lessonParts.map((part) => (
                                            <TableRow key={part.id}>
                                              {isQuick ? (
                                                <>
                                                  <TableCell className="p-1 align-middle">
                                                    <select
                                                      value={part.videoType}
                                                      className="h-8 w-full min-w-[96px] rounded-lg border border-input bg-background px-2 text-sm"
                                                      disabled={
                                                        saving || importingChapterId === chapter.id
                                                      }
                                                      aria-label="Loại video"
                                                      onChange={(event) =>
                                                        setPartFieldInline(
                                                          chapter.id,
                                                          lesson.id,
                                                          part.id,
                                                          {
                                                            videoType: event.target
                                                              .value as LessonVideoType,
                                                          }
                                                        )
                                                      }
                                                    >
                                                      <option value="youtube">youtube</option>
                                                      <option value="iframe">iframe</option>
                                                      <option value="vimeo">vimeo</option>
                                                    </select>
                                                  </TableCell>
                                                  <TableCell className="p-1 align-middle">
                                                    <Input
                                                      className="h-8 min-w-[120px]"
                                                      value={part.title}
                                                      placeholder={ccMsg.partTitlePlaceholder}
                                                      disabled={
                                                        saving || importingChapterId === chapter.id
                                                      }
                                                      aria-label={ccMsg.partTitlePlaceholder}
                                                      onChange={(event) =>
                                                        setPartFieldInline(
                                                          chapter.id,
                                                          lesson.id,
                                                          part.id,
                                                          { title: event.target.value }
                                                        )
                                                      }
                                                    />
                                                  </TableCell>
                                                  <TableCell className="p-1 align-middle">
                                                    <Input
                                                      className="h-8 min-w-[140px]"
                                                      value={part.documentUrl ?? ""}
                                                      placeholder={ccMsg.documentUrlPlaceholder}
                                                      disabled={
                                                        saving || importingChapterId === chapter.id
                                                      }
                                                      aria-label={ccMsg.documentUrlPlaceholder}
                                                      onChange={(event) =>
                                                        setPartFieldInline(
                                                          chapter.id,
                                                          lesson.id,
                                                          part.id,
                                                          {
                                                            documentUrl:
                                                              event.target.value || null,
                                                          }
                                                        )
                                                      }
                                                    />
                                                  </TableCell>
                                                  <TableCell className="p-1 align-middle">
                                                    <Input
                                                      className="h-8 min-w-[140px]"
                                                      value={part.videoUrl ?? ""}
                                                      placeholder={ccMsg.videoUrlPlaceholder}
                                                      disabled={
                                                        saving || importingChapterId === chapter.id
                                                      }
                                                      aria-label={ccMsg.videoUrlPlaceholder}
                                                      onChange={(event) =>
                                                        setPartFieldInline(
                                                          chapter.id,
                                                          lesson.id,
                                                          part.id,
                                                          {
                                                            videoUrl: event.target.value || null,
                                                          }
                                                        )
                                                      }
                                                    />
                                                  </TableCell>
                                                  <TableCell className="p-1 align-middle">
                                                    <div className="flex items-center gap-2 px-1 text-sm">
                                                      <Switch
                                                        checked={part.isPreview}
                                                        disabled={
                                                          saving || importingChapterId === chapter.id
                                                        }
                                                        aria-label={ccMsg.previewLabel}
                                                        onCheckedChange={(checked) =>
                                                          setPartFieldInline(
                                                            chapter.id,
                                                            lesson.id,
                                                            part.id,
                                                            { isPreview: checked }
                                                          )
                                                        }
                                                      />
                                                      <span className="text-muted-foreground text-xs">
                                                        {ccMsg.previewLabel}
                                                      </span>
                                                    </div>
                                                  </TableCell>
                                                  <TableCell className="p-1 align-middle">
                                                    <div className="flex justify-end">
                                                      <Button
                                                        type="button"
                                                        size="icon-sm"
                                                        variant="destructive"
                                                        aria-label={ccMsg.removePartRow}
                                                        disabled={
                                                          saving || importingChapterId === chapter.id
                                                        }
                                                        onClick={() =>
                                                          removePartRow(
                                                            chapter.id,
                                                            lesson.id,
                                                            part.id
                                                          )
                                                        }
                                                      >
                                                        <Trash2 />
                                                      </Button>
                                                    </div>
                                                  </TableCell>
                                                </>
                                              ) : (
                                                <>
                                                  <TableCell>{part.videoType}</TableCell>
                                                  <TableCell className="max-w-[240px] truncate font-medium">
                                                    {part.title}
                                                  </TableCell>
                                                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                                                    {part.documentUrl ?? "-"}
                                                  </TableCell>
                                                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                                                    {part.videoUrl ?? "-"}
                                                  </TableCell>
                                                  <TableCell>
                                                    {part.isPreview ? "Có" : "Không"}
                                                  </TableCell>
                                                  <TableCell>
                                                    <div className="flex items-center justify-end gap-2">
                                                      <Button
                                                        type="button"
                                                        size="icon-sm"
                                                        variant="outline"
                                                        aria-label="Sửa học phần"
                                                        disabled={saving}
                                                        onClick={() =>
                                                          openEditLessonPartDialog(part)
                                                        }
                                                      >
                                                        <Pencil />
                                                      </Button>
                                                      <Button
                                                        type="button"
                                                        size="icon-sm"
                                                        variant="destructive"
                                                        aria-label="Xóa học phần"
                                                        disabled={saving}
                                                        onClick={() =>
                                                          void handleDeleteLessonPart(part)
                                                        }
                                                      >
                                                        <Trash2 />
                                                      </Button>
                                                    </div>
                                                  </TableCell>
                                                </>
                                              )}
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          )
                        })}
                        {isQuick ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit"
                            disabled={saving || importingChapterId === chapter.id}
                            onClick={() => addLessonRow(chapter.id)}
                          >
                            <Plus />
                            {ccMsg.addLessonRow}
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={Boolean(editingLesson)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLesson(null)
            setEditingLessonTitle("")
          }
        }}
      >
        <DialogContent className="LessonEditDialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài học</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              value={editingLessonTitle}
              onChange={(event) => setEditingLessonTitle(event.target.value)}
              placeholder="Tên bài học"
              aria-label="Tên bài học"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingLesson(null)
                setEditingLessonTitle("")
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleUpdateLesson()}>
              {saving ? <Loader2 className="animate-spin" /> : <Pencil />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newChapterDialogOpen} onOpenChange={setNewChapterDialogOpen}>
        <DialogContent className="CreateChapterDialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo chương mới</DialogTitle>
            <DialogDescription>Chương mới sẽ được thêm ở cuối danh sách.</DialogDescription>
          </DialogHeader>
          <Input
            value={newChapterTitle}
            onChange={(event) => setNewChapterTitle(event.target.value)}
            placeholder="Tên chương"
            aria-label="Tên chương mới"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNewChapterDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleCreateChapter()}>
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Tạo chương
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createLessonDialogOpen} onOpenChange={setCreateLessonDialogOpen}>
        <DialogContent className="CreateLessonDialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo bài học mới</DialogTitle>
            <DialogDescription>
              {selectedChapterForLesson
                ? `Tạo bài học trong chương "${selectedChapterForLesson.title}".`
                : "Chọn chương để tạo bài học."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              value={newLessonTitle}
              onChange={(event) => setNewLessonTitle(event.target.value)}
              placeholder="Tên bài học"
              aria-label="Tên bài học mới"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateLessonDialogOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleCreateLesson()}>
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Tạo bài học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createLessonPartDialogOpen}
        onOpenChange={(open) => {
          setCreateLessonPartDialogOpen(open)
          if (!open) {
            setSelectedLessonForPart(null)
            setNewLessonPartState(defaultLessonPartForm)
          }
        }}
      >
        <DialogContent className="CreateLessonPartDialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo học phần</DialogTitle>
            <DialogDescription>
              {selectedLessonForPart
                ? `Thêm học phần cho bài "${selectedLessonForPart.title}".`
                : "Chọn bài học để tạo học phần."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              value={newLessonPartState.title}
              onChange={(event) =>
                setNewLessonPartState((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              placeholder="Tên học phần"
              aria-label="Tên học phần"
            />
            <select
              value={newLessonPartState.videoType}
              className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
              onChange={(event) =>
                setNewLessonPartState((prev) => ({
                  ...prev,
                  videoType: event.target.value as LessonVideoType,
                }))
              }
              aria-label="Loại video"
            >
              <option value="youtube">youtube</option>
              <option value="iframe">iframe</option>
              <option value="vimeo">vimeo</option>
            </select>

            <Input
              value={newLessonPartState.videoUrl}
              onChange={(event) =>
                setNewLessonPartState((prev) => ({ ...prev, videoUrl: event.target.value }))
              }
              placeholder="Video URL"
              aria-label="Video URL"
            />

            <Input
              value={newLessonPartState.documentUrl}
              onChange={(event) =>
                setNewLessonPartState((prev) => ({
                  ...prev,
                  documentUrl: event.target.value,
                }))
              }
              placeholder="Tài liệu URL"
              aria-label="Tài liệu URL"
            />

            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={newLessonPartState.isPreview}
                onCheckedChange={(checked) =>
                  setNewLessonPartState((prev) => ({ ...prev, isPreview: checked }))
                }
              />
              <span>Cho phép xem trước</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateLessonPartDialogOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleCreateLessonPart()}>
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Tạo học phần
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingLessonPart)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLessonPart(null)
            setEditingLessonPartState(defaultLessonPartForm)
          }
        }}
      >
        <DialogContent className="LessonPartEditDialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học phần</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input
              value={editingLessonPartState.title}
              onChange={(event) =>
                setEditingLessonPartState((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              placeholder="Tên học phần"
              aria-label="Tên học phần"
            />
            <select
              value={editingLessonPartState.videoType}
              className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
              onChange={(event) =>
                setEditingLessonPartState((prev) => ({
                  ...prev,
                  videoType: event.target.value as LessonVideoType,
                }))
              }
              aria-label="Loại video"
            >
              <option value="youtube">youtube</option>
              <option value="iframe">iframe</option>
              <option value="vimeo">vimeo</option>
            </select>

            <Input
              value={editingLessonPartState.videoUrl}
              onChange={(event) =>
                setEditingLessonPartState((prev) => ({
                  ...prev,
                  videoUrl: event.target.value,
                }))
              }
              placeholder="Video URL"
              aria-label="Video URL"
            />

            <Input
              value={editingLessonPartState.documentUrl}
              onChange={(event) =>
                setEditingLessonPartState((prev) => ({
                  ...prev,
                  documentUrl: event.target.value,
                }))
              }
              placeholder="Tài liệu URL"
              aria-label="Tài liệu URL"
            />

            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={editingLessonPartState.isPreview}
                onCheckedChange={(checked) =>
                  setEditingLessonPartState((prev) => ({ ...prev, isPreview: checked }))
                }
              />
              <span>Cho phép xem trước</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingLessonPart(null)
                setEditingLessonPartState(defaultLessonPartForm)
              }}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleUpdateLessonPart()}>
              {saving ? <Loader2 className="animate-spin" /> : <Pencil />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
