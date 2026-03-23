/**
 * Server-side API base URL (backend). No trailing slash.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url?.trim()) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }
  return url.replace(/\/$/, "")
}
