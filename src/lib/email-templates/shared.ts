/**
 * Email template shared helpers.
 *
 * Single source of truth for logo block and footer signatures
 * across all transactional emails.
 *
 * Usage (inside any template literal):
 *   ${emailLogoHeader()}           → dark variant (white mono logo)
 *   ${emailLogoHeader("light")}    → light variant (dark logo on white bg)
 *   ${emailFooterTeam()}           → client-facing signature
 *   ${emailFooterSystem()}         → admin/internal signature
 */

/** Absolute base URL for email asset paths (required — relative URLs don't work in email clients). */
const BASE_URL = process.env.NEXTAUTH_URL ?? "";

/**
 * Branded logo header block for email templates.
 * - "dark"  → white mono logo  (`logo-mono-white.svg`) — for dark backgrounds (#0f0f14)
 * - "light" → full-colour logo (`logo-dark.svg`)        — for light/white backgrounds
 */
export function emailLogoHeader(variant: "dark" | "light" = "dark"): string {
  const file = variant === "dark" ? "logo-mono-white.svg" : "logo-dark.svg";
  // width=155 maintains the 190:44 viewBox aspect ratio at height=36
  return `<div style="margin-bottom:24px"><img src="${BASE_URL}/images/logo/${file}" alt="Quantum Technology" width="155" height="36" style="display:block" /></div>`;
}

/** Standard footer for client-facing transactional emails. */
export function emailFooterTeam(): string {
  return `<p style="color:#475569;font-size:12px;margin-top:32px">— Equipa Quantum Technology</p>`;
}

/** Standard footer for internal/admin notification emails. */
export function emailFooterSystem(): string {
  return `<p style="color:#475569;font-size:12px;margin-top:32px">— Sistema Quantum Technology</p>`;
}
