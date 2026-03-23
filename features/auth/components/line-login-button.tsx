"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LineIcon } from "./icons/line-icon";

interface LineLoginButtonProps {
  mode?: "login" | "register";
  callbackUrl?: string;
  disabled?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function LineLoginButton({
  disabled = false,
  className,
  iconOnly = true,
  callbackUrl,
}: LineLoginButtonProps) {
  const t = useTranslations("auth.social");
  const router = useRouter();

  const handleLineClick = () => {
    const targetPath = callbackUrl
      ? `/doc/login-line?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/doc/login-line";
    router.push(targetPath);
  };

  if (iconOnly) {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        className={cn("rounded-full", className)}
        onClick={handleLineClick}
        disabled={disabled}
        aria-label={t("continueWithLine")}
      >
        <LineIcon className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Button
      type='button'
      variant='outline'
      className={className}
      onClick={handleLineClick}
      disabled={disabled}
    >
      <LineIcon className='mr-2 h-4 w-4' />
      {t("continueWithLine")}
    </Button>
  );
}
