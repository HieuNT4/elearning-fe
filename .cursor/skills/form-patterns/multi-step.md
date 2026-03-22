# Multi-step Form Pattern

## Schema

```typescript
// validations/onboarding.schema.ts
import { z } from 'zod';

// Step 1: Account
export const accountSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Tối thiểu 8 ký tự'),
});

// Step 2: Profile
export const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'SĐT không hợp lệ').optional(),
});

// Step 3: Preferences
export const preferencesSchema = z.object({
  newsletter: z.boolean().default(false),
  notifications: z.enum(['all', 'important', 'none']).default('important'),
});

// Combined schema for final submission
export const onboardingSchema = accountSchema
  .merge(profileSchema)
  .merge(preferencesSchema);

export type AccountData = z.infer<typeof accountSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type PreferencesData = z.infer<typeof preferencesSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;
```

## Multi-step Form Component

```typescript
// components/onboarding-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  accountSchema,
  profileSchema,
  preferencesSchema,
  type OnboardingData,
} from '../validations/onboarding.schema';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

const STEPS = [
  { id: 'account', title: 'Account', schema: accountSchema },
  { id: 'profile', title: 'Profile', schema: profileSchema },
  { id: 'preferences', title: 'Preferences', schema: preferencesSchema },
] as const;

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});

  const currentSchema = STEPS[currentStep].schema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData,
    mode: 'onChange',
  });

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const stepData = form.getValues();
    setFormData((prev) => ({ ...prev, ...stepData }));

    if (isLastStep) {
      await handleSubmit({ ...formData, ...stepData } as OnboardingData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (data: OnboardingData) => {
    try {
      // Submit all data
      console.log('Final data:', data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${
              index <= currentStep ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index <= currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted'
              }`}
            >
              {index + 1}
            </div>
            <span className="ml-2 text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form className="space-y-6">
          {currentStep === 0 && <AccountStep form={form} />}
          {currentStep === 1 && <ProfileStep form={form} />}
          {currentStep === 2 && <PreferencesStep form={form} />}
        </form>
      </Form>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button type="button" onClick={nextStep}>
          {isLastStep ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
```

## Step Components

```typescript
// Step 1: Account
function AccountStep({ form }: { form: UseFormReturn }) {
  return (
    <>
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
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Step 2: Profile
function ProfileStep({ form }: { form: UseFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone (Optional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Step 3: Preferences
function PreferencesStep({ form }: { form: UseFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="newsletter"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Subscribe to newsletter</FormLabel>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notifications</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="important">Important only</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
```

## With URL State (Shareable)

```typescript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentStep = Number(searchParams.get('step') ?? 0);

  const goToStep = (step: number) => {
    router.push(`?step=${step}`);
  };

  // ... rest of form
}
```
