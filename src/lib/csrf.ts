import "server-only";
import type { NextRequest } from "next/server";

export const CSRF_COOKIE = "__csrf";
export const CSRF_HEADER = "x-csrf-token";

/**
 * Validates the CSRF double-submit cookie.
 * Returns true if the x-csrf-token header matches the __csrf cookie.
 */
export function verifyCsrf(request: NextRequest): boolean {
  const cookie = request.cookies.get(CSRF_COOKIE)?.value ?? "";
  const header = request.headers.get(CSRF_HEADER) ?? "";
  if (!cookie || !header) return false;
  return timingSafeEqual(cookie, header);
}

/** Constant-time string comparison to prevent timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }
  return result === 0;
}
