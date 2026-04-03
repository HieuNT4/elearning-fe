export type CourseGrantItem = {
  grantId: string
  courseId: string
  title: string
  slug: string
  isPublished: boolean
  createdAt: string
}

export type CourseGrantsAdminResponse = {
  email: string
  courses: CourseGrantItem[]
}

export type CourseGrantsEmailCourseIdsPayload = {
  email: string
  courseIds: string[]
}
