"use client"

/**
 * App-wide client providers. Extend with ThemeProvider / toast when deps are added.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
