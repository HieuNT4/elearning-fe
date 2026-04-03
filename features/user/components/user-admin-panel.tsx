"use client"

import { BookKey, Loader2, Plus, RefreshCcw } from "lucide-react"
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
import { UserCourseGrantsDialog } from "@/features/course-grant"

import { CreateUserDialog } from "./create-user-dialog"
import type { AdminUserItem, AdminUserListQuery, CreateUserPayload } from "../types"
import { userAdminService } from "../services/user-admin.service"

function formatDate(value?: string): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("vi-VN")
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getPurchasedCourseTitles(user: AdminUserItem): string[] {
  const directCourses = user.purchasedCourses ?? user.courses ?? []
  const fromDirect = directCourses
    .map((course) => course.title?.trim() ?? course.name?.trim() ?? "")
    .filter((title) => title.length > 0)

  const fromOrders = (user.orders ?? []).flatMap((order) =>
    (order.items ?? [])
      .map(
        (item) =>
          item.courseTitle?.trim() ??
          item.title?.trim() ??
          item.course?.title?.trim() ??
          item.course?.name?.trim() ??
          ""
      )
      .filter((title) => title.length > 0)
  )

  return Array.from(new Set([...fromDirect, ...fromOrders]))
}

function getTotalPaid(user: AdminUserItem): number {
  if (typeof user.totalPaid === "number") return user.totalPaid
  if (typeof user.totalSpent === "number") return user.totalSpent
  if (typeof user.paidAmount === "number") return user.paidAmount

  return (user.orders ?? []).reduce((sum, order) => {
    const status = order.status?.toUpperCase() ?? ""
    const isPaidByStatus = status === "PAID" || status === "SUCCESS" || status === "COMPLETED"
    const isPaid = order.isPaid === true || Boolean(order.paidAt) || isPaidByStatus
    if (!isPaid) return sum
    const amount = order.finalAmount ?? order.totalAmount ?? order.amount ?? 0
    return sum + amount
  }, 0)
}

export function UserAdminPanel() {
  const [items, setItems] = useState<AdminUserItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [grantsDialogOpen, setGrantsDialogOpen] = useState(false)
  const [grantsDialogEmail, setGrantsDialogEmail] = useState("")

  const query = useMemo<AdminUserListQuery>(
    () => ({
      page,
      limit,
      q: search || undefined,
    }),
    [limit, page, search]
  )

  const loadData = useCallback(
    async (showMainLoading: boolean) => {
      if (showMainLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)
      try {
        const response = await userAdminService.listUsers(query)
        setItems(response.data ?? [])
        setTotalPages(Math.max(response.meta?.totalPages ?? 1, 1))
        setTotal(response.meta?.total ?? 0)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách người dùng")
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
    const timeout = setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchInput])

  async function handleCreateUser(payload: CreateUserPayload) {
    setCreateSubmitting(true)
    setCreateError(null)
    try {
      await userAdminService.createUser(payload)
      setCreateOpen(false)
      await loadData(false)
    } catch (submitError) {
      setCreateError(
        submitError instanceof Error ? submitError.message : "Không thể tạo người dùng mới"
      )
    } finally {
      setCreateSubmitting(false)
    }
  }

  async function handleToggleActive(item: AdminUserItem, isActive: boolean) {
    setActionLoadingId(item.id)
    setError(null)
    try {
      await userAdminService.updateActive(item.id, { isActive })
      setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, isActive } : current)))
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Không thể cập nhật trạng thái")
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="UserAdminPanel flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Tìm kiếm, tạo user, bật/tắt active và gán quyền học khóa (GRANT) theo email — không thay thế
            quyền đã mua (PURCHASE).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo email..."
            aria-label="Tìm theo email"
          />
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
            <Button
              type="button"
              onClick={() => {
                setCreateError(null)
                setCreateOpen(true)
              }}
            >
              <Plus />
              Tạo user
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
          aria-label="Đang tải danh sách người dùng"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
            <div className="text-sm font-medium text-muted-foreground">
              Đang tải danh sách người dùng...
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Không có người dùng phù hợp.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Khóa đã mua</TableHead>
                  <TableHead>Tổng đã thanh toán</TableHead>
                  <TableHead>Tạo lúc</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Quyền học</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isBusy = actionLoadingId === item.id
                  const purchasedTitles = getPurchasedCourseTitles(item)
                  const totalPaid = getTotalPaid(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-[300px] truncate font-medium">{item.email}</TableCell>
                      <TableCell>{item.role ?? "USER"}</TableCell>
                      <TableCell className="max-w-[360px]">
                        {purchasedTitles.length > 0 ? (
                          <span className="line-clamp-2">{purchasedTitles.join(", ")}</span>
                        ) : (
                          <span className="text-muted-foreground">Chưa mua khóa nào</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(totalPaid)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isActive}
                          disabled={isBusy}
                          aria-label={
                            item.isActive
                              ? `Tắt trạng thái hoạt động cho ${item.email}`
                              : `Bật trạng thái hoạt động cho ${item.email}`
                          }
                          onCheckedChange={(nextActive) => void handleToggleActive(item, nextActive)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isBusy}
                          aria-label={`Gán quyền học khóa cho ${item.email}`}
                          onClick={() => {
                            setGrantsDialogEmail(item.email)
                            setGrantsDialogOpen(true)
                          }}
                        >
                          <BookKey className="size-4" />
                          Gán khóa
                        </Button>
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
            Tổng: {total} người dùng - Trang {page}/{totalPages}
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

      <CreateUserDialog
        open={createOpen}
        isSubmitting={createSubmitting}
        error={createError}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateUser}
      />

      <UserCourseGrantsDialog
        open={grantsDialogOpen}
        email={grantsDialogEmail}
        onOpenChange={(nextOpen) => {
          setGrantsDialogOpen(nextOpen)
          if (!nextOpen) setGrantsDialogEmail("")
        }}
      />
    </div>
  )
}
