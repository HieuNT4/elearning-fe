# 📁 Cấu trúc thư mục

[← Về mục lục](./README.md) | [← Architecture](./01-architecture.md)

---

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
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── data-table-toolbar.tsx
│   │   │   │   ├── data-table-pagination.tsx
│   │   │   │   ├── data-table-column-header.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── form-field-wrapper.tsx
│   │   │   │   ├── submit-button.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   ├── page-header.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── feedback/
│   │   │       ├── loading-spinner.tsx
│   │   │       ├── error-message.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-copy-to-clipboard.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── use-sidebar-store.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── validations/
│   │   │   ├── common.schema.ts          # Email, phone, pagination...
│   │   │   └── index.ts
│   │   │
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── format.ts
│   │       └── index.ts
│   │
│   ├── features/                         # 🧩 BUSINESS FEATURES
│   │   ├── auth/
│   │   │   ├── index.ts                  # Public API
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   ├── user-button.tsx
│   │   │   │   └── index.ts
│   │   │   ├── actions/
│   │   │   │   ├── login.ts
│   │   │   │   ├── register.ts
│   │   │   │   ├── logout.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-current-user.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── validations/
│   │   │       ├── login.schema.ts
│   │   │       ├── register.schema.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── users-table.tsx
│   │   │   │   ├── users-table-columns.tsx
│   │   │   │   ├── user-form.tsx
│   │   │   │   ├── user-card.tsx
│   │   │   │   └── index.ts
│   │   │   ├── actions/
│   │   │   │   ├── get-users.ts
│   │   │   │   ├── get-user.ts
│   │   │   │   ├── create-user.ts
│   │   │   │   ├── update-user.ts
│   │   │   │   ├── delete-user.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-users.ts          # TanStack Query hook
│   │   │   │   ├── use-user.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── validations/
│   │   │       ├── user.schema.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   ├── recent-activity.tsx
│   │   │   │   ├── overview-chart.tsx
│   │   │   │   └── index.ts
│   │   │   ├── actions/
│   │   │   │   ├── get-stats.ts
│   │   │   │   └── index.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   └── settings/
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── profile-form.tsx
│   │       │   ├── appearance-form.tsx
│   │       │   └── index.ts
│   │       ├── actions/
│   │       │   └── update-profile.ts
│   │       └── validations/
│   │           └── profile.schema.ts
│   │
│   └── middleware.ts                     # Auth middleware
│
├── public/                               # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── __tests__/                            # 🧪 TESTS
│   ├── setup.ts
│   └── utils.tsx                         # Test utilities
│
├── .cursorrules                          # ⚡ AI rules
├── .env.example
├── .env.local
├── .gitignore
├── .lintstagedrc.js                      # Lint-staged config
├── commitlint.config.ts                  # Commitlint config
├── components.json                       # ShadcnUI config
├── eslint.config.mjs                     # ESLint config
├── knip.config.ts                        # Knip config
├── lefthook.yml                          # Lefthook config
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Tiếp theo

→ [03-code-organization.md](./03-code-organization.md) - Nguyên tắc tổ chức code
