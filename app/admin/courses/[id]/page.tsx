import { CourseContentEditor } from "@/features/course"

type AdminCourseDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function AdminCourseDetailPage({
  params,
}: AdminCourseDetailPageProps) {
  const { id } = await params

  return <CourseContentEditor courseId={id} />
}
