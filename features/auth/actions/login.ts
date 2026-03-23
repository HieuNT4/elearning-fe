"use server";

import { loginSchema } from "../validations";
import type { ActionState } from "../types";

export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // For NextAuth v4, we handle login on the client side
  // This action just validates the form
  // The actual signIn is called from the client component

  return {
    success: true,
    data: validated.data,
  };
}
