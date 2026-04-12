import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const isValid = (l: string | undefined | null): l is string =>
  !!l && (routing.locales as readonly string[]).includes(l);

async function resolvePortalLocale(): Promise<string> {
  try {
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
    if (isValid(cookieLocale)) return cookieLocale;

    const session = await auth();
    const email = session?.user?.email;
    if (email) {
      const user = await prisma.user.findUnique({ where: { email }, select: { locale: true } });
      const dbLocale = user?.locale;
      if (isValid(dbLocale)) return dbLocale;
    }
  } catch {
    // fall through to default
  }
  return routing.defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!isValid(locale)) {
    locale = await resolvePortalLocale();
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
