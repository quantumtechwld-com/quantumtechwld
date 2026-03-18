import type { NextAuthConfig } from "next-auth";

/**
 * Configuração edge-safe para uso no middleware (sem PrismaAdapter).
 * Usa JWT strategy para que o middleware possa ler o cookie de sessão.
 */
export const authConfig = {
  pages: {
    signIn: "/portal/login",
    verifyRequest: "/portal/verificar",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
