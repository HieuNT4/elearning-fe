import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComboDetailView } from "@/features/combo/components/combo-detail-view"
import { getComboBySlug } from "@/features/combo/services/combo-public.service"

type ComboDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ComboDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const combo = await getComboBySlug(slug)
  return {
    title: combo?.title ?? "Combo",
    description: combo?.description?.trim() ?? "Chi tiết gói combo khóa học.",
  }
}

export default async function ComboDetailPage({ params }: ComboDetailPageProps) {
  const { slug } = await params
  const combo = await getComboBySlug(slug)

  if (!combo) {
    notFound()
  }

  return <ComboDetailView combo={combo} />
}
