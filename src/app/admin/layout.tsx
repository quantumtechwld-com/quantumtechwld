import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import AdminHeader from "./components/AdminHeader";

const VALID_LOCALES = ["pt", "en", "es"] as const;
type Locale = (typeof VALID_LOCALES)[number];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function isValid(locale: string | undefined | null): locale is Locale {
  return VALID_LOCALES.includes(locale as Locale);
}

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

  const currentRole = session?.user?.role ?? "DEVELOPER";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-background text-white">
        <AdminHeader role={currentRole} />
        <main className="mx-auto max-w-400 px-5 py-8">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
