"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Link, useRouter } from "@/i18n/routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useFormState } from "../hooks";
import { authService } from "../services";

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tErrors = useTranslations("auth.errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  // Firebase uses 'oobCode' for password reset
  const oobCode = searchParams.get("oobCode") || searchParams.get("token");
  const formState = useFormState();

  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, tValidation("minLength", { field: t("password"), min: 8 }))
        .regex(/[A-Z]/, tValidation("passwordStrength"))
        .regex(/[0-9]/, tValidation("passwordStrength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tValidation("passwordMatch"),
      path: ["confirmPassword"],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    formState.startSubmit();

    const result = await authService.resetPassword({
      code: oobCode!,
      password: data.password,
    });

    if (result.success) {
      formState.setSuccess(t("success"));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      formState.setError(result.error || tErrors("unknownError"));
    }

    formState.setLoading(false);
  }

  if (!oobCode) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("invalidToken")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {formState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          {formState.success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{formState.success}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={formState.isLoading || !!formState.success}
          >
            {formState.isLoading ? t("submitting") : t("submit")}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToLogin")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
