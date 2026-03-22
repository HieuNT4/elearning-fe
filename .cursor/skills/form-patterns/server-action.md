# Server Action Form Pattern

## Pattern 1: useActionState (Recommended for Next.js 15+)

### Server Action

```typescript
// features/users/actions/create-user.ts
'use server';

import { revalidatePath } from 'next/cache';
import { userSchema } from '../validations/user.schema';

export type ActionState = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
};

export async function createUserAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Validate
  const validated = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // 2. Execute
  try {
    await db.user.create({ data: validated.data });

    // 3. Revalidate
    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}
```

### Form Component với useActionState

```typescript
// features/users/components/create-user-form.tsx
'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserAction, type ActionState } from '../actions/create-user';
import { userSchema, type UserFormData } from '../validations/user.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createUserAction,
    {}
  );

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'user' },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        form.setError(field as keyof UserFormData, {
          type: 'server',
          message: messages?.[0],
        });
      });
    }
  }, [state.errors, form]);

  // Reset form on success
  useEffect(() => {
    if (state.success) {
      form.reset();
    }
  }, [state.success, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        {/* Global Error */}
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {state.success && (
          <Alert>
            <AlertDescription>User created successfully!</AlertDescription>
          </Alert>
        )}

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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </Form>
  );
}
```

## Pattern 2: Client-side validation + Server Action

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { createUserAction } from '../actions/create-user';
import { userSchema, type UserFormData } from '../validations/user.schema';
import { toast } from 'sonner';

export function CreateUserForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = (data: UserFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });

    startTransition(async () => {
      const result = await createUserAction({}, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof UserFormData, {
            message: messages?.[0],
          });
        });
        return;
      }

      toast.success('User created!');
      form.reset();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Form>
  );
}
```

## Pattern 3: With Redirect

```typescript
// Server Action with redirect
'use server';

import { redirect } from 'next/navigation';

export async function createUserAction(prevState: ActionState, formData: FormData) {
  // ... validation & create

  // Redirect after success
  redirect(`/users/${user.id}`);
}
```

## Error Handling Best Practices

```typescript
// Centralized error types
export type ActionState<T = undefined> = {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// Wrapper for consistent error handling
export async function safeAction<T>(
  fn: () => Promise<T>
): Promise<ActionState<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.flatten().fieldErrors };
    }
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}
```
