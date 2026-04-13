import { type NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas por autenticação (NextAuth)
  const isAuthRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  if (isAuthRoute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (auth as any)(request);
  }

  // Rotas de API — passam sem transformação
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Tudo o resto (landing page e rotas públicas) → i18n routing
  return intlMiddleware(request);
}

export const config = {
  // Exclui arquivos estáticos e internos do Next.js
  // NOTA: String.raw não pode ser usado aqui — o matcher exige literal de string
  // para análise estática do Turbopack (String.raw causaria "Invalid segment configuration")
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
