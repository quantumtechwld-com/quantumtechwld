import { type NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

const VALID_LOCALES = routing.locales as readonly string[];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas por autenticação (NextAuth)
  const isAuthRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  if (isAuthRoute) {
    // Injeta o header x-next-intl-locale para que next-intl Server Components
    // (getTranslations, getLocale, etc.) recebam o locale correto via requestLocale.
    // O cookie NEXT_LOCALE é definido pelo intlMiddleware quando o utilizador troca idioma.
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = cookieLocale && VALID_LOCALES.includes(cookieLocale) ? cookieLocale : "pt";

    const requestWithLocale = new Request(request, {
      headers: new Headers({
        ...Object.fromEntries(request.headers.entries()),
        "x-next-intl-locale": locale,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (auth as any)(requestWithLocale as NextRequest);
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
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
