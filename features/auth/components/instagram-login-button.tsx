"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { InstagramIcon } from "./icons/instagram-icon";

interface InstagramLoginButtonProps {
  mode?: "login" | "register";
  callbackUrl?: string;
  disabled?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function InstagramLoginButton({
  disabled = false,
  className,
  iconOnly = true,
  callbackUrl,
}: InstagramLoginButtonProps) {
  const t = useTranslations("auth.social");
  const router = useRouter();

  const handleInstagramClick = () => {
    const targetPath = callbackUrl
      ? `/doc/login-instagram?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/doc/login-instagram";
    router.push(targetPath);
  };

  if (iconOnly) {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        className={cn("rounded-full", className)}
        onClick={handleInstagramClick}
        disabled={disabled}
        aria-label={t("continueWithInstagram")}
      >
        <InstagramIcon className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Button
      type='button'
      variant='outline'
      className={className}
      onClick={handleInstagramClick}
      disabled={disabled}
    >
      <InstagramIcon className='mr-2 h-4 w-4' />
      {t("continueWithInstagram")}
    </Button>
  );
}
