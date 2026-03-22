# Dynamic Fields Pattern

## Schema

```typescript
// validations/order.schema.ts
import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Chọn sản phẩm'),
  quantity: z.coerce.number().min(1, 'Tối thiểu 1'),
  price: z.coerce.number().positive('Giá phải dương'),
});

export const orderSchema = z.object({
  customerName: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  items: z.array(orderItemSchema).min(1, 'Thêm ít nhất 1 sản phẩm'),
  notes: z.string().optional(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
```

## Dynamic Form với useFieldArray

```typescript
// components/order-form.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '../validations/order.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export function OrderForm() {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: '',
      items: [{ productId: '', quantity: 1, price: 0 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = async (data: OrderFormData) => {
    console.log(data);
  };

  // Calculate total
  const watchedItems = form.watch('items');
  const total = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
    0
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Name */}
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Order Items</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: '', quantity: 1, price: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items Error (array level) */}
          {form.formState.errors.items?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.items.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Product */}
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <FormControl>
                            <Input placeholder="Product ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-2 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total */}
        <div className="text-right text-lg font-semibold">
          Total: ${total.toFixed(2)}
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Order'}
        </Button>
      </form>
    </Form>
  );
}
```

## useFieldArray Methods

```typescript
const { fields, append, prepend, remove, swap, move, insert, update, replace } = useFieldArray({
  control: form.control,
  name: 'items',
});

// Add to end
append({ productId: '', quantity: 1, price: 0 });

// Add to beginning
prepend({ productId: '', quantity: 1, price: 0 });

// Remove by index
remove(index);

// Swap positions
swap(fromIndex, toIndex);

// Move to position
move(fromIndex, toIndex);

// Insert at position
insert(index, { productId: '', quantity: 1, price: 0 });

// Update by index
update(index, { productId: 'updated', quantity: 2, price: 100 });

// Replace all
replace([{ productId: 'new', quantity: 1, price: 50 }]);
```

## Nested Arrays

```typescript
// Schema with nested arrays
const formSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    questions: z.array(z.object({
      text: z.string(),
      options: z.array(z.string()),
    })),
  })),
});

// Component
function SurveyForm() {
  const { fields: sections } = useFieldArray({ control, name: 'sections' });

  return sections.map((section, sectionIndex) => {
    const { fields: questions } = useFieldArray({
      control,
      name: `sections.${sectionIndex}.questions`,
    });

    return questions.map((question, questionIndex) => {
      const { fields: options } = useFieldArray({
        control,
        name: `sections.${sectionIndex}.questions.${questionIndex}.options`,
      });
      // render options
    });
  });
}
```
