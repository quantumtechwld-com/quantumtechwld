import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

const VALID_LOCALES = ["pt", "en", "es"] as const;
type Locale = (typeof VALID_LOCALES)[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function isValid(locale: string | undefined | null): locale is Locale {
  return VALID_LOCALES.includes(locale as Locale);
}

function detectLocaleFromHeader(acceptLanguage: string): Locale {
  const lang = acceptLanguage.toLowerCase();
  if (/\ben(-[a-z]{2})?\b/.test(lang)) return "en";
  if (/\bes(-[a-z]{2})?\b/.test(lang)) return "es";
  return "pt";
}

async function loadMessages(locale: Locale) {
  switch (locale) {
    case "en": return (await import("../../../messages/en.json")).default;
    case "es": return (await import("../../../messages/es.json")).default;
    default: return (await import("../../../messages/pt.json")).default;
  }
}

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  let locale: Locale = "pt";

  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { locale: true },
    });

    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
    const dbLocale = user?.locale;

    if (isValid(cookieLocale)) {
      locale = cookieLocale;
    } else if (isValid(dbLocale)) {
      locale = dbLocale;
    } else {
      const headersList = await headers();
      locale = detectLocaleFromHeader(headersList.get("accept-language") ?? "");
    }
  }

  setRequestLocale(locale);
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-background text-white">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
