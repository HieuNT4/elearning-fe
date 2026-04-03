/**
 * NestJS / common API error bodies: { message: string | string[], error?: string }
 */
export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback
  const o = data as { error?: string; message?: unknown }
  const msg = o.message
  if (Array.isArray(msg)) {
    const parts = msg.filter((m): m is string => typeof m === "string" && m.trim().length > 0)
    if (parts.length > 0) return parts.join("; ")
  }
  if (typeof msg === "string" && msg.trim()) return msg.trim()
  if (typeof o.error === "string" && o.error.trim()) return o.error.trim()
  return fallback
}
