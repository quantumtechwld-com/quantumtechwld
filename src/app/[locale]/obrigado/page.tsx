import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ObrigadoPage() {
  const t = useTranslations("obrigado");
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-10 text-center backdrop-blur">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-accent-light">
          {t("badge")}
        </p>
        <h1 className="mb-4 text-4xl font-bold text-white">{t("title")}</h1>
        <p className="mb-8 text-slate-200">{t("body")}</p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-light"
        >
          {t("back")}
        </Link>
      </section>
    </main>
  );
}
