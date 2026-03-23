"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FacebookIcon } from "./icons/facebook-icon";

interface FacebookLoginButtonProps {
  mode?: "login" | "register";
  callbackUrl?: string;
  disabled?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function FacebookLoginButton({
  disabled = false,
  className,
  iconOnly = true,
  callbackUrl,
}: FacebookLoginButtonProps) {
  const t = useTranslations("auth.social");
  const router = useRouter();

  const handleFacebookClick = () => {
    const targetPath = callbackUrl
      ? `/doc/login-facebook?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/doc/login-facebook";
    router.push(targetPath);
  };

  if (iconOnly) {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        className={cn("rounded-full", className)}
        onClick={handleFacebookClick}
        disabled={disabled}
        aria-label={t("continueWithFacebook")}
      >
        <FacebookIcon className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Button
      type='button'
      variant='outline'
      className={className}
      onClick={handleFacebookClick}
      disabled={disabled}
    >
      <FacebookIcon className='mr-2 h-4 w-4' />
      {t("continueWithFacebook")}
    </Button>
  );
}
