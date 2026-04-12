import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextIntlClientProvider } from "next-intl";

/** Parse Accept-Language header e retorna "en" | "es" | "pt" */
function detectLocaleFromHeader(acceptLanguage: string): string {
  const lang = acceptLanguage.toLowerCase();
  if (/\ben(-[a-z]{2})?\b/.test(lang)) return "en";
  if (/\bes(-[a-z]{2})?\b/.test(lang)) return "es";
  return "pt";
}

async function loadMessages(locale: string) {
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

  let locale = "pt";

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { locale: true },
    });

    locale = user?.locale ?? "pt";

    // Auto-detecta locale no primeiro acesso (ainda no default "pt")
    // Se o browser reporta EN ou ES, salva no BD
    if (locale === "pt") {
      const headersList = await headers();
      const acceptLang = headersList.get("accept-language") ?? "";
      const detected = detectLocaleFromHeader(acceptLang);
      if (detected !== "pt") {
        locale = detected;
        await prisma.user.update({
          where: { email: session.user.email },
          data: { locale: detected },
        });
      }
    }
  }

  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
