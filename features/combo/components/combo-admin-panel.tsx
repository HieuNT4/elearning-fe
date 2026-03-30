"use client"

import { Loader2, Pencil, Plus, Power, RefreshCcw, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CourseItem } from "@/features/course/types"
import { courseService } from "@/features/course/services"
import type { ComboItem, CreateComboPayload } from "../types"
import type { AdminComboListQuery, ComboSort } from "../types"
import { comboAdminService } from "../services/combo-admin.service"
import type { ComboModalFormData } from "../validations"
import { ComboFormDialog } from "./combo-form-dialog"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | undefined): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("vi-VN")
}

const sortOptions: Array<{ value: ComboSort; label: string }> = [
  { value: "created_desc", label: "Mới nhất" },
  { value: "title_asc", label: "Tên A-Z" },
  { value: "title_desc", label: "Tên Z-A" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
]

export function ComboAdminPanel() {
  const [items, setItems] = useState<ComboItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort, setSort] = useState<ComboSort>("created_desc")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingCombo, setEditingCombo] = useState<ComboItem | null>(null)
  /** Edit dialog: `null` until courses in combo are loaded */
  const [editCourseIdsPreset, setEditCourseIdsPreset] = useState<string[] | null>(null)
  const [dialogSubmitting, setDialogSubmitting] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ComboItem | null>(null)

  const query = useMemo<AdminComboListQuery>(
    () => ({
      page,
      limit,
      sort,
    }),
    [limit, page, sort]
  )

  const loadCombos = useCallback(
    async (showMainLoading: boolean) => {
      if (showMainLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)
      try {
        const response = await comboAdminService.listAdminCombos(query)
        setItems(response.data ?? [])
        setTotalPages(Math.max(response.meta?.totalPages ?? 1, 1))
        setTotal(response.meta?.total ?? 0)
      } catch (loadErr) {
        setError(loadErr instanceof Error ? loadErr.message : "Không thể tải combo")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [query]
  )

  useEffect(() => {
    void loadCombos(true)
  }, [loadCombos])

  useEffect(() => {
    let cancelled = false
    void courseService
      .listAdminCourses({ page: 1, limit: 100, sort: "created_desc" })
      .then((response) => {
        if (!cancelled) setCourses(response.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setCourses([])
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleOpenCreate() {
    setDialogMode("create")
    setEditingCombo(null)
    setEditCourseIdsPreset(null)
    setDialogError(null)
    setDialogOpen(true)
  }

  async function handleOpenEdit(item: ComboItem) {
    setDialogMode("edit")
    setEditingCombo(item)
    setDialogError(null)
    setEditCourseIdsPreset(null)
    setDialogOpen(true)
    try {
      const list = await comboAdminService.listComboCourses(item.id)
      setEditCourseIdsPreset(list.map((c) => c.id))
    } catch {
      setEditCourseIdsPreset([])
    }
  }

  async function syncComboCourses(comboId: string, nextIds: string[]) {
    const oldList = await comboAdminService.listComboCourses(comboId)
    const oldSet = new Set(oldList.map((c) => c.id))
    const newSet = new Set(nextIds)

    for (const courseId of oldSet) {
      if (!newSet.has(courseId)) {
        await comboAdminService.removeCourseFromCombo(comboId, courseId)
      }
    }

    const toAdd = nextIds.filter((id) => !oldSet.has(id))
    if (toAdd.length) {
      await comboAdminService.addCoursesToCombo(comboId, toAdd)
    }
  }

  async function handleDialogSubmit(data: ComboModalFormData) {
    setDialogSubmitting(true)
    setDialogError(null)
    try {
      const description = data.description?.trim() ?? ""
      const thumbnail = data.thumbnail?.trim() ?? ""

      if (dialogMode === "create") {
        const payload: CreateComboPayload = {
          title: data.title.trim(),
          ...(description ? { description } : {}),
          ...(thumbnail ? { thumbnail } : {}),
          price: data.price,
        }
        const created = await comboAdminService.createCombo(payload)
        await syncComboCourses(created.id, data.courseIds)
        setDialogOpen(false)
        await loadCombos(false)
        return
      }

      if (dialogMode === "edit" && editingCombo?.id) {
        await comboAdminService.updateCombo(editingCombo.id, {
          title: data.title.trim(),
          ...(description ? { description } : {}),
          ...(thumbnail ? { thumbnail } : {}),
          price: data.price,
        })
        await syncComboCourses(editingCombo.id, data.courseIds)
        setDialogOpen(false)
        await loadCombos(false)
      }
    } catch (submitErr) {
      setDialogError(
        submitErr instanceof Error ? submitErr.message : "Không thể lưu combo"
      )
    } finally {
      setDialogSubmitting(false)
    }
  }

  async function handleTogglePublish(item: ComboItem) {
    setActionLoadingId(item.id)
    setError(null)
    try {
      await comboAdminService.togglePublish(item.id)
      await loadCombos(false)
    } catch (toggleErr) {
      setError(
        toggleErr instanceof Error ? toggleErr.message : "Không thể đổi trạng thái combo"
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget?.id) return
    setConfirmLoading(true)
    setError(null)
    try {
      await comboAdminService.deleteCombo(deleteTarget.id)
      setConfirmOpen(false)
      setDeleteTarget(null)
      await loadCombos(false)
    } catch (deleteErr) {
      setError(deleteErr instanceof Error ? deleteErr.message : "Không thể xóa combo")
    } finally {
      setConfirmLoading(false)
    }
  }

  const isPageLoading = loading

  return (
    <div className="ComboAdminPanel flex flex-col gap-4">
      {isPageLoading ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Đang tải"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
            <div className="text-sm font-medium text-muted-foreground">Đang tải...</div>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Combo</CardTitle>
            <CardDescription>Danh sách combo và thao tác quản trị.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadCombos(false)}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              Làm mới
            </Button>
            <Button type="button" size="sm" onClick={handleOpenCreate}>
              <Plus />
              Tạo combo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(event) => {
              setPage(1)
              setSort(event.target.value as ComboSort)
            }}
            className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
            aria-label="Sắp xếp combo"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? null : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Chưa có combo nào.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead className="max-w-[140px]">Thumbnail</TableHead>
                  <TableHead className="max-w-[220px]">Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const busy = actionLoadingId === item.id
                  const desc = item.description?.trim()
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[200px] font-medium">
                        <span className="line-clamp-2">{item.title}</span>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell className="max-w-[140px]">
                        {item.thumbnail ? (
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {item.thumbnail}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] text-muted-foreground">
                        {desc ? (
                          <span className="line-clamp-2 text-sm">{desc}</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            item.isPublished
                              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400"
                              : "rounded-md border border-muted-foreground/20 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                          }
                        >
                          {item.isPublished ? "Công khai" : "Ẩn"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(item.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={busy}
                            aria-label={`Sửa ${item.title}`}
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={busy}
                            aria-label={
                              item.isPublished ? `Ẩn combo ${item.title}` : `Công khai ${item.title}`
                            }
                            onClick={() => void handleTogglePublish(item)}
                          >
                            <Power />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            disabled={busy}
                            aria-label={`Xóa ${item.title}`}
                            onClick={() => {
                              setDeleteTarget(item)
                              setConfirmOpen(true)
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && items.length > 0 ? (
        <Card size="sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Tổng: {total} combo — Trang {page}/{totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading || refreshing}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading || refreshing}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Sau
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <ComboFormDialog
        open={dialogOpen}
        mode={dialogMode}
        combo={editingCombo}
        editCourseIdsPreset={dialogMode === "edit" ? editCourseIdsPreset : null}
        courses={courses}
        coursesLoading={coursesLoading}
        isSubmitting={dialogSubmitting}
        error={dialogError}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) {
            setEditCourseIdsPreset(null)
          }
        }}
        onSubmit={handleDialogSubmit}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="ComboDeleteConfirmDialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa combo</DialogTitle>
            <DialogDescription>
              Xóa &quot;{deleteTarget?.title ?? ""}&quot;? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={confirmLoading}
              onClick={() => setConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmLoading}
              onClick={() => void handleConfirmDelete()}
            >
              {confirmLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
