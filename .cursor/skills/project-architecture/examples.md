# Ví dụ thực tế

## Tạo Feature "Products"

### Step 1: Create folders

```bash
mkdir -p src/features/products/{components,actions,hooks,types,validations}
touch src/features/products/index.ts
```

### Step 2: Types

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

export type UpdateProductInput = Partial<CreateProductInput> & { id: string };
```

### Step 3: Validation

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

### Step 4: Actions

```typescript
// src/features/products/actions/get-products.ts
'use server';

import { apiClient } from '@/core/lib/api-client';
import type { Product } from '../types';

export async function getProductsAction(): Promise<Product[]> {
  return apiClient.get<Product[]>('/products');
}
```

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

### Step 5: Public API

```typescript
// src/features/products/index.ts

// Components
export { ProductsTable } from './components/products-table';
export { ProductForm } from './components/product-form';
export { ProductCard } from './components/product-card';

// Actions
export { getProductsAction } from './actions/get-products';
export { createProductAction } from './actions/create-product';
export { updateProductAction } from './actions/update-product';
export { deleteProductAction } from './actions/delete-product';

// Types
export type { Product, CreateProductInput, UpdateProductInput } from './types';

// Schema
export { productSchema, type ProductFormData } from './validations/product.schema';
```

### Step 6: Page

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

### Dependency Direction

```
APP → FEATURES → SHARED → CORE → UI
```

### Import Rules

| From | Can Import |
|------|------------|
| APP | FEATURES, SHARED, CORE, UI |
| FEATURES | SHARED, CORE, UI |
| SHARED | CORE, UI |
| CORE | UI |
| UI | (nothing) |

### File Naming

| Type | Pattern |
|------|---------|
| Component | `user-form.tsx` |
| Hook | `use-auth.ts` |
| Action | `create-user.ts` |
| Schema | `user.schema.ts` |
| Store | `auth-store.ts` |

### Code Naming

| Type | Pattern |
|------|---------|
| Component | `UserForm` (PascalCase) |
| Function | `createUser` (camelCase) |
| Action | `createUserAction` (camelCase + Action) |
| Hook | `useAuth` (use + camelCase) |
| Type | `User` (PascalCase) |
| Constant | `API_BASE_URL` (UPPER_SNAKE) |
