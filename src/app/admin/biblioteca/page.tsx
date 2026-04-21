import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddToLibraryForm from "@/app/portal/biblioteca/AddToLibraryForm";

type RefProject = {
  id: string;
  title: string;
  description: string;
  projectType: string;
  techStack: string[];
  complexityScore: number;
  hoursActual: number;
  budgetRange: string;
  createdAt: Date;
};

export default async function AdminBibliotecaPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  // Todos os briefings entregues para vincular ao projeto
  const deliveredBriefings = await prisma.briefing.findMany({
    where: { status: "DELIVERED" },
    select: { id: true, projectType: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const libraryProjects = (await (prisma as any).referenceProject.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      projectType: true,
      techStack: true,
      complexityScore: true,
      hoursActual: true,
      budgetRange: true,
      createdAt: true,
    },
  })) as RefProject[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">

        {/* Cabeçalho */}
        <div>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest text-accent-light hover:text-accent-light transition"
          >
            ← Admin Panel
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">Biblioteca de Referência</h1>
          <p className="mt-1 text-sm text-slate-400">
            Projetos entregues usados pelo sistema de IA para estimar novos briefings.
          </p>
        </div>

        {/* Projetos existentes */}
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-widest text-slate-500">
            {libraryProjects.length} projeto{libraryProjects.length === 1 ? "" : "s"} na biblioteca
          </h2>

          {libraryProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-slate-500 text-sm">
              Nenhum projeto ainda. Adicione o primeiro usando o formulário abaixo.
            </div>
          ) : (
            <div className="grid gap-3">
              {libraryProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">{p.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.techStack.slice(0, 5).map((t: string) => (
                        <span key={t} className="rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 px-2 py-0.5 text-xs">
                          {t}
                        </span>
                      ))}
                      {p.techStack.length > 5 && (
                        <span className="rounded-full bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 text-xs">
                          +{p.techStack.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <span className="block rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-medium text-emerald-300 capitalize">
                      {p.projectType}
                    </span>
                    <p className="text-xs text-slate-500">{p.complexityScore}/10 · {p.hoursActual}h</p>
                    <p className="text-xs text-slate-500">{p.budgetRange}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Formulário de adição */}
        <section>
          <h2 className="mb-6 text-xs uppercase tracking-widest text-slate-500">
            Adicionar projeto à biblioteca
          </h2>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <AddToLibraryForm deliveredBriefings={deliveredBriefings} />
          </div>
        </section>

    </div>
  );
}
