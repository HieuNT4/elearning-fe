---
name: form-patterns
description: React Hook Form + Zod patterns cho Next.js. Sử dụng khi tạo forms, validation, multi-step forms, hoặc form với Server Actions. Trigger khi user yêu cầu tạo form, input validation, hoặc xử lý form submission.
---

# Form Patterns - React Hook Form + Zod

## Quick Setup

```typescript
// 1. Schema
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
});

export type UserFormData = z.infer<typeof userSchema>;

// 2. Form Component
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export function UserForm() {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: UserFormData) => {
    // handle submit
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

## Patterns

| Pattern | Use Case |
|---------|----------|
| [Basic Form](basic.md) | Form đơn giản |
| [Server Action Form](server-action.md) | Form với Server Actions |
| [Multi-step Form](multi-step.md) | Form nhiều bước |
| [Dynamic Fields](dynamic-fields.md) | Thêm/xóa fields |
| [File Upload](file-upload.md) | Upload files |

## Common Schemas

```typescript
// Email
z.string().email('Email không hợp lệ')

// Password (min 8, uppercase, lowercase, number)
z.string()
  .min(8, 'Tối thiểu 8 ký tự')
  .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Cần ít nhất 1 số')

// Confirm password
z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

// Phone (VN)
z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ')

// Optional with transform
z.string().optional().transform(val => val || undefined)

// Number from string input
z.coerce.number().positive('Phải là số dương')

// Date
z.coerce.date()

// Enum
z.enum(['admin', 'user', 'guest'])

// Array with min items
z.array(z.string()).min(1, 'Chọn ít nhất 1 item')
```

## Form States

```typescript
const { formState } = form;

// Loading
formState.isSubmitting

// Dirty (có thay đổi)
formState.isDirty

// Valid
formState.isValid

// Errors
formState.errors
formState.errors.fieldName?.message

// Touch state
formState.touchedFields
```

## Chi tiết

- [Basic Form Pattern](basic.md)
- [Server Action Integration](server-action.md)
- [Multi-step Forms](multi-step.md)
- [Dynamic Fields](dynamic-fields.md)
- [File Upload](file-upload.md)
