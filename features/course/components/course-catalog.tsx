"use client"

import { FreeMode } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"

import { CourseCard } from "@/features/course/components/course-card"
import type { CatalogMessages } from "../messages/catalog"
import type { CourseCatalogItem } from "../types/catalog"

type CourseCatalogProps = {
  courses: CourseCatalogItem[]
  messages: CatalogMessages
  /** Anchor id for in-page links (e.g. #khoa-hoc). Only set on one block per page. */
  sectionId?: string
}

export function CourseCatalog({ courses, messages, sectionId }: CourseCatalogProps) {
  return (
    <section
      id={sectionId}
      className="CourseCatalog scroll-mt-[72px] wrap-content w-full"
      aria-labelledby="course-catalog-heading"
    >
      <div className="flex flex-col gap-2 pb-4 sm:pb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-1.5 shrink-0 bg-primary sm:h-10 sm:w-2" />
          <h2
            id="course-catalog-heading"
            className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl"
          >
            {messages.gridHeading}
          </h2>
        </div>
      </div>

      {/* Mobile: horizontal swiper — same horizontal inset as heading (parent px-4) */}
      <div className="sm:hidden w-full">
        <Swiper
          modules={[FreeMode]}
          spaceBetween={12}
          slidesPerView="auto"
          freeMode
          watchOverflow
          className="course-catalog-swiper w-full"
        >
          {courses.map((course) => (
            <SwiperSlide key={course.id} className="!w-[250px] max-w-[250px]">
              <CourseCard course={course} messages={messages} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* sm+: fixed-width cards — align start with section title */}
      <ul className="hidden sm:grid sm:grid-cols-[repeat(auto-fill,250px)] sm:justify-start sm:gap-4 md:gap-5 lg:gap-6">
        {courses.map((course) => (
          <li key={course.id} className="flex min-h-0 min-w-0 justify-start">
            <CourseCard course={course} messages={messages} />
          </li>
        ))}
      </ul>
    </section>
  )
}
