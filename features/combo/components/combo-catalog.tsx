"use client"

import { FreeMode } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"

import type { ComboCatalogMessagesVi } from "../messages/combo-catalog"
import type { ComboPublicItem } from "../types/public"

import { ComboCard } from "./combo-card"

type ComboCatalogProps = {
  combos: ComboPublicItem[]
  messages: ComboCatalogMessagesVi
}

export function ComboCatalog({ combos, messages }: ComboCatalogProps) {
  return (
    <section
      id="combo"
      className="ComboCatalog scroll-mt-[72px] wrap-content w-full"
      aria-labelledby="combo-catalog-heading"
    >
      <div className="flex flex-col gap-2 pb-4 sm:pb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-1.5 shrink-0 bg-primary sm:h-10 sm:w-2" />
          <h2
            id="combo-catalog-heading"
            className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl"
          >
            {messages.sectionHeading}
          </h2>
        </div>
      </div>

      {combos.length === 0 ? (
        <p className="text-sm leading-normal text-muted-foreground">{messages.empty}</p>
      ) : (
        <>
          <div className="sm:hidden w-full">
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode
              watchOverflow
              className="combo-catalog-swiper w-full"
            >
              {combos.map((combo) => (
                <SwiperSlide key={combo.id} className="!w-[250px] max-w-[250px]">
                  <ComboCard combo={combo} messages={messages} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <ul className="hidden sm:grid sm:grid-cols-[repeat(auto-fill,250px)] sm:justify-start sm:gap-4 md:gap-5 lg:gap-6">
            {combos.map((combo) => (
              <li key={combo.id} className="flex min-h-0 min-w-0 justify-start">
                <ComboCard combo={combo} messages={messages} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
