import { Outfit } from "next/font/google";

/**
 * Primary font configuration
 * Change this to update the font across the entire application
 *
 * To use a different Google Font:
 * 1. Import it from "next/font/google"
 * 2. Configure it with desired subsets and weights
 * 3. Export it as `primaryFont`
 *
 * To use a custom CDN font:
 * 1. Add the font link in src/app/[locale]/layout.tsx <head>
 * 2. Set fontFamily directly in CSS/Tailwind
 */
// Limit weights to 400 and 600 for better Performance (smaller font payload, faster LCP)
export const primaryFont = Outfit({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-primary",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  preload: true,
});

/**
 * Font class name for body element
 */
export const fontClassName = primaryFont.className;

/**
 * CSS variable for the font (use in Tailwind config if needed)
 */
export const fontVariable = primaryFont.variable;
