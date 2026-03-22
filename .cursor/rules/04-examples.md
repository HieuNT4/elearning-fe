# 🎓 Ví dụ thực tế

## Tạo Feature mới

```bash
mkdir -p src/features/{feature-name}/{components,actions,types,validations,hooks}
touch src/features/{feature-name}/index.ts
```

## Ví dụ: Feature "Products"

### 1. Types

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
```

### 2. Validation

```typescript
// src/features/products/validations/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive().min(0.01),
  stock: z.number().int().min(0),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

### 3. Action

```typescript
// src/features/products/actions/create-product.ts
'use server';

import { revalidatePath } from 'next/cache';
import { productSchema } from '../validations/product.schema';
import { apiClient } from '@/core/lib/api-client';

export async function createProductAction(prevState: unknown, formData: FormData) {
  const validated = productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await apiClient.post('/products', validated.data);
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed' };
  }
}
```

### 4. Public API

```typescript
// src/features/products/index.ts
export { ProductsTable } from './components/products-table';
export { ProductForm } from './components/product-form';
export { createProductAction, getProductsAction } from './actions';
export type { Product, CreateProductInput } from './types';
export { productSchema, type ProductFormData } from './validations/product.schema';
```

### 5. Page

```typescript
// src/app/(dashboard)/products/page.tsx
import { getProductsAction, ProductsTable } from '@/features/products';
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

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | `kebab-case.tsx` → PascalCase | `user-form.tsx` → `UserForm` |
| Hook | `use-*.ts` → use + camelCase | `use-auth.ts` → `useAuth` |
| Action | `*.ts` → camelCase + Action | `create-user.ts` → `createUserAction` |
| Schema | `*.schema.ts` | `user.schema.ts` |
| Store | `*-store.ts` | `auth-store.ts` |
| Type | PascalCase | `User`, `ApiResponse` |
| Constant | UPPER_SNAKE | `API_BASE_URL` |

### Commit Format

```bash
feat(auth): add social login with google
fix(users): resolve avatar upload issue
docs(readme): update installation guide
refactor(api): simplify error handling
```
