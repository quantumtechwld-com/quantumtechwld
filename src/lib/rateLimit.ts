/**
 * Rate limiter simples em memória, partilhado por múltiplas rotas.
 * Cada instância mantém o seu próprio Map — usar uma instância por rota
 * garante limites independentes (ex: lead vs contact têm maxRequests diferentes).
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RateLimiterOptions {
  /** Janela de tempo em milissegundos (default: 10 min) */
  windowMs?: number;
  /** Número máximo de pedidos por IP dentro da janela (default: 5) */
  maxRequests?: number;
}

export function createRateLimiter(options?: RateLimiterOptions) {
  const WINDOW_MS = options?.windowMs ?? 10 * 60 * 1000;
  const MAX       = options?.maxRequests ?? 5;
  const map       = new Map<string, { count: number; resetAt: number }>();

  return function isRateLimited(ip: string): boolean {
    const now   = Date.now();
    const entry = map.get(ip);
    if (!entry || now > entry.resetAt) {
      // Purgar entradas expiradas quando o Map cresce demais
      if (map.size > 100) {
        for (const [k, v] of map) if (now > v.resetAt) map.delete(k);
      }
      map.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return false;
    }
    if (entry.count >= MAX) return true;
    entry.count++;
    return false;
  };
}
