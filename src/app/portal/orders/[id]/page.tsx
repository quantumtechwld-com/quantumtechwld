import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderClientActions } from "./OrderClientActions";
import { MessagesPanel } from "@/components/MessagesPanel";

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
  support:      "Suporte técnico",
  other:        "Outro",
};

const URGENCY_LABEL: Record<string, string> = {
  low:      "Baixa",
  normal:   "Normal",
  high:     "Alta",
  critical: "Crítica",
};

type RouteParams = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const { id } = await params;
  const [order, me] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: { client: { select: { email: true, name: true } } },
    }),
    prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }),
  ]);

  if (!order) notFound();
  if (order.client.email !== session.user.email) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-8">
        <Link href="/portal/orders" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
          ← Pedidos
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-white">
            {ORDER_TYPE_LABEL[order.type] ?? order.type}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-slate-500/20 text-slate-300"}`}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Criado em{" "}
          {new Date(order.createdAt).toLocaleDateString("pt-PT", {
            day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-4">
        {/* Descrição */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Descrição</h2>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span>
              Urgência:{" "}
              <span className="text-slate-300">{URGENCY_LABEL[order.urgency] ?? order.urgency}</span>
            </span>
          </div>
        </section>

        {/* Proposta do admin (visible when PROPOSAL_SENT or later) */}
        {["PROPOSAL_SENT", "APPROVED", "REVISION", "IN_PRODUCTION", "COMPLETED"].includes(order.status) &&
          order.productionInfo && (
            <section className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">
                Proposta da equipa
              </h2>
              {order.estimatedValue != null && (
                <p className="mb-2 text-sm text-slate-300">
                  <span className="text-slate-500">Valor estimado: </span>
                  <span className="font-semibold text-white">
                    {Number(order.estimatedValue).toLocaleString("pt-PT", {
                      style: "currency", currency: "EUR",
                    })}
                  </span>
                </p>
              )}
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.productionInfo}</p>
              {order.adminNote && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Nota adicional</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{order.adminNote}</p>
                </div>
              )}
            </section>
          )}

        {/* Nota da revisão (if client already sent revision request) */}
        {order.status === "REVISION" && order.adminNote && (
          <section className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
              A sua nota de revisão
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.adminNote}</p>
          </section>
        )}
      </div>

      {/* Client action buttons  */}
      <OrderClientActions
        order={{
          id:             order.id,
          status:         order.status,
          estimatedValue: order.estimatedValue,
          productionInfo: order.productionInfo,
          adminNote:      order.adminNote,
        }}
      />

      <div className="mt-6">
        <MessagesPanel orderId={order.id} currentUserId={me?.id ?? ""} />
      </div>
    </main>
  );
}
