"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { GoogleIcon } from "./icons/google-icon"

type GoogleLoginButtonProps = {
  mode?: "login" | "register"
  callbackUrl?: string
  disabled?: boolean
  className?: string
  /** Compact icon-only control vs full-width labeled button */
  iconOnly?: boolean
}

function buildGoogleOAuthStartUrl(callbackUrl?: string): string {
  const path = "/api/auth/google/start"
  if (!callbackUrl) return path
  return `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

/**
 * Starts backend Google OAuth (Passport): browser → `/api/auth/google/start` → API `/auth/google`.
 * After Google, the API must redirect the browser to this app’s
 * `/api/auth/google/callback` with tokens (same shape as email login).
 */
export function GoogleLoginButton({
  disabled = false,
  className,
  iconOnly = false,
  callbackUrl,
}: GoogleLoginButtonProps) {
  function handleGoogleClick() {
    window.location.assign(buildGoogleOAuthStartUrl(callbackUrl))
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "rounded-full border-primary/35 text-primary hover:bg-primary/10 hover:text-primary font-bold",
          className
        )}
        onClick={handleGoogleClick}
        disabled={disabled}
        aria-label="Đăng nhập với Google"
      >
        <GoogleIcon />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "gap-2 border-primary/35 text-primary hover:bg-primary/10 hover:text-primary",
        className
      )}
      onClick={handleGoogleClick}
      disabled={disabled}
    >
      <GoogleIcon />
      Đăng nhập với Google
    </Button>
  )
}
