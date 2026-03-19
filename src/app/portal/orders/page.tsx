import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const STATUS_LABEL: Record<string, string> = {
  DRAFT:          "Rascunho",
  PENDING:        "Pendente",
  EVALUATING:     "Em análise",
  PROPOSAL_SENT:  "Proposta enviada",
  APPROVED:       "Aprovado",
  REVISION:       "Revisão solicitada",
  REJECTED:       "Recusado",
  IN_PRODUCTION:  "Em produção",
  COMPLETED:      "Concluído",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT:          "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  PENDING:        "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  EVALUATING:     "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  PROPOSAL_SENT:  "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  APPROVED:       "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  REVISION:       "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  REJECTED:       "bg-red-500/20 text-red-300 border border-red-500/30",
  IN_PRODUCTION:  "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  COMPLETED:      "bg-green-500/20 text-green-300 border border-green-500/30",
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  new_feature:  "Nova funcionalidade",
  bug_fix:      "Correção de bug",
  new_project:  "Novo projeto",
  support:      "Suporte",
  other:        "Outro",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const orders = await db.order.findMany({
    where: { client: { email: session.user.email } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <Link href="/portal" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
            ← Portal
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">Os seus pedidos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Solicite novas funcionalidades, suporte ou projetos ao nosso
            time.
          </p>
        </div>
        <Link
          href="/portal/orders/new"
          className="shrink-0 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          + Novo pedido
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-10 text-center">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-slate-300 font-medium">Ainda não tem pedidos</p>
          <p className="mt-1 text-sm text-slate-500">
            Utilize o botão &ldquo;Novo pedido&rdquo; para solicitar algo ao nosso team.
          </p>
          <Link
            href="/portal/orders/new"
            className="mt-5 inline-flex rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Criar primeiro pedido →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {orders.map((o: any) => (
            <Link
              key={o.id}
              href={`/portal/orders/${o.id}`}
              className="group block rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:bg-white/8 hover:border-sky-500/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {ORDER_TYPE_LABEL[o.type] ?? o.type}
                  </p>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{o.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status] ?? "bg-slate-500/20 text-slate-300"}`}
                >
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {new Date(o.createdAt).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
