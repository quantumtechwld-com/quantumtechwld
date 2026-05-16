import { cookies, headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

const VALID_LOCALES = ["pt", "en", "es"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValid(l: string | undefined | null): l is Locale {
  return VALID_LOCALES.includes(l as Locale);
}

/**
 * Infere o locale a partir do caminho da URL para as páginas públicas de contato.
 * O caminho é injetado como header `x-pathname` pelo middleware e é o sinal mais
 * explícito: /contato = pt, /contact = en, /contacto = es.
 * Retorna null para outras rotas (login, verificar, erro) onde cookie/Accept-Language
 * deve ser usado.
 */
function inferLocaleFromPath(path: string): Locale | null {
  // Ordem importa: verificar /contacto antes de /contact (evitar substring match)
  if (/\/contacto(\/|$)/.test(path)) return "es";
  if (/\/contato(\/|$)/.test(path))  return "pt";
  if (/\/contact(\/|$)/.test(path))  return "en";
  return null;
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

/** Resolve locale para utilizadores autenticados: cookie → DB → Accept-Language */
async function resolveAuthLocale(email: string): Promise<Locale> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { locale: true },
  });
  const dbLocale = user?.locale;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  if (isValid(cookieLocale)) {
    if (dbLocale !== cookieLocale) {
      await prisma.user.update({ where: { email }, data: { locale: cookieLocale } });
    }
    return cookieLocale;
  }

  if (isValid(dbLocale)) return dbLocale;

  // locale = null (novo utilizador) — detectar pelo Accept-Language e persistir
  const headersList = await headers();
  const detected = detectLocaleFromHeader(headersList.get("accept-language") ?? "");
  await prisma.user.update({ where: { email }, data: { locale: detected } });
  return detected;
}

/** Resolve locale para visitantes não autenticados: URL path → cookie → Accept-Language */
async function resolvePublicLocale(): Promise<Locale> {
  const headersList = await headers();

  // (1) URL path — fonte mais explícita para páginas de contato nomeadas por idioma
  const localeFromPath = inferLocaleFromPath(headersList.get("x-pathname") ?? "");
  if (localeFromPath) return localeFromPath;

  // (2) Cookie NEXT_LOCALE — escolha explícita do utilizador via LangSwitcher
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (isValid(cookieLocale)) return cookieLocale;

  // (3) Accept-Language do browser como último fallback
  return detectLocaleFromHeader(headersList.get("accept-language") ?? "");
}

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const locale = session?.user?.email
    ? await resolveAuthLocale(session.user.email)
    : await resolvePublicLocale();

  setRequestLocale(locale);
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

