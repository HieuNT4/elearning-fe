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
import { Textarea } from "@/components/ui/textarea"
import type { CourseItem } from "@/features/course/types"
import type { ComboItem } from "../types"
import type { ComboModalFormData } from "../validations"
import { comboModalSchema } from "../validations"
import { CourseMultiCombobox } from "./course-multi-combobox"

type ComboFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  combo: ComboItem | null
  /** When mode is edit: `null` = parent is still loading course ids; array = ready to reset form */
  editCourseIdsPreset: string[] | null
  courses: CourseItem[]
  coursesLoading: boolean
  isSubmitting: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ComboModalFormData) => Promise<void>
}

export function ComboFormDialog({
  open,
  mode,
  combo,
  editCourseIdsPreset,
  courses,
  coursesLoading,
  isSubmitting,
  error,
  onOpenChange,
  onSubmit,
}: ComboFormDialogProps) {
  type ComboModalSchemaInput = z.input<typeof comboModalSchema>

  const defaultValues = useMemo<ComboModalSchemaInput>(
    () => ({
      title: "",
      description: "",
      thumbnail: "",
      price: 0,
      courseIds: [],
    }),
    []
  )

  const form = useForm<ComboModalSchemaInput, unknown, ComboModalFormData>({
    resolver: zodResolver(comboModalSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (mode === "create") {
      form.reset(defaultValues)
      return
    }

    if (mode === "edit" && combo?.id && editCourseIdsPreset !== null) {
      form.reset({
        title: combo.title,
        description: combo.description ?? "",
        thumbnail: combo.thumbnail ?? "",
        price: combo.price,
        courseIds: editCourseIdsPreset,
      })
    }
  }, [open, mode, combo, defaultValues, editCourseIdsPreset, form])

  async function handleSubmit(data: ComboModalFormData) {
    await onSubmit(data)
  }

  const editPresetPending = mode === "edit" && editCourseIdsPreset === null
  const dialogBusy = coursesLoading || editPresetPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ComboFormDialog sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tạo combo" : "Sửa combo"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Combo mới mặc định chưa công khai. Bạn có thể bật sau trong bảng."
              : "Cập nhật thông tin và danh sách khóa học trong combo."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)} id="combo-form">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tên combo"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      disabled={isSubmitting || dialogBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value || 0))}
                        disabled={isSubmitting || dialogBusy}
                      />
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
                    <FormLabel>Thumbnail (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={isSubmitting || dialogBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả combo"
                      rows={4}
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      disabled={isSubmitting || dialogBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khóa học</FormLabel>
                  <FormControl>
                    <CourseMultiCombobox
                      courses={courses}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting || dialogBusy}
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
          <Button type="submit" form="combo-form" disabled={isSubmitting || dialogBusy}>
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
