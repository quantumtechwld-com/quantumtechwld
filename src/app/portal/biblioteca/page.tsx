import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddToLibraryForm from "./AddToLibraryForm";

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

  // Briefings entregues como candidatos a vincular
  const deliveredBriefings = await prisma.briefing.findMany({
    where: {
      user: { email: session.user.email },
      status: "DELIVERED",
    },
    select: { id: true, projectType: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Projetos já na biblioteca
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
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Link
            href="/portal"
            className="text-xs uppercase tracking-widest text-sky-300 hover:text-sky-200 transition"
          >
            ← Portal
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">Biblioteca de Projetos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Projetos entregues usados como referência nas estimativas de novos briefings.
          </p>
        </div>
      </div>

      {/* Projetos existentes */}
      {libraryProjects.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-slate-500">
            {libraryProjects.length} projeto{libraryProjects.length === 1 ? "" : "s"} na biblioteca
          </h2>
          <div className="grid gap-4">
            {libraryProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/15 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{p.title}</p>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{p.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    {p.projectType}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-400">
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider mb-0.5">Complexidade</p>
                    <p className="text-white">{p.complexityScore}/10</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider mb-0.5">Horas reais</p>
                    <p className="text-white">{p.hoursActual}h</p>
                  </div>
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider mb-0.5">Orçamento</p>
                    <p className="text-white">{p.budgetRange}</p>
                  </div>
                </div>

                {p.techStack.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.techStack.map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 px-2.5 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-600">
                  Adicionado em {new Date(p.createdAt).toLocaleDateString("pt-PT", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formulário de adição */}
      <section>
        <h2 className="mb-6 text-xs uppercase tracking-widest text-slate-500">
          Adicionar projeto entregue
        </h2>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
          <AddToLibraryForm deliveredBriefings={deliveredBriefings} />
        </div>
      </section>

    </main>
  );
}
