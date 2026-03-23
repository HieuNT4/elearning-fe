"use client";

import { useTranslations } from "next-intl";

export function SocialLoginDivider() {
  const t = useTranslations("auth.social");

  return (
    <div className="my-4">
      <div className="flex items-center gap-3">
        <div className="w-full border-t" />
        <span className="shrink-0 text-sm text-muted-foreground">
          {t("orContinueWith")}
        </span>
        <div className="w-full border-t" />
      </div>
    </div>
  );
}
