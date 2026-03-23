"use client";

import { useEffect } from "react";

interface SetLocaleLangProps {
  locale: string;
}

/**
 * Sets documentElement.lang for accessibility and SEO when inside [locale] layout.
 * Root layout uses a default lang; this syncs it to the actual locale.
 */
export function SetLocaleLang({ locale }: SetLocaleLangProps) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}
