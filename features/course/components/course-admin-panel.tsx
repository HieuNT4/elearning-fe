"use client"

import { Loader2, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"
import Link from "next/link"
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
import type {
  AdminCourseListQuery,
  CategoryItem,
  CourseItem,
  CourseSort,
  UpsertCoursePayload,
} from "../types"
import { categoryService, courseService } from "../services"
import { CourseFormDialog } from "./course-form-dialog"

const sortOptions: Array<{ value: CourseSort; label: string }> = [
  { value: "created_desc", label: "Mới nhất" },
  { value: "title_asc", label: "Tên A-Z" },
  { value: "title_desc", label: "Tên Z-A" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("vi-VN")
}

export function CourseAdminPanel() {
  const [items, setItems] = useState<CourseItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [sort, setSort] = useState<CourseSort>("created_desc")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [dialogSubmitting, setDialogSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<CourseItem | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"toggle" | "delete" | null>(null)
  const [selectedItem, setSelectedItem] = useState<CourseItem | null>(null)

  const query = useMemo<AdminCourseListQuery>(
    () => ({
      page,
      limit,
      q: search || undefined,
      sort,
      categoryId: categoryFilter || undefined,
    }),
    [categoryFilter, limit, page, search, sort]
  )

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) {
      map.set(category.id, category.title)
    }
    return map
  }, [categories])

  const loadData = useCallback(
    async (showMainLoading: boolean) => {
      if (showMainLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      setError(null)

      try {
        const response = await courseService.listAdminCourses(query)
        setItems(response.data ?? [])
        setTotalPages(Math.max(response.meta?.totalPages ?? 1, 1))
        setTotal(response.meta?.total ?? 0)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách khóa học")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [query]
  )

  useEffect(() => {
    void loadData(true)
  }, [loadData])

  useEffect(() => {
    let cancelled = false
    void categoryService
      .listCategories()
      .then((list) => {
        if (!cancelled) setCategories(list)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)

    return () => clearTimeout(timeout)
  }, [searchInput])

  function handleOpenCreateDialog() {
    setDialogMode("create")
    setEditingItem(null)
    setDialogError(null)
    setDialogOpen(true)
  }

  function handleOpenEditDialog(item: CourseItem) {
    setDialogMode("edit")
    setEditingItem(item)
    setDialogError(null)
    setDialogOpen(true)
  }

  async function handleSubmitCourse(payload: UpsertCoursePayload) {
    setDialogSubmitting(true)
    setDialogError(null)
    try {
      if (dialogMode === "create") {
        await courseService.createCourse(payload)
      } else if (editingItem?.id) {
        await courseService.updateCourse(editingItem.id, payload)
      }
      setDialogOpen(false)
      await loadData(false)
    } catch (submitError) {
      setDialogError(
        submitError instanceof Error ? submitError.message : "Không thể lưu khóa học"
      )
    } finally {
      setDialogSubmitting(false)
    }
  }

  async function handleTogglePublish(item: CourseItem) {
    setActionLoadingId(item.id)
    setError(null)
    try {
      await courseService.togglePublish(item.id)
      await loadData(false)
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Không thể cập nhật trạng thái khóa học")
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDelete(item: CourseItem) {
    setActionLoadingId(item.id)
    setError(null)
    try {
      await courseService.deleteCourse(item.id)
      await loadData(false)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa khóa học")
    } finally {
      setActionLoadingId(null)
    }
  }

  function openConfirmModal(action: "toggle" | "delete", item: CourseItem) {
    setSelectedItem(item)
    setConfirmAction(action)
    setConfirmOpen(true)
  }

  async function handleConfirmAction() {
    if (!selectedItem || !confirmAction) return

    setConfirmLoading(true)
    try {
      if (confirmAction === "toggle") {
        await handleTogglePublish(selectedItem)
      }

      if (confirmAction === "delete") {
        await handleDelete(selectedItem)
      }
      setConfirmOpen(false)
      setSelectedItem(null)
      setConfirmAction(null)
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="CourseAdminPanel flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý khóa học</CardTitle>
          <CardDescription>
            Quản lý danh sách khóa học cho quản trị viên: tạo, sửa, bật/tắt và xóa.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên khóa học..."
            aria-label="Tìm khóa học theo tên"
          />
          <select
            value={categoryFilter}
            onChange={(event) => {
              setPage(1)
              setCategoryFilter(event.target.value)
            }}
            className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
            aria-label="Lọc khóa học theo danh mục"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => {
              setPage(1)
              setSort(event.target.value as CourseSort)
            }}
            className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
            aria-label="Sắp xếp khóa học"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadData(false)}
              disabled={refreshing}
            >
              {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
              Làm mới
            </Button>
            <Button type="button" onClick={handleOpenCreateDialog}>
              <Plus />
              Tạo mới
            </Button>
          </div>
        </CardContent>
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
          aria-label="Đang tải khóa học"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
            <div className="text-sm font-medium text-muted-foreground">Đang tải danh sách khóa học...</div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Không tìm thấy khóa học.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead>Giá cũ</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isActionLoading = actionLoadingId === item.id
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[240px] truncate font-medium">
                        <Link
                          href={`/admin/courses/${item.id}`}
                          className="hover:underline"
                          aria-label={`Xem chi tiết khóa học ${item.title}`}
                        >
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-muted-foreground">
                        {item.category?.title ??
                          (item.categoryId ? categoryNameById.get(item.categoryId) : null) ??
                          "—"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {item.slug}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        {item.oldPrice !== null ? formatCurrency(item.oldPrice) : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isPublished}
                          disabled={isActionLoading}
                          aria-label={
                            item.isPublished
                              ? `Tắt hoạt động ${item.title}`
                              : `Bật hoạt động ${item.title}`
                          }
                          onCheckedChange={() => openConfirmModal("toggle", item)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={isActionLoading}
                            aria-label={`Sửa ${item.title}`}
                            onClick={() => handleOpenEditDialog(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            disabled={isActionLoading}
                            aria-label={`Xóa ${item.title}`}
                            onClick={() => openConfirmModal("delete", item)}
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

      <Card size="sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Tổng: {total} khóa học - Trang {page}/{totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || loading || refreshing}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || loading || refreshing}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Sau
            </Button>
          </div>
        </CardContent>
      </Card>

      <CourseFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialData={editingItem}
        categories={categories}
        categoriesLoading={categoriesLoading}
        isSubmitting={dialogSubmitting}
        error={dialogError}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitCourse}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="CourseActionConfirmDialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "delete" ? "Xác nhận xóa khóa học" : "Xác nhận thay đổi trạng thái"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "delete"
                ? `Bạn có chắc muốn xóa khóa học "${selectedItem?.title ?? ""}" không?`
                : `Bạn có chắc muốn ${
                    selectedItem?.isPublished ? "tắt hoạt động" : "kích hoạt"
                  } khóa học "${selectedItem?.title ?? ""}" không?`}
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
              variant={confirmAction === "delete" ? "destructive" : "default"}
              disabled={confirmLoading}
              onClick={() => void handleConfirmAction()}
            >
              {confirmLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang xử lý...
                </>
              ) : confirmAction === "delete" ? (
                "Xóa"
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
