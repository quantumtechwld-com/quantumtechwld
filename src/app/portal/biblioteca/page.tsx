import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

type RefProject = {
  id: string;
  title: string;
  description: string;
  projectType: string;
  features: string[];
  techStack: string[];
  complexityScore: number;
  hoursActual: number;
  budgetRange: string;
  createdAt: Date;
};

export default async function BibliotecaPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");
  const locale = await getLocale();

  // Importação lazy para evitar erro de edge runtime
  const { prisma } = await import("@/lib/prisma");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const libraryProjects = (await (prisma as any).referenceProject.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      projectType: true,
      features: true,
      techStack: true,
      complexityScore: true,
      hoursActual: true,
      budgetRange: true,
      createdAt: true,
    },
  })) as RefProject[];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">

      {/* Header */}
      <div className="mb-10">
        <Link
          href="/portal"
          className="text-xs uppercase tracking-widest text-accent-light hover:text-accent-light transition"
        >
          {t("bibliotecaPortal")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">{t("bibliotecaTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {t("bibliotecaSubtitle")}
        </p>
      </div>

      {/* Lista de projetos */}
      {libraryProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <BookOpen size={22} className="text-white/30" />
          </div>
          <p className="text-sm font-medium text-slate-300">{t("bibliotecaEmptyTitle")}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t("bibliotecaEmptyBody")}
          </p>
        </div>
      ) : (
        <section>
          <p className="mb-6 text-xs uppercase tracking-widest text-slate-500">
            {libraryProjects.length === 1
              ? t("bibliotecaCountSingle", { count: libraryProjects.length })
              : t("bibliotecaCountPlural", { count: libraryProjects.length })}
          </p>
          <div className="grid gap-4">
            {libraryProjects.map((p) => (
              <Link
                key={p.id}
                href={`/portal/biblioteca/${p.id}`}
                className="group block rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-accent/40 hover:bg-white/8 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white group-hover:text-accent-light transition">{p.title}</p>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{p.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    {p.projectType}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{t("bibliotecaComplexity")}</p>
                    <p className="text-sm text-white">{p.complexityScore}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{t("bibliotecaHours")}</p>
                    <p className="text-sm text-white">{p.hoursActual}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{t("bibliotecaBudget")}</p>
                    <p className="text-sm text-white">{p.budgetRange}</p>
                  </div>
                </div>

                {p.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.techStack.slice(0, 6).map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 px-2.5 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                    {p.techStack.length > 6 && (
                      <span className="rounded-full bg-white/5 border border-white/10 text-slate-400 px-2.5 py-0.5 text-xs">
                        +{p.techStack.length - 6}
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    {t("bibliotecaAddedOn", {
                      date: new Date(p.createdAt).toLocaleDateString(locale, {
                        day: "2-digit", month: "long", year: "numeric",
                      }),
                    })}
                  </span>
                  <span className="text-accent group-hover:text-accent-light transition text-xs">
                    {t("bibliotecaViewDetails")}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
