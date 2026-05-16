import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ContactForm } from "./ContactForm";

export default async function ContactPage() {
  setRequestLocale("en");
  const t = await getTranslations("portal");
  const messages = (await import("../../../../../messages/en.json")).default;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10">
        <Link href="/" className="text-sm text-accent hover:text-accent-light transition-colors">
          {t("contactBack")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">{t("contactTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("contactSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
        <NextIntlClientProvider locale="en" messages={messages}>
          <ContactForm />
        </NextIntlClientProvider>
      </div>
    </main>
  );
}
