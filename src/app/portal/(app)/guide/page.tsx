import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function GuidePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");

  const GUIDE_STATES = [
    { key: "Pending",    color: "bg-blue-500/20 text-blue-300" },
    { key: "Analysis",   color: "bg-yellow-500/20 text-yellow-300" },
    { key: "Proposal",   color: "bg-accent/20 text-accent-light" },
    { key: "Approved",   color: "bg-emerald-500/20 text-emerald-300" },
    { key: "Revision",   color: "bg-orange-500/20 text-orange-300" },
    { key: "Rejected",   color: "bg-red-500/20 text-red-300" },
    { key: "Production", color: "bg-purple-500/20 text-purple-300" },
    { key: "Completed",  color: "bg-green-500/20 text-green-300" },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-10">
        <Link href="/portal" className="text-sm text-accent hover:text-accent-light transition-colors">
          {t("guideBack")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">{t("guideTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("guideSubtitle")}</p>
      </div>

      <div className="space-y-6">

        {/* 1. Briefing */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent-light">1</span>
            <h2 className="text-base font-semibold text-white">{t("guide1Title")}</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{t("guide1Body")}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent-light">{t("guide1Tag1")}</span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent-light">{t("guide1Tag2")}</span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent-light">{t("guide1Tag3")}</span>
          </div>
        </section>

        {/* 2. Proposta */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">2</span>
            <h2 className="text-base font-semibold text-white">{t("guide2Title")}</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{t("guide2Body")}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-300">{t("guide2Tag1")}</span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-300">{t("guide2Tag2")}</span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-300">{t("guide2Tag3")}</span>
          </div>
        </section>

        {/* 3. Pedido de serviço */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">3</span>
            <h2 className="text-base font-semibold text-white">{t("guide3Title")}</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{t("guide3Body")}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{t("guide3Tag1")}</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{t("guide3Tag2")}</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{t("guide3Tag3")}</span>
          </div>
        </section>

        {/* 4. Pagamento */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">4</span>
            <h2 className="text-base font-semibold text-white">{t("guide4Title")}</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t("guide4BodyStart")}{" "}
            <strong className="text-white">{t("guide4BodyProduction")}</strong>{" "}
            {t("guide4BodyEnd")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300">{t("guide4Tag1")}</span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300">{t("guide4Tag2")}</span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-300">{t("guide4Tag3")}</span>
          </div>
        </section>

        {/* 5. Conclusão e avaliação */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/20 text-sm font-bold text-yellow-300">5</span>
            <h2 className="text-base font-semibold text-white">{t("guide5Title")}</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t("guide5BodyStart")}{" "}
            <strong className="text-white">{t("guide5BodyCompleted")}</strong>
            {t("guide5BodyEnd")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-yellow-300">{t("guide5Tag1")}</span>
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-yellow-300">{t("guide5Tag2")}</span>
          </div>
        </section>

        {/* Estados */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">{t("guideStatesTitle")}</h2>
          <div className="grid gap-2 text-xs">
            {GUIDE_STATES.map(({ key, color }) => (
              <div key={key} className="flex items-center gap-3">
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-medium ${color}`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`guideStatus${key}` as any)}
                </span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className="text-slate-400">{t(`guideStatus${key}Desc` as any)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ajuda */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5 text-center">
          <p className="text-sm text-slate-400 mb-3">{t("guideHelpText")}</p>
          <Link
            href="/portal/orders/new"
            className="inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            {t("guideNewOrder")}
          </Link>
        </div>

      </div>
    </main>
  );
}

