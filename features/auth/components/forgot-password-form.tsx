"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { authService } from "../services";
import { useFormState } from "../hooks";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tErrors = useTranslations("auth.errors");
  const tValidation = useTranslations("validation");
  const formState = useFormState();

  const forgotPasswordSchema = z.object({
    email: z.string().email(tValidation("email")),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    formState.startSubmit();

    const result = await authService.forgotPassword({
      email: data.email,
    });

    if (result.success) {
      formState.setSuccess(t("success"));
    } else {
      formState.setError(result.error || tErrors("unknownError"));
    }

    formState.setLoading(false);
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
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    autoComplete="email"
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
