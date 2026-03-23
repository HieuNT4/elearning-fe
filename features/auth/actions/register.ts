'use server';

import { registerSchema } from '../validations';
import type { ActionState } from '../types';

export async function registerAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // TODO: Replace with actual database logic
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    // Simulate creating user
    console.log('Creating user:', {
      name: validated.data.name,
      email: validated.data.email,
      password: hashedPassword,
    });

    // TODO: Send verification email

    return {
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
    };
  }
}
