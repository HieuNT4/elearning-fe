'use server';

import { resetPasswordSchema } from '../validations';
import type { ActionState } from '../types';

export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = formData.get('token') as string;

  if (!token) {
    return { error: 'Token không hợp lệ hoặc đã hết hạn.' };
  }

  const validated = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // TODO: Verify token
    // TODO: Update password in database
    // TODO: Invalidate token

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    console.log('Password reset with token:', token);
    console.log('New password hash:', hashedPassword);

    return {
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    };
  }
}
