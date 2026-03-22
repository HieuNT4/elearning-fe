# Code Patterns

## 1. Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/core/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'App Name',
  description: 'Description',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 2. Providers

```typescript
// src/core/components/providers.tsx
'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
import { getUsersAction, UsersTable } from '@/features/users';

export default async function UsersPage() {
  const users = await getUsersAction();

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Users</h1>
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
```

```typescript
// error.tsx
'use client';

import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
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
import { userSchema } from '../validations/user.schema';
import { apiClient } from '@/core/lib/api-client';

export async function createUserAction(prevState: unknown, formData: FormData) {
  const validated = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await apiClient.post('/users', validated.data);
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed' };
  }
}
```

## 7. TanStack Query Hook

```typescript
// features/users/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersAction, createUserAction } from '../actions';

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

## 8. Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/users', '/settings'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authRoutes.some((r) => pathname.startsWith(r)) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/settings/:path*', '/login', '/register'],
};
```

## 9. Zod Schema

```typescript
// features/users/validations/user.schema.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

export type UserFormData = z.infer<typeof userSchema>;
```
