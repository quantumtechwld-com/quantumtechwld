"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_LOCALES = ["pt", "en", "es"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function isValid(l: unknown): l is Locale {
  return VALID_LOCALES.includes(l as Locale);
}

export async function setLocale(locale: string): Promise<void> {
  if (!isValid(locale)) throw new Error("Invalid locale");

  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthenticated");

  // Persistir na DB
  await prisma.user.update({
    where: { email },
    data: { locale },
  });

  // Actualizar cookie para que o layout releia na próxima request
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  });

  revalidatePath("/portal", "layout");
}
