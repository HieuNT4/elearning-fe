"use client";

import { GoogleLoginButton } from "./google-login-button";
import { FacebookLoginButton } from "./facebook-login-button";
import { InstagramLoginButton } from "./instagram-login-button";
import { LineLoginButton } from "./line-login-button";
import { SocialLoginDivider } from "./social-login-divider";

interface SocialLoginSectionProps {
  disabled?: boolean;
  mode?: "login" | "register";
  callbackUrl?: string;
}

/**
 * Divider + social login buttons. Used for lazy loading to reduce TBT on login page.
 */
export function SocialLoginSection({
  disabled = false,
  mode = "login",
  callbackUrl,
}: SocialLoginSectionProps) {
  return (
    <>
      <SocialLoginDivider />
      <div className='flex justify-center gap-4'>
        <GoogleLoginButton
          mode={mode}
          disabled={disabled}
          callbackUrl={callbackUrl}
        />
        <FacebookLoginButton
          mode={mode}
          disabled={disabled}
          callbackUrl={callbackUrl}
        />
        <InstagramLoginButton
          mode={mode}
          disabled={disabled}
          callbackUrl={callbackUrl}
        />
        <LineLoginButton
          mode={mode}
          disabled={disabled}
          callbackUrl={callbackUrl}
        />
      </div>
    </>
  );
}
