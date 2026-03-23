'use server';

import { forgotPasswordSchema } from '../validations';
import type { ActionState } from '../types';

export async function forgotPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // TODO: Check if email exists in database
    // TODO: Generate reset token
    // TODO: Send reset email

    console.log('Password reset requested for:', validated.data.email);

    // Always return success to prevent email enumeration
    return {
      success: true,
      message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.',
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    };
  }
}
