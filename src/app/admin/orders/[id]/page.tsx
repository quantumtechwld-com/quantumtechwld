import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderAdminActions } from "./OrderAdminActions";

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

const URGENCY_LABEL: Record<string, string> = {
  low:      "Baixa",
  normal:   "Normal",
  high:     "Alta",
  critical: "Crítica",
};

const URGENCY_COLOR: Record<string, string> = {
  low:      "text-slate-300",
  normal:   "text-blue-300",
  high:     "text-orange-300",
  critical: "text-red-300 font-semibold",
};

type RouteParams = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: RouteParams) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/portal");

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, email: true } } },
  });

  if (!order) notFound();

  if (order.status === "PENDING") {
    await db.order.update({ where: { id }, data: { status: "EVALUATING" } });
    order.status = "EVALUATING";
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold">
              A
            </div>
            <Link href="/admin/orders" className="text-sm text-white/50 hover:text-white/80 transition-colors">
              ← Pedidos
            </Link>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-slate-500/20 text-slate-300"}`}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {ORDER_TYPE_LABEL[order.type] ?? order.type}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString("pt-PT", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </p>
        </div>

        {/* Cliente */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Cliente</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
              {(order.client.name ?? order.client.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{order.client.name ?? "—"}</p>
              <p className="text-xs text-slate-400">{order.client.email}</p>
            </div>
          </div>
        </section>

        {/* Detalhes do pedido */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Pedido</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-slate-500 text-xs">Urgência</span>
              <p className={`mt-0.5 ${URGENCY_COLOR[order.urgency] ?? "text-slate-300"}`}>
                {URGENCY_LABEL[order.urgency] ?? order.urgency}
              </p>
            </div>
            {order.estimatedValue != null && (
              <div>
                <span className="text-slate-500 text-xs">Valor estimado</span>
                <p className="mt-0.5 text-white font-semibold">
                  {Number(order.estimatedValue).toLocaleString("pt-PT", {
                    style: "currency", currency: "EUR",
                  })}
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.description}</p>
        </section>

        {/* Proposta enviada (se existir) */}
        {order.productionInfo && (
          <section className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">
              Proposta enviada
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.productionInfo}</p>
            {order.adminNote && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400 mb-1 font-medium">Nota adicional</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{order.adminNote}</p>
              </div>
            )}
          </section>
        )}

        {/* Nota de revisão do cliente */}
        {order.status === "REVISION" && order.adminNote && (
          <section className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
              Pedido de revisão do cliente
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.adminNote}</p>
          </section>
        )}

        {/* Acções do admin */}
        <OrderAdminActions
          order={{ id: order.id, status: order.status, type: order.type }}
        />
      </main>
    </div>
  );
}
