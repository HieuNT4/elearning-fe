/**
 * Prevent open redirects: only same-origin relative paths are allowed.
 */
export function safeCallbackUrl(url: string | undefined | null): string {
  if (!url || !url.startsWith("/") || url.startsWith("//")) {
    return "/"
  }
  return url
}
