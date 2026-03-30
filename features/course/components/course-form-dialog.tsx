"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { CategoryItem, CourseItem, UpsertCoursePayload } from "../types"
import { createCourseSchema, type CreateCourseFormData } from "../validations"

type CourseFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  initialData: CourseItem | null
  categories: CategoryItem[]
  categoriesLoading: boolean
  isSubmitting: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UpsertCoursePayload) => Promise<void>
}

export function CourseFormDialog({
  open,
  mode,
  initialData,
  categories,
  categoriesLoading,
  isSubmitting,
  error,
  onOpenChange,
  onSubmit,
}: CourseFormDialogProps) {
  type CreateCourseSchemaInput = z.input<typeof createCourseSchema>

  const defaultValues = useMemo<CreateCourseSchemaInput>(
    () => ({
      categoryId: initialData?.categoryId ?? "",
      title: initialData?.title ?? "",
      summary: initialData?.summary ?? "",
      description: initialData?.description ?? "",
      thumbnail: initialData?.thumbnail ?? "",
      price: initialData?.price ?? 0,
      oldPrice: initialData?.oldPrice ?? undefined,
    }),
    [initialData]
  )

  const form = useForm<CreateCourseSchemaInput, unknown, CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  async function handleSubmit(data: CreateCourseFormData) {
    const categoryId = data.categoryId?.trim() ? data.categoryId.trim() : undefined
    await onSubmit({
      categoryId,
      title: data.title,
      summary: data.summary?.trim() ? data.summary.trim() : undefined,
      description: data.description?.trim() ? data.description.trim() : undefined,
      thumbnail: data.thumbnail?.trim() ? data.thumbnail.trim() : undefined,
      price: data.price,
      oldPrice: data.oldPrice,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="CourseFormDialog sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tạo khóa học" : "Cập nhật khóa học"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Thêm khóa học mới vào danh mục đào tạo."
              : "Chỉnh sửa thông tin và giá khóa học."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
            id="course-form"
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      disabled={categoriesLoading}
                      aria-label="Chọn danh mục khóa học"
                    >
                      <option value="">
                        {categoriesLoading ? "Đang tải danh mục..." : "Chọn danh mục"}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="React Cơ Bản" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tóm tắt</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả ngắn hiển thị ở danh sách" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả đầy đủ nội dung khóa học" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL ảnh đại diện</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/course-thumbnail.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>Giá bán</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value || 0))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oldPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá cũ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value
                          field.onChange(value ? Number(value) : undefined)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" form="course-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Đang lưu...
              </>
            ) : mode === "create" ? (
              "Tạo"
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
