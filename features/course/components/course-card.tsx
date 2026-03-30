"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { CheckoutPaymentModal } from "@/features/payment"

import type { CatalogMessages } from "../messages/catalog"
import type { CourseCatalogItem } from "../types/catalog"

type CourseCardProps = {
  course: CourseCatalogItem
  messages: CatalogMessages
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function CourseCard({ course, messages }: CourseCardProps) {
  const title = course.title?.trim() || messages.courseFallbackTitle
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <article className="CourseCard group relative flex h-full w-[250px] min-w-[250px] max-w-[250px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-transparent transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="250px"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/25 via-muted to-muted"
            aria-hidden
          />
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
          {title}
        </h3>

        <p className="line-clamp-2 text-[11px] leading-normal text-muted-foreground sm:line-clamp-3 sm:text-xs">
          {course.summary?.trim() ?? "Update liên tục mới nhất hàng tuần"}
        </p>

        <div className="mt-auto flex flex-col gap-2 border-t border-border/80 pt-2 sm:gap-3 sm:pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            {course.price <= 0 ? (
              <span className="text-xs font-semibold leading-normal text-foreground sm:text-sm">
                {messages.priceFree}
              </span>
            ) : (
              <span className="text-base font-semibold leading-normal text-[color:var(--primary)] sm:text-lg">
                {formatVnd(course.price)}
              </span>
            )}
          </div>
          <div className={`grid gap-1.5 sm:gap-2 ${course.slug ? "grid-cols-2" : "grid-cols-1"}`}>
            {course.slug ? (
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
              >
                <Link href={`/khoa-hoc/${course.slug}`} aria-label={`Học ngay: ${title}`}>
                  Học ngay
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 w-full px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
              onClick={() => setCheckoutOpen(true)}
              aria-label={`Mua ngay: ${title}`}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      <CheckoutPaymentModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        courseId={course.id}
        productTitle={title}
        priceHint={course.price}
        courseSlug={course.slug}
      />
    </article>
  )
}
