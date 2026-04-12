import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    // Rotas do portal não têm prefixo de locale na URL.
    // Lemos o locale preferido do utilizador diretamente da base de dados.
    try {
      const session = await auth();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { locale: true },
        });
        const dbLocale = user?.locale;
        if (dbLocale && (routing.locales as readonly string[]).includes(dbLocale)) {
          locale = dbLocale;
        }
      }
    } catch {
      // silently fall back to default
    }

    if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
      locale = routing.defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
