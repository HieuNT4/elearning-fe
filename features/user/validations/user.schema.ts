import { z } from "zod"

export const createUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
