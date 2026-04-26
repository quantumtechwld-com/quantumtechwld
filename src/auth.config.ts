import type { NextAuthConfig } from "next-auth";

function getStatusRedirect(
  user: Record<string, unknown> | undefined,
  origin: string,
  allowPendingAdmin = false,
) {
  if (!user) return null;
  if (user.status === "PENDING" && !(allowPendingAdmin && user.role === "ADMIN")) {
    return Response.redirect(`${origin}/portal/erro?reason=pending`);
  }
  if (user.status === "SUSPENDED") {
    return Response.redirect(`${origin}/portal/erro?reason=suspended`);
  }
  return null;
}

/**
 * Configuração edge-safe para uso no middleware (sem PrismaAdapter).
 * Usa JWT strategy para que o middleware possa ler o cookie de sessão.
 */
export const authConfig = {
  pages: {
    signIn:        "/portal/login",
    verifyRequest: "/portal/verificar",
    error:         "/portal/erro",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    // session edge-safe: mapeia apenas os claims mínimos do JWT (id, role, status).
    // organizationId e orgRole não estão no JWT — são buscados do banco no
    // session callback do auth.ts (non-Edge). O middleware só precisa de role e status.
    session({ session, token }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.id     = token.id;
        u.role   = token.role   ?? "CLIENT";
        u.status = token.status ?? "PENDING";
      }
      return session;
    },
    // authorized: protege /admin e /portal no edge runtime (middleware)
    authorized({ auth, request }) {
      const pathname = (request as { nextUrl?: { pathname?: string; origin?: string } } | undefined)
        ?.nextUrl?.pathname ?? "";
      const origin = (request as { nextUrl?: { origin?: string } } | undefined)
        ?.nextUrl?.origin ?? "";

      // Páginas públicas do portal — sempre acessíveis
      const isPublicPortal = ["/portal/login", "/portal/verificar", "/portal/erro", "/portal/contato"]
        .some((p) => pathname.startsWith(p));
      if (isPublicPortal) return true;

      const user = auth?.user as Record<string, unknown> | undefined;

      // /admin — apenas ADMIN
      if (pathname.startsWith("/admin")) {
        if (!user) return false;
        const statusRedirect = getStatusRedirect(user, origin);
        if (statusRedirect) return statusRedirect;
        return user?.role === "ADMIN";
      }

      // /portal protegido — requer sessão e status ACTIVE
      if (pathname.startsWith("/portal")) {
        if (!user) return false;
        const statusRedirect = getStatusRedirect(user, origin, true);
        if (statusRedirect) return statusRedirect;
        return true;
      }

      return !!user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
