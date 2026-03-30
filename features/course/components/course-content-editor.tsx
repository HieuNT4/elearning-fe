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
import { chapterLessonService, courseService } from "../services"
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

          return (
            <Card key={chapter.id}>
              <Collapsible
                open={isChapterOpen}
                onOpenChange={(nextOpen) =>
                  setOpenMap((prev) => ({ ...prev, [chapter.id]: nextOpen }))
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        Chương {chapterIndex + 1}: {chapter.title}
                      </CardTitle>
                      <CardDescription>{chapter.lessons.length} bài học</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={saving || chapterIndex === 0}
                        aria-label={`Đưa chương ${chapter.title} lên trên`}
                        onClick={() => void handleMoveChapter(chapter.id, "up")}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={saving || chapterIndex === chapters.length - 1}
                        aria-label={`Đưa chương ${chapter.title} xuống dưới`}
                        onClick={() => void handleMoveChapter(chapter.id, "down")}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                            className={isChapterOpen ? "transition-transform rotate-180" : "transition-transform"}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="grid gap-4">
                    {chapter.lessons.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        Chưa có bài học trong chương này.
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {chapter.lessons.map((lesson) => (
                          <Collapsible
                            key={lesson.id}
                            open={openLessonMap[lesson.id] ?? false}
                            onOpenChange={(nextOpen) => {
                              setOpenLessonMap((prev) => ({
                                ...prev,
                                [lesson.id]: nextOpen,
                              }))
                            }}
                          >
                            <div className="rounded-xl border bg-card p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        aria-label={
                                          openLessonMap[lesson.id]
                                            ? `Thu gọn học phần của ${lesson.title}`
                                            : `Mở học phần của ${lesson.title}`
                                        }
                                        disabled={saving}
                                      >
                                        <ChevronDown
                                          className={
                                            openLessonMap[lesson.id]
                                              ? "transition-transform rotate-180"
                                              : "transition-transform"
                                          }
                                        />
                                      </Button>
                                    </CollapsibleTrigger>
                                    <div className="text-sm font-semibold leading-snug">
                                      {lesson.title}
                                    </div>
                                  </div>
                                  <div className="text-xs leading-normal text-muted-foreground">
                                    {lesson.lessonParts.length} học phần
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
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
                                            <TableCell>{part.isPreview ? "Có" : "Không"}</TableCell>
                                            <TableCell>
                                              <div className="flex items-center justify-end gap-2">
                                                <Button
                                                  type="button"
                                                  size="icon-sm"
                                                  variant="outline"
                                                  aria-label="Sửa học phần"
                                                  disabled={saving}
                                                  onClick={() => openEditLessonPartDialog(part)}
                                                >
                                                  <Pencil />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  size="icon-sm"
                                                  variant="destructive"
                                                  aria-label="Xóa học phần"
                                                  disabled={saving}
                                                  onClick={() => void handleDeleteLessonPart(part)}
                                                >
                                                  <Trash2 />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
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
