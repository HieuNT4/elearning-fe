"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { authService } from "../services";
import { useFormState } from "../hooks";
import { GoogleLoginButton } from "./google-login-button";
import { FacebookLoginButton } from "./facebook-login-button";
import { InstagramLoginButton } from "./instagram-login-button";
import { LineLoginButton } from "./line-login-button";
import { SocialLoginDivider } from "./social-login-divider";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tErrors = useTranslations("auth.errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const formState = useFormState();

  const registerSchema = z
    .object({
      name: z
        .string()
        .min(2, tValidation("minLength", { field: t("name"), min: 2 })),
      email: z.string().email(tValidation("email")),
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

  type RegisterFormData = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    formState.startSubmit();

    const result = await authService.register({
      email: data.email,
      password: data.password,
      name: data.name,
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
            name="name"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("namePlaceholder")}
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <SocialLoginDivider />

          <div className="flex justify-center gap-4">
            <GoogleLoginButton mode="register" disabled={formState.isLoading} />
            <FacebookLoginButton mode="register" disabled={formState.isLoading} />
            <InstagramLoginButton mode="register" disabled={formState.isLoading} />
            <LineLoginButton mode="register" disabled={formState.isLoading} />
          </div>
        </div>

        <div className="mt-4 text-center text-sm">
          {t("hasAccount")}{" "}
          <Link href="/login" className="underline">
            {t("login")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
