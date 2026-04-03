"use client"

import { BookKey, Loader2, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CourseMultiCombobox } from "@/features/combo/components/course-multi-combobox"
import { courseService } from "@/features/course/services/course.service"
import type { CourseItem } from "@/features/course/types"

import { userCourseGrantsDialogMessagesVi as msgs } from "../messages/user-course-grants-dialog"
import { courseGrantAdminService } from "../services/course-grant-admin.service"
import type { CourseGrantsAdminResponse } from "../types"
import { courseGrantsAddSchema, courseGrantsSetSchema } from "../validations/course-grant.schema"

type UserCourseGrantsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("vi-VN")
}

export function UserCourseGrantsDialog({
  open,
  onOpenChange,
  email,
}: UserCourseGrantsDialogProps) {
  const [grantsData, setGrantsData] = useState<CourseGrantsAdminResponse | null>(null)
  const [pickerCourses, setPickerCourses] = useState<CourseItem[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grantedCourseIds = useMemo(
    () => new Set((grantsData?.courses ?? []).map((c) => c.courseId)),
    [grantsData?.courses]
  )

  const addableCourses = useMemo(
    () => pickerCourses.filter((c) => !grantedCourseIds.has(c.id)),
    [pickerCourses, grantedCourseIds]
  )

  const loadAll = useCallback(async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setGrantsData(null)
    setPickerCourses([])

    const grantsResult = await Promise.resolve(
      courseGrantAdminService.getByEmail(trimmed)
    ).then(
      (data) => ({ ok: true as const, data }),
      (cause: unknown) => ({
        ok: false as const,
        message: cause instanceof Error ? cause.message : msgs.loadError,
      })
    )

    const coursesResult = await Promise.resolve(
      courseService.listAdminCoursesForPicker()
    ).then(
      (list) => ({ ok: true as const, list }),
      (cause: unknown) => ({
        ok: false as const,
        message: cause instanceof Error ? cause.message : msgs.coursesLoadError,
      })
    )

    if (grantsResult.ok) {
      setGrantsData(grantsResult.data)
    }
    if (coursesResult.ok) {
      setPickerCourses(coursesResult.list)
    }

    const parts: string[] = []
    if (!grantsResult.ok) {
      parts.push(`${msgs.loadError} ${grantsResult.message}`)
    }
    if (!coursesResult.ok) {
      parts.push(`${msgs.coursesLoadError} ${coursesResult.message}`)
    }
    if (parts.length > 0) {
      setError(parts.join(" · "))
    }

    setLoading(false)
  }, [email])

  useEffect(() => {
    if (!open) {
      setGrantsData(null)
      setPickerCourses([])
      setSelectedToAdd([])
      setError(null)
      return
    }
    void loadAll()
  }, [open, loadAll])

  async function handleAddGrants() {
    const targetEmail = (grantsData?.email ?? email).trim().toLowerCase()
    const parsed = courseGrantsAddSchema.safeParse({
      email: targetEmail,
      courseIds: selectedToAdd,
    })
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join("; ") || msgs.addValidationError)
      return
    }
    setActionBusy(true)
    setError(null)
    try {
      const next = await courseGrantAdminService.addCourses(parsed.data)
      setGrantsData(next)
      setSelectedToAdd([])
    } catch (addErr) {
      setError(addErr instanceof Error ? addErr.message : msgs.loadError)
    } finally {
      setActionBusy(false)
    }
  }

  async function handleRevoke(courseId: string) {
    if (!window.confirm(msgs.revokeConfirm)) return
    const targetEmail = (grantsData?.email ?? email).trim().toLowerCase()
    setActionBusy(true)
    setError(null)
    try {
      const next = await courseGrantAdminService.revokeOne(targetEmail, courseId)
      setGrantsData(next)
    } catch (revokeErr) {
      setError(revokeErr instanceof Error ? revokeErr.message : msgs.loadError)
    } finally {
      setActionBusy(false)
    }
  }

  async function handleClearAllGrants() {
    if (!window.confirm(msgs.clearAllConfirm)) return
    const targetEmail = (grantsData?.email ?? email).trim().toLowerCase()
    const parsed = courseGrantsSetSchema.safeParse({
      email: targetEmail,
      courseIds: [],
    })
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join("; "))
      return
    }
    setActionBusy(true)
    setError(null)
    try {
      const next = await courseGrantAdminService.setCourses(parsed.data)
      setGrantsData(next)
    } catch (clearErr) {
      setError(clearErr instanceof Error ? clearErr.message : msgs.loadError)
    } finally {
      setActionBusy(false)
    }
  }

  const displayEmail = (grantsData?.email ?? email).trim().toLowerCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="UserCourseGrantsDialog flex max-h-[min(90vh,720px)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <BookKey className="size-5 shrink-0" aria-hidden />
            {msgs.title}
          </DialogTitle>
          <DialogDescription className="text-pretty">{msgs.description}</DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-4">
          <div className="grid gap-1">
            <span className="text-muted-foreground text-xs font-medium">{msgs.emailLabel}</span>
            <Input readOnly value={displayEmail} aria-label={msgs.emailLabel} className="bg-muted/40" />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <div
              className="flex flex-col items-center gap-2 py-10 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
              <span className="text-sm">{msgs.saving}</span>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <h3 className="text-sm font-semibold leading-tight">{msgs.grantedHeading}</h3>
                {grantsData && grantsData.courses.length === 0 ? (
                  <p className="text-muted-foreground text-sm leading-normal">{msgs.emptyGrants}</p>
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{msgs.colTitle}</TableHead>
                          <TableHead className="hidden sm:table-cell">{msgs.colSlug}</TableHead>
                          <TableHead>{msgs.colPublished}</TableHead>
                          <TableHead className="hidden md:table-cell">{msgs.colGrantedAt}</TableHead>
                          <TableHead className="text-right">{msgs.colActions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(grantsData?.courses ?? []).map((row) => (
                          <TableRow key={row.grantId}>
                            <TableCell className="max-w-[200px] font-medium">
                              <span className="line-clamp-2">{row.title}</span>
                            </TableCell>
                            <TableCell className="hidden max-w-[140px] truncate text-muted-foreground sm:table-cell">
                              {row.slug}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {row.isPublished ? msgs.published : msgs.draft}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                              {formatDate(row.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="destructive"
                                disabled={actionBusy}
                                aria-label={`${msgs.revoke} ${row.title}`}
                                onClick={() => void handleRevoke(row.courseId)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="grid gap-2 border-t pt-4">
                <h3 className="text-sm font-semibold leading-tight">{msgs.addSection}</h3>
                <CourseMultiCombobox
                  courses={addableCourses}
                  value={selectedToAdd}
                  onChange={setSelectedToAdd}
                  disabled={actionBusy || addableCourses.length === 0}
                />
                <Button
                  type="button"
                  disabled={actionBusy || selectedToAdd.length === 0}
                  onClick={() => void handleAddGrants()}
                >
                  {actionBusy ? <Loader2 className="animate-spin" /> : null}
                  {msgs.addButton}
                </Button>
              </div>

              {grantsData && grantsData.courses.length > 0 ? (
                <div className="border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={actionBusy}
                    onClick={() => void handleClearAllGrants()}
                  >
                    {msgs.clearAll}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {msgs.close}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading || actionBusy}
            onClick={() => void loadAll()}
          >
            {msgs.refresh}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
