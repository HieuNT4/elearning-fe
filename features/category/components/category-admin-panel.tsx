"use client"

import { Loader2, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CategoryItem, CreateCategoryPayload } from "../types"
import { categoryAdminService } from "../services/category-admin.service"
import { CategoryFormDialog } from "./category-form-dialog"

export function CategoryAdminPanel() {
  const [items, setItems] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [dialogSubmitting, setDialogSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null)

  const loadData = useCallback(async (showMainLoading: boolean) => {
    if (showMainLoading) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      const list = await categoryAdminService.listCategories()
      setItems(list)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh mục")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadData(true)
  }, [loadData])

  function handleOpenCreate() {
    setDialogMode("create")
    setEditingItem(null)
    setDialogError(null)
    setDialogOpen(true)
  }

  function handleOpenEdit(item: CategoryItem) {
    setDialogMode("edit")
    setEditingItem(item)
    setDialogError(null)
    setDialogOpen(true)
  }

  async function handleSubmit(payload: CreateCategoryPayload) {
    setDialogSubmitting(true)
    setDialogError(null)
    try {
      if (dialogMode === "create") {
        await categoryAdminService.createCategory(payload)
      } else if (editingItem?.id) {
        await categoryAdminService.updateCategory(editingItem.id, payload)
      }
      setDialogOpen(false)
      await loadData(false)
    } catch (submitError) {
      setDialogError(
        submitError instanceof Error ? submitError.message : "Không thể lưu danh mục"
      )
    } finally {
      setDialogSubmitting(false)
    }
  }

  return (
    <div className="CategoryAdminPanel flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
          <CardDescription>
            Dữ liệu đồng bộ với API backend: tên danh mục dùng field{" "}
            <code className="text-xs">title</code>, slug tuỳ chọn.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadData(false)}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
            Làm mới
          </Button>
          <Button type="button" onClick={handleOpenCreate}>
            <Plus />
            Tạo danh mục
          </Button>
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
          aria-label="Đang tải danh mục"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
            <div className="text-sm font-medium text-muted-foreground">Đang tải danh mục...</div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có danh mục nào.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isBusy = confirmOpen && deleteTarget?.id === item.id
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[280px] font-medium">{item.title}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {item.slug}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={isBusy}
                            aria-label={`Sửa ${item.title}`}
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            disabled={isBusy}
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

      <CategoryFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialData={editingItem}
        isSubmitting={dialogSubmitting}
        error={dialogError}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="CategoryDeleteConfirmDialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa danh mục</DialogTitle>
            <DialogDescription>
              Xóa &quot;{deleteTarget?.title ?? ""}&quot;? Các khóa học liên quan có thể bị gỡ liên kết
              theo quy tắc backend.
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
              onClick={() => {
                if (!deleteTarget) return
                const target = deleteTarget
                setConfirmLoading(true)
                setError(null)
                void categoryAdminService
                  .deleteCategory(target.id)
                  .then(async () => {
                    setConfirmOpen(false)
                    setDeleteTarget(null)
                    await loadData(false)
                  })
                  .catch((deleteError) => {
                    setError(
                      deleteError instanceof Error
                        ? deleteError.message
                        : "Không thể xóa danh mục"
                    )
                  })
                  .finally(() => {
                    setConfirmLoading(false)
                  })
              }}
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
