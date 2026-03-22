# Basic Form Pattern

## Schema

```typescript
// features/users/validations/user.schema.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  bio: z.string().max(500).optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
```

## Form Component

```typescript
// features/users/components/user-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormData } from '../validations/user.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFormProps {
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  submitLabel?: string;
}

export function UserForm({ 
  defaultValues, 
  onSubmit,
  submitLabel = 'Save',
}: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      bio: '',
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Handle error - show toast, etc.
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Text Input */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>Your display name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Input */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Select */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Textarea */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Max 500 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
```

## Usage

```typescript
// In a page or parent component
import { UserForm } from '@/features/users';

export default function CreateUserPage() {
  const handleSubmit = async (data: UserFormData) => {
    await createUserAction(data);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>
      <UserForm onSubmit={handleSubmit} />
    </div>
  );
}
```

## Edit Mode

```typescript
// For editing existing data
<UserForm
  defaultValues={{
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
  }}
  onSubmit={handleUpdate}
  submitLabel="Update"
/>
```
