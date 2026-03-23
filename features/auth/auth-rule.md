# Auth Feature

## Overview

Handles user authentication including login, registration, password reset, and session management.

## Structure

```
auth/
├── actions/          # Server Actions (form submissions on server)
│   ├── login.ts          # Login validation (signIn handled client-side)
│   ├── logout.ts         # Logout redirect
│   ├── register.ts       # Registration handler
│   ├── forgot-password.ts
│   ├── reset-password.ts
│   └── index.ts          # Internal exports
│
├── components/       # UI Components ("use client")
│   ├── login-form.tsx        # Login form with react-hook-form
│   ├── register-form.tsx     # Registration form
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   ├── user-button.tsx       # User avatar + logout button
│   └── index.ts              # Barrel exports
│
├── validations/      # Zod Schemas + Inferred Form Types
│   ├── login.schema.ts       # loginSchema + LoginFormData
│   ├── register.schema.ts    # registerSchema + RegisterFormData
│   ├── forgot-password.schema.ts
│   ├── reset-password.schema.ts
│   └── index.ts              # Barrel exports
│
├── types/            # Shared TypeScript Types
│   └── index.ts          # User, ActionState, AuthError, AuthSuccess
│
├── hooks/            # Custom Hooks (future)
│   └── use-auth.ts       # Auth state management with Zustand
│
├── FEATURE.md        # This file
└── index.ts          # Public API exports
```

## Type Organization

| Type Category | Location | Examples |
|---------------|----------|----------|
| Domain/Entity types | `types/` | `User`, `AuthError`, `ActionState` |
| Form data types | `validations/*.schema.ts` | `LoginFormData` (inferred from Zod) |
| Component props | Inline in component | `interface LoginFormProps {}` |

## Dependencies

- `next-auth` v4 - Authentication provider (credentials)
- `react-hook-form` + `@hookform/resolvers` - Form handling
- `zod` - Schema validation
- `next-intl` - i18n translations
- `bcryptjs` - Password hashing

## Usage

```tsx
// Import components
import { LoginForm, RegisterForm, UserButton } from "@/features/auth";

// Import types
import type { User, ActionState } from "@/features/auth";

// Import validations
import { loginSchema, type LoginFormData } from "@/features/auth";
```

## i18n Keys

All translations are under `auth.*` namespace:

- `auth.login.*` - Login page
- `auth.register.*` - Registration page
- `auth.forgotPassword.*` - Forgot password
- `auth.resetPassword.*` - Reset password
- `auth.errors.*` - Error messages
- `auth.logout.*` - Logout confirmation

## Related Files

| File | Purpose |
|------|---------|
| `/src/core/lib/auth.ts` | NextAuth configuration & providers |
| `/src/proxy.ts` | Route protection (Next.js 16 Proxy) |
| `/src/app/api/auth/[...nextauth]/route.ts` | NextAuth API handler |
| `/src/messages/en.json` | English translations |
| `/src/messages/ja.json` | Japanese translations |
| `/src/types/next-auth.d.ts` | NextAuth type extensions |

## Auth Flow

```
1. User visits /login
   ↓
2. LoginForm validates with Zod (client)
   ↓
3. signIn("credentials", {...}) called (next-auth/react)
   ↓
4. NextAuth authorize() in /core/lib/auth.ts (server)
   ↓
5. JWT token created → Session established
   ↓
6. Redirect to /dashboard
```

## Protected Routes

Configured in `/src/proxy.ts` (Next.js 16 file convention):

- **Protected** (require auth): `/dashboard`, `/settings`
- **Auth routes** (redirect if logged in): `/login`, `/register`, `/forgot-password`, `/reset-password`

> **Note**: Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`.
> Proxy performs optimistic checks using session cookies, not database queries.
