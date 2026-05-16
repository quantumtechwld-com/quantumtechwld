import { type NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

const CSRF_COOKIE = "__csrf";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas por autenticação (NextAuth)
  const isAuthRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  // Rotas de API — passam sem transformação nem cookie CSRF
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Injeta x-pathname nos request headers para que Server Components
  // (ex: portal/layout.tsx) possam ler o pathname atual sem acesso ao URL.
  // Padrão documentado: https://nextjs.org/docs/app/building-your-application/routing/middleware#setting-headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let response: Response | NextResponse;

  if (isAuthRoute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authResult = await (auth as any)(request) as NextResponse | Response | undefined | null;
    if (authResult) {
      // Auth retornou redirect (login) ou erro — encaminhar sem modificação
      response = authResult;
    } else {
      // Auth liberou o acesso — encaminhar com x-pathname injetado
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }
  } else {
    // Tudo o resto (landing page e rotas públicas) → i18n routing
    response = intlMiddleware(request);
  }

  // Injectar CSRF cookie em respostas GET que ainda não o têm.
  // O cookie não é HttpOnly para que o JS do form possa lê-lo (double-submit pattern).
  if (request.method === "GET" && !request.cookies.get(CSRF_COOKIE) && response.status < 300) {
    const token = crypto.randomUUID();
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.headers.append(
      "Set-Cookie",
      `${CSRF_COOKIE}=${token}; Path=/; SameSite=Strict${secure}`,
    );
  }

  return response;
}

export const config = {
  // Exclui arquivos estáticos e internos do Next.js
  // NOTA: String.raw não pode ser usado aqui — o matcher exige literal de string
  // para análise estática do Turbopack (String.raw causaria "Invalid segment configuration")
  matcher: [
    // Turbopack requer string literal aqui — String.raw causaria "Invalid segment configuration"
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|xml|txt)$).*)",
  ],
};
