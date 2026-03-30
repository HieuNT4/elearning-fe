"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CheckoutPaymentModal } from "@/features/payment"

import type { ComboCatalogMessagesVi } from "../messages/combo-catalog"
import type { ComboPublicItem } from "../types/public"

type ComboCardProps = {
  combo: ComboPublicItem
  messages: ComboCatalogMessagesVi
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ComboCard({ combo, messages }: ComboCardProps) {
  const title = combo.title?.trim() || "Combo"
  const detailHref = combo.slug ? `/combo/${encodeURIComponent(combo.slug)}` : null
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const descriptionFallback = combo.description?.trim() ?? ""

  return (
    <article className="ComboCard group relative flex h-full w-[250px] min-w-[250px] max-w-[250px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-transparent transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        {combo.thumbnail ? (
          <Image
            src={combo.thumbnail}
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
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">{title}</h3>

        {combo.courses.length > 0 ? (
          <ul
            className="flex max-h-[4.5rem] flex-col gap-1 overflow-hidden text-[11px] leading-snug sm:max-h-[5.25rem] sm:gap-1.5 sm:text-xs"
            aria-label={messages.courseListLabel}
          >
            {combo.courses.map((name, idx) => (
              <li key={`${idx}-${name}`} className="flex min-w-0 items-start gap-1.5 sm:gap-2">
                <BookOpen
                  className="mt-0.5 size-3 shrink-0 text-primary sm:size-3.5"
                  aria-hidden
                />
                <span className="line-clamp-2 min-w-0 font-medium leading-snug text-foreground">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        ) : descriptionFallback ? (
          <p className="line-clamp-2 text-[11px] leading-normal text-muted-foreground sm:line-clamp-3 sm:text-xs">
            {descriptionFallback}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 border-t border-border/80 pt-2 sm:gap-3 sm:pt-3">
          <div className="flex flex-wrap items-baseline gap-2">
            {combo.price <= 0 ? (
              <span className="text-xs font-semibold leading-normal text-foreground sm:text-sm">
                {messages.priceFree}
              </span>
            ) : (
              <span className="text-base font-semibold leading-normal text-[color:var(--primary)] sm:text-lg">
                {formatVnd(combo.price)}
              </span>
            )}
          </div>
          <div className={`grid gap-1.5 sm:gap-2 ${detailHref ? "grid-cols-2" : "grid-cols-1"}`}>
            {detailHref ? (
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
              >
                <Link href={detailHref} aria-label={`${messages.learnMore}: ${title}`}>
                  {messages.learnMore}
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 w-full px-2 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
              onClick={() => setCheckoutOpen(true)}
              aria-label={`${messages.buyNow}: ${title}`}
            >
              {messages.buyNow}
            </Button>
          </div>
        </div>
      </div>

      <CheckoutPaymentModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        comboId={combo.id}
        productTitle={title}
        priceHint={combo.price}
        comboSlug={combo.slug}
      />
    </article>
  )
}
