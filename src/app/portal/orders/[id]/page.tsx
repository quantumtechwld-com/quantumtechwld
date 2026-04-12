import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderClientActions } from "./OrderClientActions";
import { MessagesPanel } from "@/components/MessagesPanel";
import { PayOrderButton } from "./PayOrderButton";
import { RatingWidget } from "./RatingWidget";
import {
  ORDER_STATUS_LABEL as STATUS_LABEL,
  ORDER_STATUS_COLOR as STATUS_COLOR,
  ORDER_TYPE_LABEL,
  URGENCY_LABEL,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteParams = {
  params:      Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string>>;
};

export default async function OrderDetailPage({ params, searchParams }: Readonly<RouteParams>) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const paymentCancelled = sp.payment === "cancelled";
  const [order, me] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        client:  { select: { email: true, name: true } },
        payment: { select: { status: true, amountCents: true } },
        rating:  true,
      },
    }),
    prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }),
  ]);

  if (!order) notFound();
  if (order.client.email !== session.user.email) notFound();

  // Marcar mensagens como lidas pelo cliente
  if (me) {
    await db.orderMessageRead.upsert({
      where: { orderId_userId: { orderId: id, userId: me.id } },
      create: { orderId: id, userId: me.id, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      {paymentCancelled && (
        <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          ⚠️ Pagamento cancelado. Pode tentar novamente quando quiser.
        </div>
      )}
      {order.payment?.status === "FAILED" && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          ❌ O pagamento anterior falhou. Verifique os dados do cartão e tente novamente.
        </div>
      )}
      <div className="mb-8">
        <Link href="/portal/orders" className="text-sm text-accent hover:text-accent-light transition-colors">
          ← Pedidos
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {ORDER_TYPE_LABEL[order.type] ?? order.type}
            </h1>
            {order.orderRef && (
              <p className="mt-1 font-mono text-sm text-slate-400">
                Ref.{" "}
                <span className="text-slate-200 bg-white/5 border border-white/10 rounded px-2 py-0.5">
                  {order.orderRef}
                </span>
              </p>
            )}
          </div>
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
            <section className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
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

      {/* Pagamento Stripe: visível apenas quando APPROVED e sem pagamento confirmado */}
      {order.status === "APPROVED" && order.payment?.status !== "PAID" && order.estimatedValue && (
        <div className="mt-4">
          <PayOrderButton orderId={order.id} estimatedValue={Number(order.estimatedValue)} />
        </div>
      )}

      {/* Fatura: visível quando pagamento confirmado */}
      {order.payment?.status === "PAID" && (
        <div className="mt-4">
          <Link
            href={`/portal/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
          >
            📄 Ver fatura
          </Link>
        </div>
      )}

      {/* Avaliação: visível quando concluído e sem rating */}
      {order.status === "COMPLETED" && !order.rating && (
        <div className="mt-6">
          <RatingWidget orderId={order.id} />
        </div>
      )}

      {/* Rating já submetido */}
      {order.rating && (
        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-xs font-semibold text-yellow-300 mb-1">A sua avaliação</p>
          <p className="text-lg">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < order.rating.score ? "text-yellow-400" : "text-slate-600"}>★</span>
            ))}
          </p>
          {order.rating.comment && (
            <p className="mt-1 text-sm text-slate-300">{order.rating.comment}</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <MessagesPanel orderId={order.id} currentUserId={me?.id ?? ""} />
      </div>
    </main>
  );
}
