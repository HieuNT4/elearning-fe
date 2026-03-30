"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CourseCatalog } from "@/features/course/components/course-catalog"
import { CheckoutPaymentModal } from "@/features/payment"

import {
  comboDetailEmptyCoursesVi,
  getComboDetailCatalogMessages,
} from "../messages/combo-detail-catalog"
import type { ComboDetailPublic } from "../types/public"

type ComboDetailViewProps = {
  combo: ComboDetailPublic
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ComboDetailView({ combo }: ComboDetailViewProps) {
  const title = combo.title?.trim() || "Combo"
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const catalogMessages = getComboDetailCatalogMessages(title, "vi")

  return (
    <div className="ComboDetailView mx-auto w-full max-w-[1180px] px-4 py-10 md:px-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="relative aspect-[16/9] w-full max-w-xl overflow-hidden rounded-xl border border-border bg-muted lg:shrink-0 lg:w-[420px]">
          {combo.thumbnail ? (
            <Image
              src={combo.thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="420px"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-muted to-muted" aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <h1 className="text-2xl font-semibold leading-tight md:text-3xl">{title}</h1>
          {combo.description?.trim() ? (
            <p className="text-sm leading-normal text-muted-foreground">{combo.description.trim()}</p>
          ) : null}
          <p className="text-2xl font-semibold text-[color:var(--primary)]">
            {combo.price <= 0 ? "Miễn phí" : formatVnd(combo.price)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="lg" onClick={() => setCheckoutOpen(true)} aria-label={`Mua combo ${title}`}>
              Mua ngay
            </Button>
            <Button asChild type="button" variant="outline" size="lg">
              <Link href="/" aria-label="Về trang chủ">
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        {combo.courseCatalogItems.length > 0 ? (
          <CourseCatalog courses={combo.courseCatalogItems} messages={catalogMessages} />
        ) : combo.courses.length > 0 ? (
          <section className="ComboDetailView-courses-fallback" aria-labelledby="combo-courses-fallback-heading">
            <div className="flex flex-col gap-2 pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-1.5 shrink-0 bg-primary sm:h-10 sm:w-2" />
                <h2
                  id="combo-courses-fallback-heading"
                  className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl"
                >
                  {catalogMessages.gridHeading}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">{catalogMessages.gridDescription}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {combo.courses.map((courseName, idx) => (
                <li
                  key={`${idx}-${courseName}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium leading-normal"
                >
                  {courseName}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-sm leading-normal text-muted-foreground">{comboDetailEmptyCoursesVi}</p>
        )}
      </div>

      <CheckoutPaymentModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        comboId={combo.id}
        productTitle={title}
        priceHint={combo.price}
        comboSlug={combo.slug}
      />
    </div>
  )
}
