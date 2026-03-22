# 🎓 Ví dụ thực tế + Rules cho AI

[← Về mục lục](./README.md) | [← Package & CI/CD](./07-package-cicd.md)

---

## Ví dụ: Tạo Feature "Products"

### Step 1: Create folder structure

```bash
mkdir -p src/features/products/{components,actions,types,validations,hooks}
touch src/features/products/index.ts
```

### Step 2: Define types

```typescript
// src/features/products/types/index.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export type UpdateProductInput = Partial<CreateProductInput> & {
  id: string;
};
```

### Step 3: Create validation

```typescript
// src/features/products/validations/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive').min(0.01),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

### Step 4: Create actions

```typescript
// src/features/products/actions/create-product.ts
'use server';

import { revalidatePath } from 'next/cache';
import { productSchema } from '../validations/product.schema';
import { apiClient } from '@/core/lib/api-client';
import type { Product } from '../types';

export async function createProductAction(
  prevState: unknown,
  formData: FormData
) {
  const validated = productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await apiClient.post<Product>('/products', validated.data);
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}
```

### Step 5: Create public API

```typescript
// src/features/products/index.ts

// Components
export { ProductsTable } from './components/products-table';
export { ProductForm } from './components/product-form';
export { ProductCard } from './components/product-card';

// Actions
export {
  getProductsAction,
  getProductAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from './actions';

// Types
export type { Product, CreateProductInput, UpdateProductInput } from './types';

// Schemas
export {
  productSchema,
  type ProductFormData,
} from './validations/product.schema';
```

### Step 6: Use in App Router

```typescript
// src/app/(dashboard)/products/page.tsx
import { getProductsAction } from '@/features/products';
import { ProductsTable } from '@/features/products';
import { PageHeader } from '@/shared/components/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await getProductsAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button asChild>
            <Link href="/products/new">Add Product</Link>
          </Button>
        }
      />
      <ProductsTable data={products} />
    </div>
  );
}
```

---

## 📋 Rules cho AI/Cursor

### Quy tắc chung

1. **Tuân thủ cấu trúc 5 tầng**: APP → FEATURES → SHARED → CORE → UI
2. **Không import ngược chiều** trong dependency hierarchy
3. **Features không được import lẫn nhau**
4. **Mỗi feature có Public API** qua `index.ts`
5. **Sử dụng TypeScript strict mode**
6. **Validate input với Zod schemas**
7. **Server Actions cho mutations**
8. **TanStack Query cho data fetching**

### Khi tạo feature mới

```bash
# Template command
mkdir -p src/features/{feature-name}/{components,actions,hooks,types,validations}
touch src/features/{feature-name}/index.ts
```

### Khi tạo component

- Đặt trong đúng layer (ui/shared/features)
- Export qua `index.ts`
- Sử dụng ShadcnUI components
- TypeScript interfaces cho props

### Khi tạo action

- Prefix với `'use server'`
- Validate với Zod
- Handle errors gracefully
- Revalidate paths after mutations
- Suffix với `Action`

### Khi commit

- Sử dụng Conventional Commits format
- Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Scope: feature name hoặc module
- Subject: lowercase, không có period cuối

```bash
feat(auth): add social login with google
fix(users): resolve avatar upload issue
docs(readme): update installation guide
```

---

## Quick Reference

### Import Rules

```typescript
// ✅ OK
import { Button } from '@/components/ui/button';
import { cn } from '@/core/lib/utils';
import { DataTable } from '@/shared/components/data-table';
import { LoginForm } from '@/features/auth';

// ❌ KHÔNG
import { LoginForm } from '@/features/auth'; // trong features/users
import { DataTable } from '@/shared/...'; // trong core
```

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | `kebab-case.tsx` | `user-form.tsx` |
| Hook | `use-*.ts` | `use-auth.ts` |
| Action | `*.ts` | `create-user.ts` |
| Schema | `*.schema.ts` | `user.schema.ts` |
| Store | `*-store.ts` | `auth-store.ts` |

### Code Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase | `UserForm` |
| Function | camelCase | `createUser` |
| Action | camelCase + Action | `createUserAction` |
| Hook | use + camelCase | `useAuth` |
| Type | PascalCase | `User` |
| Constant | UPPER_SNAKE | `API_BASE_URL` |
