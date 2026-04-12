import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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


function getComplexityColor(score: number) {
  if (score <= 3) return "text-emerald-300 bg-emerald-500/10 border-emerald-400/20";
  if (score <= 6) return "text-yellow-300 bg-yellow-500/10 border-yellow-400/20";
  if (score <= 8) return "text-orange-300 bg-orange-500/10 border-orange-400/20";
  return "text-red-300 bg-red-500/10 border-red-400/20";
}

export default async function BibliotecaDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = (await (prisma as any).referenceProject.findUnique({
    where: { id },
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
  })) as RefProject | null;

  if (!project) notFound();

  const t = await getTranslations("portal");
  const locale = await getLocale();

  function getComplexityLabel(score: number) {
    if (score <= 3) return t("complexityLow");
    if (score <= 6) return t("complexityMedium");
    if (score <= 8) return t("complexityHigh");
    return t("complexityVeryHigh");
  }

  const complexityLabel = getComplexityLabel(project.complexityScore);
  const complexityColor = getComplexityColor(project.complexityScore);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">

      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/portal" className="hover:text-accent-light transition">{t("bibliotecaPortalLink")}</Link>
        <span>/</span>
        <Link href="/portal/biblioteca" className="hover:text-accent-light transition">{t("bibliotecaLibraryLink")}</Link>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-50">{project.title}</span>
      </div>

      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-white leading-tight">{project.title}</h1>
          <span className="shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 capitalize">
            {project.projectType}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">{project.description}</p>
        <p className="mt-2 text-xs text-slate-600">
          {t("bibliotecaAddedOn", {
            date: new Date(project.createdAt).toLocaleDateString(locale, {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
          })}
        </p>
      </div>

      {/* Métricas */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
        <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t("bibliotecaDetailMetrics")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t("bibliotecaDetailComplexity")}</p>
            <span className={`inline-block rounded-full border px-3 py-0.5 text-sm font-medium ${complexityColor}`}>
              {complexityLabel} ({project.complexityScore}/10)
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t("bibliotecaDetailHours")}</p>
            <p className="text-lg font-semibold text-white">{project.hoursActual}h</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t("bibliotecaDetailBudget")}</p>
            <p className="text-sm font-medium text-white">{project.budgetRange}</p>
          </div>
        </div>
      </div>

      {/* Tecnologias */}
      {project.techStack.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t("bibliotecaDetailStack")}</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((t: string) => (
              <span
                key={t}
                className="rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 px-3 py-1 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Funcionalidades */}
      {project.features.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-4">{t("bibliotecaDetailFeatures")}</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {project.features.map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Back */}
      <Link
        href="/portal/biblioteca"
        className="inline-flex items-center gap-2 text-sm text-accent-light hover:text-accent-light transition"
      >
        {t("bibliotecaDetailBack")}
      </Link>

    </main>
  );
}
