"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useFormState } from "../hooks/use-form-state";
import { useCountdown } from "../hooks/use-countdown";

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

export function OtpForm() {
  const t = useTranslations("auth.otp");
  const tErrors = useTranslations("auth.errors");
  const router = useRouter();
  const formState = useFormState();

  const countdown = useCountdown({
    initialSeconds: COUNTDOWN_SECONDS,
  });

  // Start countdown on mount
  useEffect(() => {
    countdown.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const otpSchema = z.object({
    otp: z
      .string()
      .length(OTP_LENGTH, t("invalidLength", { length: OTP_LENGTH })),
  });

  type OtpFormData = z.infer<typeof otpSchema>;

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: OtpFormData) {
    formState.startSubmit();

    try {
      // TODO: Implement OTP verification logic
      console.log("OTP submitted:", data.otp);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // On success
      formState.setSuccess(t("success"));
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch {
      formState.setError(tErrors("unknownError"));
    } finally {
      formState.setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!countdown.isComplete) return;

    try {
      // TODO: Implement resend OTP logic
      console.log("Resending OTP...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reset countdown
      countdown.reset();
      form.reset();
    } catch {
      formState.setError(tErrors("unknownError"));
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
            name="otp"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={OTP_LENGTH}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={formState.isLoading || !!formState.success}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <div className="text-center text-sm text-muted-foreground">
            {countdown.isComplete ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="underline hover:text-foreground"
              >
                {t("resendCode")}
              </button>
            ) : (
              <span>
                {t("resendIn", { time: formatTime(countdown.seconds) })}
              </span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              formState.isLoading ||
              !!formState.success ||
              form.watch("otp").length !== OTP_LENGTH
            }
          >
            {formState.isLoading ? t("submitting") : t("submit")}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            {t("backToLogin")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
