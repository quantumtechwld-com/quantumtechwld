import type { NextAuthConfig } from "next-auth";

/**
 * Configuração edge-safe para uso no middleware (sem PrismaAdapter).
 * A verificação de role é feita nos server components; aqui apenas confirmamos
 * que o utilizador está autenticado.
 */
export const authConfig = {
  pages: {
    signIn: "/portal/login",
    verifyRequest: "/portal/verificar",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
