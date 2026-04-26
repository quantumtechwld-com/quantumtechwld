import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
import { buildInviteEmail, type InviteLocale } from "@/lib/email-templates/invite";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  // Sessão expira em 8 horas — re-autenticação via magic link
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  // Cookies explícitos — HttpOnly + SameSite=Lax + Secure em produção
  // NextAuth v5 já aplica __Secure- prefix automaticamente quando secure:true
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
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
      sendVerificationRequest: async ({ identifier, url }) => {
        // Extrai o locale do parâmetro invite_locale embutido no callbackUrl do magic link.
        // Convites do admin: callbackUrl = /portal?invite_locale=pt|en|es
        // Login normal: callbackUrl = /portal ou /admin (sem invite_locale)
        let locale: InviteLocale | null = null;
        try {
          const urlObj = new URL(url);
          const cb = decodeURIComponent(urlObj.searchParams.get("callbackUrl") ?? "");
          const cbUrl = new URL(cb, url);
          const l = cbUrl.searchParams.get("invite_locale");
          if (l === "pt" || l === "en" || l === "es") locale = l;
        } catch {
          // fallback: login simples
        }

        if (locale === null) {
          // Fluxo de login normal: e-mail simples de acesso
          const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:32px auto;background:#0f0f14;color:#e2e8f0;padding:40px;border-radius:16px;border:1px solid #ffffff15">
  <p style="color:#0ea5e9;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 16px">Quantum Tech</p>
  <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 16px">Seu link de acesso</h1>
  <p style="color:#e2e8f0;margin:0 0 8px;font-size:14px">Clique no botão abaixo para acessar o portal. O link expira em <strong>24 horas</strong>.</p>
  <a href="${url}" style="display:inline-block;background:#0ea5e9;color:#ffffff;font-weight:600;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;margin-top:20px">
    Acessar o Portal →
  </a>
  <hr style="border:none;border-top:1px solid #ffffff10;margin:32px 0">
  <p style="color:#475569;font-size:12px;margin:0">Se não solicitou este acesso, pode ignorar este e-mail.</p>
</div>
</body></html>`;
          const text = `Seu link de acesso ao Portal Quantum Tech:\n\n${url}\n\nO link expira em 24 horas.\n\nSe não solicitou este acesso, ignore este e-mail.`;
          await sendMail({ to: identifier, subject: "Seu link de acesso — Portal Quantum Tech", html, text });
        } else {
          // Fluxo de convite: e-mail personalizado com nome e idioma
          const dbUser = await prisma.user.findUnique({
            where: { email: identifier },
            select: { name: true },
          });
          const { html, text, subject } = buildInviteEmail(dbUser?.name ?? null, url, locale);
          await sendMail({ to: identifier, subject, html, text });
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const candidateEmail = user.email?.toLowerCase().trim();

      if (!candidateEmail) return true;

      const dbUser = await prisma.user.findUnique({
        where: { email: candidateEmail },
        select: { status: true },
      });

      if (!dbUser) {
        return "/portal/erro?reason=access-denied";
      }

      if (dbUser.status === "PENDING") {
        return "/portal/erro?reason=pending";
      }

      if (dbUser.status === "SUSPENDED") {
        return "/portal/erro?reason=suspended";
      }

      return true;
    },
    // Chamado ao criar/renovar o JWT. Guarda apenas o mínimo necessário para o
    // middleware Edge: id, role e status. Campos como organizationId e orgRole
    // são buscados do banco no session callback (não-Edge), mantendo o cookie
    // pequeníssimo (~250 bytes) e eliminando o erro 400/502 do Nginx.
    async jwt({ token, user }) {
      if (user) {
        // Login inicial: popula token com dados frescos do DB via PrismaAdapter.
        token.id     = user.id;
        token.role   = (user as Record<string, unknown>).role   ?? "CLIENT";
        token.status = (user as Record<string, unknown>).status ?? "PENDING";
      } else if (token.id) {
        // Renovação do token (sem novo login): re-sincroniza role e status do DB
        // para garantir que o middleware Edge veja alterações feitas pelo admin.
        const fresh = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true, status: true },
        });
        if (fresh) {
          token.role   = fresh.role;
          token.status = fresh.status;
        }
      }
      // Remove claims padrão do NextAuth que inflam o cookie desnecessariamente.
      // name, email, picture e sub são recuperados via DB no session callback.
      delete (token as Record<string, unknown>).name;
      delete (token as Record<string, unknown>).email;
      delete (token as Record<string, unknown>).picture;
      return token;
    },
    // Chamado em cada request autenticado no servidor (não-Edge).
    // Busca do banco os campos que foram removidos do JWT para manter o cookie pequeno.
    // role é lido SEMPRE do banco — nunca do token — para refletir alterações
    // feitas pelo admin sem exigir novo login do utilizador.
    async session({ session, token }) {
      if (!token.id) return session;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          name: true,
          email: true,
          role: true,
          status: true,
          organizationId: true,
          orgMemberships: {
            select: { role: true },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      });

      session.user.id             = token.id as string;
      session.user.role           = (dbUser?.role ?? token.role) as "CLIENT" | "ADMIN" | "DEVELOPER";
      session.user.name           = dbUser?.name ?? null;
      session.user.email          = dbUser?.email ?? "";
      session.user.status         = (dbUser?.status ?? "PENDING") as "PENDING" | "ACTIVE" | "SUSPENDED";
      session.user.organizationId = dbUser?.organizationId ?? null;
      session.user.orgRole        = (dbUser?.orgMemberships?.[0]?.role ?? null) as "ADMIN" | "MEMBER" | null;
      return session;
    },
  },
  events: {
    // Disparado APÓS o token ser verificado e a sessão criada (clique no magic link).
    // Diferente do callbacks.signIn que é chamado ao enviar o email.
    async signIn({ user }) {
      if (user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data:  { lastLoginAt: new Date() },
        });
      }
    },
  },
});
