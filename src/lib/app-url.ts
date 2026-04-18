/**
 * Retorna a URL base da aplicação.
 * Prioridade: AUTH_URL (NextAuth v5) → NEXTAUTH_URL (legado) → localhost
 */
export function appUrl(): string {
  return (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}
