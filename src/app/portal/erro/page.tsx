import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getContactUrl } from "@/lib/contact-url";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AuthErrorPage({
  searchParams,
}: Readonly<{ searchParams: SearchParams }>) {
  const sp = await searchParams;
  const reason = sp.reason;
  const errorKey = sp.error ?? "Default";
  const t = await getTranslations("portal");
  const locale = await getLocale();

  const reasonErrors: Record<string, { title: string; body: string }> = {
    pending: { title: t("erroPendingTitle"), body: t("erroPendingBody") },
    suspended: { title: t("erroSuspendedTitle"), body: t("erroSuspendedBody") },
    "access-denied": { title: t("erroAccessDeniedTitle"), body: t("erroAccessDeniedBody") },
  };

  const errors: Record<string, { title: string; body: string }> = {
    Verification:  { title: t("erroVerificationTitle"),  body: t("erroVerificationBody") },
    AccessDenied:  { title: t("erroAccessDeniedTitle"),  body: t("erroAccessDeniedBody") },
    Configuration: { title: t("erroConfigTitle"),        body: t("erroConfigBody") },
    Default:       { title: t("erroDefaultTitle"),       body: t("erroDefaultBody") },
  };

  const { title, body } = (reason ? reasonErrors[reason] : undefined) ?? errors[errorKey] ?? errors.Default;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10">
          <AlertTriangle size={28} className="text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-300 text-sm mb-6">{body}</p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/portal/login"
            className="inline-flex rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            {t("erroBackBtn")}
          </Link>
          {(reason === "pending" || reason === "suspended") && (
            <Link
              href={getContactUrl(locale)}
              className="text-sm text-slate-400 hover:text-accent transition-colors"
            >
              {t("navContact")}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
