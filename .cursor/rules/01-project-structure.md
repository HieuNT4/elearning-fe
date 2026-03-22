# 📁 Cấu trúc thư mục chi tiết

## Cấu trúc đề xuất (Recommended)

Tách riêng business logic ra ngoài `app/`, giữ `app/` chỉ cho routing:

```
project-root/
├── src/
│   ├── app/                              # 🚀 NEXT.JS APP ROUTER (routing only)
│   │   ├── (marketing)/                  # Route group: Public pages
│   │   │   ├── page.tsx                  # Homepage (/)
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx                # Marketing layout
│   │   │
│   │   ├── (auth)/                       # Route group: Auth pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx                # Auth layout (centered)
│   │   │
│   │   ├── (dashboard)/                  # Route group: Protected area
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx                # Dashboard layout (sidebar)
│   │   │
│   │   ├── api/                          # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                    # Root layout
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── globals.css                   # Tailwind imports
│   │
│   ├── components/
│   │   └── ui/                           # 🎨 SHADCN/UI PRIMITIVES
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── table.tsx
│   │       ├── toast.tsx
│   │       ├── skeleton.tsx
│   │       └── ... (shadcn components)
│   │
│   ├── core/                             # ⚙️ CORE SYSTEM
│   │   ├── components/
│   │   │   ├── providers.tsx             # All providers wrapper
│   │   │   ├── theme-provider.tsx        # next-themes
│   │   │   └── query-provider.tsx        # TanStack Query
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts                  # cn() helper
│   │   │   ├── api-client.ts             # Fetch wrapper
│   │   │   ├── auth.ts                   # NextAuth config
│   │   │   └── query-client.ts           # TanStack Query config
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-mounted.ts
│   │   │   └── use-media-query.ts
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts                    # ApiResponse, ApiError...
│   │   │   ├── common.ts                 # Pagination, ID...
│   │   │   └── index.ts
│   │   │
│   │   └── config/
│   │       ├── site.ts                   # Site metadata
│   │       ├── env.ts                    # Environment validation
│   │       └── navigation.ts             # Nav items config
│   │
│   ├── shared/                           # 🔄 SHARED (cross-feature)
│   │   ├── components/
│   │   │   ├── data-table/
│   │   │   ├── forms/
│   │   │   ├── layout/
│   │   │   └── feedback/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── validations/
│   │   └── utils/
│   │
│   ├── features/                         # 🧩 BUSINESS FEATURES
│   │   ├── auth/
│   │   │   ├── index.ts                  # Public API
│   │   │   ├── components/
│   │   │   ├── actions/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── validations/
│   │   │
│   │   ├── users/
│   │   ├── dashboard/
│   │   └── settings/
│   │
│   └── middleware.ts                     # Auth middleware
│
├── public/                               # Static assets
├── __tests__/                            # 🧪 TESTS
│
├── .cursorrules                          # ⚡ AI rules
├── .lintstagedrc.js
├── commitlint.config.ts
├── components.json
├── eslint.config.mjs
├── knip.config.ts
├── lefthook.yml
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```
