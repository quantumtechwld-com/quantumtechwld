import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { cookies } from "next/headers";

const isValid = (l: string | undefined | null): l is string =>
  !!l && (routing.locales as readonly string[]).includes(l);

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Para rotas sem prefixo de locale (ex: /portal/...), tenta o cookie NEXT_LOCALE
  if (!isValid(locale)) {
    try {
      const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
      if (isValid(cookieLocale)) locale = cookieLocale;
    } catch {
      // fall through
    }
  }

  if (!isValid(locale)) locale = routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
