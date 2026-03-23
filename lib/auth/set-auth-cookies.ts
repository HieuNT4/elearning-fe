import type { NextResponse } from "next/server"

import {
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
  getAuthCookieOptions,
  REFRESH_TOKEN_MAX_AGE,
} from "./constants"

type BackendTokens = {
  access_token: string
  refresh_token: string
}

export function setAuthCookiesOnResponse(
  res: NextResponse,
  tokens: BackendTokens
) {
  res.cookies.set(
    AUTH_COOKIE_ACCESS,
    tokens.access_token,
    getAuthCookieOptions(ACCESS_TOKEN_MAX_AGE)
  )
  res.cookies.set(
    AUTH_COOKIE_REFRESH,
    tokens.refresh_token,
    getAuthCookieOptions(REFRESH_TOKEN_MAX_AGE)
  )
}
