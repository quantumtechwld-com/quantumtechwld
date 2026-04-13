"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { sendMagicLink } from "./actions";
import { MailCheck } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("portal");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await sendMagicLink(email);
      if (result.ok) {
        setSent(true);
      } else {
        const codeMap: Record<string, string> = {
          NOT_FOUND: t("loginErrNotFound"),
          PENDING:   t("loginErrPending"),
          SUSPENDED: t("loginErrSuspended"),
        };
        setErrorMsg(codeMap[result.code] ?? t("loginErrGeneric"));
      }
    } catch {
      setErrorMsg(t("loginErrGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur text-center">
        {sent ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
              <MailCheck size={28} className="text-accent-light" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t("loginSentTitle")}</h1>
            <p className="text-slate-300 text-sm">
              {t("loginSentBodyBefore")}{" "}
              <span className="text-accent-light font-medium">{email}</span>
              {t("loginSentBodyAfter")}
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm uppercase tracking-widest text-accent-light">{t("loginTagline")}</p>
            <h1 className="mb-1 text-2xl font-bold text-white">{t("loginTitle")}</h1>
            <p className="mb-6 text-sm text-slate-400">{t("loginSubtitle")}</p>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("loginEmailPlaceholder")}
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-accent w-full"
              />
              {errorMsg && (
                <div>
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {errorMsg}
                  </p>
                  <a
                    href="/portal/contato"
                    className="mt-2 block text-center text-xs text-accent hover:text-accent-light transition-colors"
                  >
                    {t("loginContactLink")}
                  </a>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-accent py-3 font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
              >
                {loading ? t("loginSending") : t("loginSend")}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
