import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  RECEIVED:        "Recebido",
  IN_ANALYSIS:     "Em análise",
  PROPOSAL_SENT:   "Proposta enviada",
  IN_NEGOTIATION:  "Em negociação",
  APPROVED:        "Aprovado",
  IN_PROGRESS:     "Em desenvolvimento",
  DELIVERED:       "Entregue",
};

const STATUS_COLOR: Record<string, string> = {
  RECEIVED:        "bg-slate-500/30 text-slate-200",
  IN_ANALYSIS:     "bg-yellow-500/20 text-yellow-300",
  PROPOSAL_SENT:   "bg-blue-500/20 text-blue-300",
  IN_NEGOTIATION:  "bg-purple-500/20 text-purple-300",
  APPROVED:        "bg-emerald-500/20 text-emerald-300",
  IN_PROGRESS:     "bg-sky-500/20 text-sky-300",
  DELIVERED:       "bg-green-500/20 text-green-300",
};

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const briefings = await prisma.briefing.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-sky-300">Portal do Cliente</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Os seus projetos</h1>
          <p className="mt-1 text-sm text-slate-400">{session.user.email}</p>
        </div>
        <Link
          href="/api/auth/signout"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Sair
        </Link>
      </div>

      {briefings.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
          <p className="text-slate-400">Nenhum briefing encontrado.</p>
          <Link
            href="/#lead"
            className="mt-4 inline-flex rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Submeter briefing →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {briefings.map((b: (typeof briefings)[number]) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/15 bg-white/5 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{b.projectType}</p>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{b.painPoints}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[b.status] ?? "bg-slate-500/30 text-slate-200"}`}
                >
                  {STATUS_LABEL[b.status] ?? b.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-400">
                <div>
                  <p className="text-slate-500 uppercase tracking-wider mb-0.5">Orçamento</p>
                  <p className="text-white">{b.budget}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider mb-0.5">Prazo</p>
                  <p className="text-white">{b.timeline}</p>
                </div>
                {b.complexityScore && (
                  <div>
                    <p className="text-slate-500 uppercase tracking-wider mb-0.5">Complexidade</p>
                    <p className="text-white">{b.complexityScore}/10 · {b.hoursMin}–{b.hoursMax}h</p>
                  </div>
                )}
              </div>

              {b.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {b.features.map((f: string) => (
                    <span
                      key={f}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs text-slate-600">
                Submetido em {new Date(b.createdAt).toLocaleDateString("pt-PT", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
