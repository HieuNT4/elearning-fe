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
import type { CategoryItem, CreateCategoryPayload } from "../types"
import { createCategorySchema, type CreateCategoryFormData } from "../validations"

type CategoryFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  initialData: CategoryItem | null
  isSubmitting: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateCategoryPayload) => Promise<void>
}

export function CategoryFormDialog({
  open,
  mode,
  initialData,
  isSubmitting,
  error,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  type SchemaInput = z.input<typeof createCategorySchema>

  const defaultValues = useMemo<SchemaInput>(
    () => ({
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
    }),
    [initialData]
  )

  const form = useForm<SchemaInput, unknown, CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])

  async function handleSubmit(data: CreateCategoryFormData) {
    await onSubmit({
      title: data.title.trim(),
      ...(data.slug?.trim() ? { slug: data.slug.trim() } : {}),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="CategoryFormDialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tạo danh mục" : "Sửa danh mục"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Tên hiển thị bắt buộc. Slug có thể để trống — server sẽ tạo từ tên (tiếng Việt)."
              : "Cập nhật tên hoặc slug theo API backend."}
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
            id="category-form"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Lập trình Web" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="lap-trinh-web"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Đang lưu...
              </>
            ) : mode === "create" ? (
              "Tạo"
            ) : (
              "Lưu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
