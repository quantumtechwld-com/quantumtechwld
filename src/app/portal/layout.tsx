import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import PortalShell from "@/components/portal/PortalShell";

const VALID_LOCALES = ["pt", "en", "es"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValid(l: string | undefined | null): l is Locale {
  return VALID_LOCALES.includes(l as Locale);
}

/** Parse Accept-Language header e retorna "en" | "es" | "pt" */
function detectLocaleFromHeader(acceptLanguage: string): Locale {
  const lang = acceptLanguage.toLowerCase();
  const parts = lang.split(",").map((p) => p.split(";")[0].trim());
  if (parts.some((p) => p === "en" || p.startsWith("en-"))) return "en";
  if (parts.some((p) => p === "es" || p.startsWith("es-"))) return "es";
  return "pt";
}

async function loadMessages(locale: Locale) {
  switch (locale) {
    case "en": return (await import("../../../messages/en.json")).default;
    case "es": return (await import("../../../messages/es.json")).default;
    default:   return (await import("../../../messages/pt.json")).default;
  }
}

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  let locale: Locale = "pt";

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { locale: true },
    });

    const dbLocale = user?.locale;

    // 1. Verificar o cookie NEXT_LOCALE definido pelo LangSwitcher
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

    if (isValid(cookieLocale)) {
      locale = cookieLocale;
      // Persistir na DB se diferente
      if (dbLocale !== cookieLocale) {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { locale: cookieLocale },
        });
      }
    } else if (isValid(dbLocale)) {
      locale = dbLocale;
    } else {
      // 2. Sem cookie nem locale na DB — detectar pelo Accept-Language
      const headersList = await headers();
      const acceptLang = headersList.get("accept-language") ?? "";
      const detected = detectLocaleFromHeader(acceptLang);
      locale = detected;
      if (detected !== "pt") {
        await prisma.user.update({
          where: { email: session.user.email },
          data: { locale: detected },
        });
      }
    }
  }

  // Comunica o locale resolvido ao next-intl para que getTranslations()
  // nos Server Components do portal também funcione neste locale.
  setRequestLocale(locale);

  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PortalShell>
        {children}
      </PortalShell>
    </NextIntlClientProvider>
  );
}
