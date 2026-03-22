# 💻 Code Patterns

Các patterns chuẩn khi viết code trong dự án.

## 1. Root Layout với Providers

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/core/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next Auth Template',
  description: 'A Next.js template with authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 2. Providers Wrapper

```typescript
// src/core/components/providers.tsx
'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryProvider>
  );
}
```

## 3. Page (Server Component)

```typescript
// app/(dashboard)/users/page.tsx
import { getUsersAction } from '@/features/users';
import { UsersTable } from '@/features/users';

export default async function UsersPage() {
  const users = await getUsersAction();

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Users Management</h1>
      <UsersTable data={users} />
    </div>
  );
}
```

## 4. Layout

```typescript
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/shared/components/layout/sidebar';
import { Header } from '@/shared/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

## 5. Loading & Error

```typescript
// loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

// error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-96 flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

## 6. Server Action

```typescript
// features/users/actions/create-user.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { userSchema } from '../validations/user.schema';
import { apiClient } from '@/core/lib/api-client';

export async function createUserAction(prevState: unknown, formData: FormData) {
  const validated = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    const user = await apiClient.post('/users', validated.data);
    revalidatePath('/users');
    redirect(`/users/${user.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}
```

## 7. Client Component với React Hook Form

```typescript
// features/users/components/user-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormData } from '../validations/user.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  defaultValues?: Partial<UserFormData>;
}

export function UserForm({ onSubmit, defaultValues }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', ...defaultValues },
  });

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
                <Input placeholder="John Doe" {...field} />
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

## 8. TanStack Query Hook

```typescript
// features/users/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersAction, createUserAction, deleteUserAction } from '../actions';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsersAction,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## 9. Middleware (Auth Protection)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/users', '/settings'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/settings/:path*', '/login', '/register'],
};
```
