import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { cookies } from "next/headers";

const isValid = (l: string | undefined | null): l is string =>
  !!l && (routing.locales as readonly string[]).includes(l);

export default getRequestConfig(async ({ requestLocale }) => {
  // O cookie NEXT_LOCALE tem prioridade sobre o URL-locale.
  // Motivo: rotas do portal (/portal/...) não têm prefixo de locale, por isso
  // next-intl resolve requestLocale=="pt" (default) mesmo quando o utilizador
  // escolheu EN/ES. O cookie é definido pelo intlMiddleware ao navegar na landing.
  let locale: string | undefined;

  try {
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
    if (isValid(cookieLocale)) locale = cookieLocale;
  } catch {
    // cookies() pode falhar em alguns contextos — fallback abaixo
  }

  if (!isValid(locale)) locale = await requestLocale;
  if (!isValid(locale)) locale = routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
