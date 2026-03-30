import type { KnipConfig } from "knip"

/**
 * Knip: unused code & dependency analysis for this Next.js App Router repo.
 * `core/**` is legacy/shared toolkit not wired into the app graph yet.
 */
const config: KnipConfig = {
  project: ["**/*.{ts,tsx}"],
  ignore: [
    ".cursor/**",
    "core/**",
    // Commented on home page; keep for future i18n (EN/JA) content
    "features/feedback/**",
    // Shadcn extras not imported yet
    "components/ui/input-otp.tsx",
    "components/ui/password-input.tsx",
    "components/ui/progress.tsx",
  ],
  ignoreDependencies: [
    // Only referenced from ignored `core/**`
    "@vladmandic/face-api",
    "axios",
    "bcryptjs",
    "blurhash",
    "browser-image-compression",
    "cropperjs",
    "file-type",
    "firebase",
    "jose",
    "react-cropper",
    "react-dropzone",
    "tesseract.js",
    "tus-js-client",
    // Used by ignored `components/ui/input-otp.tsx`
    "input-otp",
    // Used by ignored `core/lib/auth.ts` (NextAuth options template)
    "next-auth",
    // Resolved via CSS `@import` in `app/globals.css` (no JS import)
    "shadcn",
    "tw-animate-css",
    // Tailwind v4 is loaded through `@tailwindcss/postcss`; no direct JS import
    "tailwindcss",
  ],
  ignoreIssues: {
    "components/ui/**": ["exports", "types"],
    "features/**/index.ts": ["exports", "types"],
    "features/**/messages/**": ["exports", "types"],
    "features/**/validations/**": ["exports", "types"],
  },
}

export default config
