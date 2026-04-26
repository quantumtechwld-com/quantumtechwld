import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderAdminActions } from "./OrderAdminActions";
import { OrderEditForm } from "./OrderEditForm";
import { MessagesPanel } from "@/components/MessagesPanel";
import LogoAnimated from "@/components/home/LogoAnimated";
import {
  ORDER_STATUS_LABEL as STATUS_LABEL,
  ORDER_STATUS_COLOR as STATUS_COLOR,
  ORDER_TYPE_LABEL,
  URGENCY_LABEL,
  URGENCY_COLOR,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteParams = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Readonly<RouteParams>) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "DEVELOPER") redirect("/portal");

  const { id } = await params;
  const [order, me] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        client:  { select: { id: true, name: true, email: true } },
        createdByAdmin: { select: { id: true, name: true, email: true } },
        payment: { select: { status: true, amountCents: true, currency: true, paidAt: true } },
        financial: { select: { id: true, status: true, totalAmountCents: true, paidCents: true } },
        rating:  true,
      },
    }),
    prisma.user.findUnique({ where: { email: session.user.email! }, select: { id: true } }),
  ]);

  if (!order) notFound();

  // Marcar mensagens como lidas pelo admin
  if (me) {
    await db.orderMessageRead.upsert({
      where: { orderId_userId: { orderId: id, userId: me.id } },
      create: { orderId: id, userId: me.id, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });
  }

  if (order.status === "PENDING") {
    await db.order.update({ where: { id }, data: { status: "EVALUATING" } });
    order.status = "EVALUATING";
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/5 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="hover:opacity-80 transition-opacity">
              <LogoAnimated size={28} />
            </Link>
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

      <div className="mx-auto max-w-4xl px-6 py-10 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {order.title ?? (ORDER_TYPE_LABEL[order.type] ?? order.type)}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">{ORDER_TYPE_LABEL[order.type] ?? order.type}</p>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            {order.orderRef && (
              <span className="font-mono text-sm text-slate-300 bg-white/5 border border-white/15 rounded px-2.5 py-1">
                {order.orderRef}
              </span>
            )}
            <p className="text-xs text-slate-500">
              {new Date(order.createdAt).toLocaleDateString("pt-PT", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            </p>
            {/* Atalho direto para o detalhe financeiro — só aparece quando OrderFinancial existe */}
            {order.financial?.id && (
              <Link
                href={`/admin/financeiro/${order.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                💳 Ver financeiro
              </Link>
            )}
          </div>
        </div>

        {/* Cliente */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Cliente</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
              {((order.client.name ?? order.client.email)?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{order.client.name ?? "—"}</p>
              <p className="text-xs text-slate-400">{order.client.email}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-400">
            {order.createdByAdmin ? (
              <p>
                Criado por admin: <span className="text-white">{order.createdByAdmin.name ?? order.createdByAdmin.email}</span>
                <span className="ml-1 text-slate-500">({order.createdByAdmin.email})</span>
              </p>
            ) : (
              <p>Origem do pedido: <span className="text-white">Cliente</span></p>
            )}
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
          {order.referenceLinks?.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Links de referência do cliente</p>
              <ul className="space-y-1">
                {(order.referenceLinks as string[]).map((link: string) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Proposta enviada (se existir) */}
        {order.productionInfo && (
          <section className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
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

        {/* Pagamento (quando existir registo Stripe) */}
        {order.payment && (
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Pagamento</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                {(() => {
                  const PAYMENT_COLOR: Record<string, string> = {
                    PAID:     "text-emerald-300",
                    PENDING:  "text-yellow-300",
                    FAILED:   "text-red-300",
                    REFUNDED: "text-slate-300",
                  };
                  const PAYMENT_LABEL: Record<string, string> = {
                    PAID:     "Pago ✓",
                    PENDING:  "Aguarda pagamento",
                    FAILED:   "Pagamento falhado",
                    REFUNDED: "Reembolsado",
                  };
                  return (
                    <>
                      <span className="text-slate-500 text-xs">Estado</span>
                      <p className={`mt-0.5 font-medium ${PAYMENT_COLOR[order.payment.status] ?? "text-slate-300"}`}>
                        {PAYMENT_LABEL[order.payment.status] ?? order.payment.status}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div>
                <span className="text-slate-500 text-xs">Valor</span>
                <p className="mt-0.5 text-white font-semibold">
                  {(order.payment.amountCents / 100).toLocaleString("pt-PT", {
                    style: "currency",
                    currency: order.payment.currency ?? "EUR",
                  })}
                </p>
              </div>
              {order.payment.paidAt && (
                <div>
                  <span className="text-slate-500 text-xs">Data de pagamento</span>
                  <p className="mt-0.5 text-slate-300">
                    {new Date(order.payment.paidAt).toLocaleDateString("pt-PT", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Avaliação do cliente (quando concluído) */}
        {order.rating && (
          <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-3">Avaliação do cliente</h2>
            <div className="flex items-center gap-3">
              <p className="text-xl">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < order.rating.score ? "text-yellow-400" : "text-slate-600"}>★</span>
                ))}
              </p>
              <span className="text-sm font-semibold text-yellow-300">{order.rating.score}/5</span>
            </div>
            {order.rating.comment && (
              <p className="mt-2 text-sm text-slate-300">{order.rating.comment}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {new Date(order.rating.createdAt).toLocaleDateString("pt-PT", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            </p>
          </section>
        )}

        {/* Acções do admin */}
        <OrderAdminActions
          order={{ id: order.id, status: order.status, type: order.type }}
          paymentPaid={order.payment?.status === "PAID"}
        />

        {/* Edição de campos básicos (só em PENDING / EVALUATING) */}
        {(order.status === "PENDING" || order.status === "EVALUATING") && (
          <OrderEditForm
            order={{
              id: order.id,
              type: order.type,
              title: order.title,
              description: order.description,
              urgency: order.urgency,
            }}
          />
        )}

        {/* Canal de mensagens */}
        <MessagesPanel orderId={order.id} currentUserId={me?.id ?? ""} />
      </div>
    </>
  );
}
