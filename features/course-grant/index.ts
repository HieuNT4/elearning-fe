export { UserCourseGrantsDialog } from "./components"
export { courseGrantAdminService } from "./services/course-grant-admin.service"

export type {
  CourseGrantItem,
  CourseGrantsAdminResponse,
  CourseGrantsEmailCourseIdsPayload,
} from "./types"

export {
  courseGrantsAddSchema,
  courseGrantsSetSchema,
  courseGrantValidationMessages,
  type CourseGrantsAddFormData,
  type CourseGrantsSetFormData,
} from "./validations"

export {
  userCourseGrantsDialogMessages,
  userCourseGrantsDialogMessagesVi,
  type UserCourseGrantsDialogLocale,
} from "./messages/user-course-grants-dialog"
