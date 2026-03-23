/** HttpOnly cookie names — set only by Next.js Route Handlers */
export const AUTH_COOKIE_ACCESS = "access_token"
export const AUTH_COOKIE_REFRESH = "refresh_token"

/** Short-lived cookie: post-login path after Google OAuth (set before redirect to API) */
export const OAUTH_NEXT_PATH_COOKIE = "oauth_next_path"

/** Access token lifetime (seconds) — align with backend (~15m) */
export const ACCESS_TOKEN_MAX_AGE = 60 * 15

/** Refresh token lifetime (seconds) — align with backend (~7d) */
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

export function getAuthCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  }
}
