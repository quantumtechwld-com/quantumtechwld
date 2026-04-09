import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    // Chamado ao criar/renovar o JWT. `user` só existe no momento do signin.
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id;
        token.role   = (user as Record<string, unknown>).role   ?? "CLIENT";
        token.status = (user as Record<string, unknown>).status ?? "PENDING";
      }
      return token;
    },
    // Expõe id, role e status na sessão client-side.
    session({ session, token }) {
      if (token) {
        session.user.id     = token.id as string;
        session.user.role   = token.role   as "CLIENT" | "ADMIN";
        session.user.status = token.status as "PENDING" | "ACTIVE" | "SUSPENDED";
      }
      return session;
    },
  },
});
