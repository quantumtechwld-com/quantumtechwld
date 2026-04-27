import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { OrderClientActions } from "./OrderClientActions";
import { MessagesPanel } from "@/components/MessagesPanel";
import { PayOrderButton } from "./PayOrderButton";
import { PixPaymentPanel } from "@/components/PixPaymentPanel";
import { RatingWidget } from "./RatingWidget";
import { convertAndFormatByLocale, getCurrencyForLocale, formatCurrency, getExchangeRate } from "@/lib/currency";
import {
  ORDER_STATUS_LABEL as STATUS_LABEL,
  ORDER_STATUS_COLOR as STATUS_COLOR,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Helpers de estilo para o cronograma de pagamentos (sem dependência de escopo)
function instSlotClass(isPaid: boolean, isOverdue: boolean): string {
  if (isPaid) return "bg-emerald-500/5 border border-emerald-500/20";
  if (isOverdue) return "bg-red-500/5 border border-red-500/20";
  return "bg-white/5 border border-white/10";
}
function instStatusClass(isPaid: boolean, isOverdue: boolean): string {
  if (isPaid) return "text-emerald-400";
  if (isOverdue) return "text-red-400";
  return "text-yellow-400";
}

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
        client:   { select: { email: true, name: true } },
        payment:  { select: { status: true, amountCents: true } },
        rating:   true,
        financial: {
          include: {
            installments: { orderBy: { sequence: "asc" } },
          },
        },
      },
    }),
    prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }),
  ]);

  if (!order) notFound();

  if (!canAccessOrder(order, session.user)) notFound();

  const t = await getTranslations("portal");
  const locale = await getLocale();

  // Membros de organização sem role ADMIN não veem dados financeiros
  const isOrgMember = !!session.user.organizationId && session.user.orgRole === "MEMBER";

  // Valor estimado convertido para a moeda do locale (câmbio em tempo real, cache 1 h)
  const estimatedFormatted = order.estimatedValue == null
    ? null
    : await convertAndFormatByLocale(Number(order.estimatedValue), "EUR", locale);
  const isConverted = getCurrencyForLocale(locale) !== "EUR";

  // Pré-computar valor da parcela pendente — sempre na moeda do contrato (EUR)
  // Não converter para BRL/USD: o cliente paga em EUR no Stripe, e o display
  // deve coincidir com o valor cobrado no botão de pagamento.
  const pendingInst = order.financial?.installments?.find((i: { status: string }) => i.status === "PENDING");
  const pendingInstFormatted = pendingInst
    ? formatCurrency(pendingInst.amountCents / 100, locale, "EUR")
    : null;

  // Taxa de câmbio (EUR → moeda do locale) reutilizada no cronograma e no PIX. Cache 1 h.
  const localCurrency = getCurrencyForLocale(locale);
  const scheduleRate = localCurrency === "EUR" ? 1 : await getExchangeRate("EUR", localCurrency);

  // PIX: amountCents no DB são EUR cents; exibir em BRL requer conversão.
  const pendingInstPixBrlCents: number | null =
    pendingInst?.method === "MANUAL_PIX" && locale === "pt"
      ? Math.round(pendingInst.amountCents * scheduleRate)
      : null;
  const orderTypeLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      new_feature: "orderTypeNewFeature",
      bug_fix: "orderTypeBugFix",
      new_project: "orderTypeNewProject",
      support: "orderTypeSupport",
      other: "orderTypeOther",
      correction: "orderTypeCorrection",
      alteration: "orderTypeAlteration",
    };
    const key = keyMap[type];
    return key ? t(key) : type;
  };
  const orderStatusLabel = (status: string) => {
    const keyMap: Record<string, string> = {
      DRAFT: "orderStatusDraft",
      PENDING: "orderStatusPending",
      EVALUATING: "orderStatusEvaluating",
      PROPOSAL_SENT: "orderStatusProposalSent",
      APPROVED: "orderStatusApproved",
      REVISION: "orderStatusRevision",
      REJECTED: "orderStatusRejected",
      IN_PRODUCTION: "orderStatusInProduction",
      COMPLETED: "orderStatusCompleted",
    };
    const key = keyMap[status];
    return key ? t(key) : (STATUS_LABEL[status] ?? status);
  };
  const urgencyLabel = (urgency: string) => {
    const keyMap: Record<string, string> = {
      low: "urgencyLow",
      normal: "urgencyNormal",
      high: "urgencyHigh",
      critical: "urgencyCritical",
    };
    const key = keyMap[urgency];
    return key ? t(key) : urgency;
  };

  // Marcar mensagens como lidas pelo cliente
  if (me) {
    await db.orderMessageRead.upsert({
      where: { orderId_userId: { orderId: id, userId: me.id } },
      create: { orderId: id, userId: me.id, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });
  }

  // Helpers para exibição do cronograma — extraídos para cumprir limite de complexidade cognitiva.
  function instStatusText(isPaid: boolean, isOverdue: boolean): string {
    if (isPaid) return t("payScheduleStatusPaid");
    if (isOverdue) return t("payScheduleStatusOverdue");
    return t("payScheduleStatusPending");
  }
  function instLabel(sequence: number, isSinglePayment: boolean): string {
    if (isSinglePayment) return t("payScheduleSinglePayment");
    if (sequence === 1) return t("payScheduleEntry");
    return `${t("payScheduleInstallment")} ${sequence}`;
  }
  function instMethodLabel(method: string): string {
    const map: Record<string, string> = {
      STRIPE: t("payScheduleMethodStripe"),
      MANUAL_PIX: t("payScheduleMethodPix"),
      MANUAL_TRANSFER: t("payScheduleMethodTransfer"),
      MANUAL_OTHER: t("payScheduleMethodOther"),
    };
    return map[method] ?? method;
  }

  // Cronograma de pagamentos — exibe todas as parcelas, valores e datas.
  function renderPaymentSchedule() {
    if (isOrgMember) return null;
    const insts = order.financial?.installments as Array<{
      id: string;
      sequence: number;
      amountCents: number;
      method: string;
      status: string;
      dueDate?: string | null;
    }> | undefined;
    if (!insts?.length) return null;
    const POST_APPROVAL = ["APPROVED", "IN_PRODUCTION", "IN_REVIEW", "REVIEW_APPROVED", "COMPLETED"];
    if (!POST_APPROVAL.includes(order.status)) return null;
    const now = new Date();
    const isSinglePayment = insts.length === 1;
    const paidCount = insts.filter((i) => i.status === "PAID").length;
    return (
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/3 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t("payScheduleTitle")}
          </h2>
          {insts.length > 1 && (
            <span className="text-xs text-slate-500">
              {paidCount}/{insts.length} {t("paySchedulePaidCount")}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {insts.map((inst) => {
            const isPaid = inst.status === "PAID";
            const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
            const isOverdue = !isPaid && dueDate ? dueDate < now : false;
            const amount = formatCurrency(
              (inst.amountCents / 100) * scheduleRate,
              locale,
              localCurrency,
            );
            return (
              <div
                key={inst.id}
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${instSlotClass(isPaid, isOverdue)}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{instLabel(inst.sequence, isSinglePayment)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {instMethodLabel(inst.method)}
                    {dueDate ? (
                      <span className={isOverdue ? " text-red-400 font-medium" : ""}>
                        {" · "}
                        {t("payScheduleDue")}{" "}
                        {dueDate.toLocaleDateString(locale, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span>{" · "}{t("payScheduleNoDueDate")}</span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{amount}</p>
                  <span className={`text-xs font-medium ${instStatusClass(isPaid, isOverdue)}`}>
                    {instStatusText(isPaid, isOverdue)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {isConverted && (
          <p className="mt-3 text-xs text-slate-600">{t("payScheduleApproxNote")}</p>
        )}
      </section>
    );
  }

  // PIX é exclusivo do Brasil — oculto para outros locales.
  // Usa pendingInstPixBrlCents (EUR→BRL convertido) para exibir o valor correto em reais.
  function renderPixCard(opts: {
    orderId: string;
    amtCents: number; // EUR cents (original, usado como fallback)
    label: string;
    dueDate?: string | null;
  }) {
    if (locale !== "pt") return null;
    // Priorizar valor já convertido para BRL; fallback para o valor EUR bruto caso a
    // conversão não tenha sido pré-computada (ex: installment não é o pendingInst).
    const brlCents = pendingInstPixBrlCents ?? opts.amtCents;
    return (
      <PixPaymentPanel
        orderId={opts.orderId}
        amountCents={brlCents}
        installmentLabel={opts.label}
        dueDate={opts.dueDate}
      />
    );
  }

  // ── Widget de pagamento de parcelas pendentes ─────────────────────────────
  function renderInstallmentCard(
    inst: { method: string; amountCents: number; sequence: number; dueDate?: string | null },
    formattedValue: string,
  ) {
    const isEntry  = inst.sequence === 1;
    const amtCents = inst.amountCents;
    const label    = isEntry ? t("payInstallmentEntry") : t("payInstallmentFinal");
    const dueDate  = inst.dueDate ? new Date(inst.dueDate) : null;
    const isOverdue = dueDate ? dueDate < new Date() : false;
    const dueDateLabel = dueDate
      ? dueDate.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })
      : null;
    const dueBadge = dueDateLabel ? (
      <p className={`text-xs mb-2 ${isOverdue ? "text-red-400 font-semibold" : "text-slate-400"}`}>
        {isOverdue ? t("payDueDateOverdue") : t("payDueDate")} {dueDateLabel}
      </p>
    ) : null;

    if (inst.method === "STRIPE") {
      return (
        <div className="mt-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
          <h2 className="text-sm font-semibold text-violet-300 mb-1">{label}</h2>
          <p className="text-2xl font-bold text-white mb-3">{formattedValue}</p>
          {dueBadge}
          <PayOrderButton orderId={order.id} amountCents={amtCents} installmentLabel={label} />
        </div>
      );
    }

    if (inst.method === "MANUAL_PIX") {
      return renderPixCard({ orderId: order.id, amtCents, label, dueDate: inst.dueDate });
    }

    // MANUAL_TRANSFER / MANUAL_OTHER
    return (
      <div className={`mt-4 rounded-2xl border p-5 ${isOverdue ? "border-red-500/40 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
        <h2 className={`text-sm font-semibold mb-1 ${isOverdue ? "text-red-300" : "text-yellow-300"}`}>{label}</h2>
        <p className="text-2xl font-bold text-white mb-3">{formattedValue}</p>
        {dueBadge}
        <p className="text-xs text-slate-400">{t("payManualInstructions")}</p>
      </div>
    );
  }

  function renderPendingPayment() {
    if (isOrgMember) return null;
    const POST_APPROVAL = ["APPROVED", "IN_PRODUCTION", "IN_REVIEW", "REVIEW_APPROVED", "COMPLETED"];
    if (!POST_APPROVAL.includes(order.status)) return null;
    const financial   = order.financial;
    const isFullyPaid = financial ? financial.status === "PAID" : order.payment?.status === "PAID";
    if (isFullyPaid) return null;
    if (financial && pendingInst && pendingInstFormatted) return renderInstallmentCard(pendingInst, pendingInstFormatted);
    if (!financial && order.payment?.status !== "PAID" && order.estimatedValue) {
      return (
        <div className="mt-4">
          <PayOrderButton orderId={order.id} amountCents={Math.round(Number(order.estimatedValue) * 100)} />
        </div>
      );
    }
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      {paymentCancelled && (
        <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          {t("orderPayCancelled")}
        </div>
      )}
      {order.payment?.status === "FAILED" && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {t("orderPayFailed")}
        </div>
      )}
      <div className="mb-8">
        <Link href="/portal/orders" className="text-sm text-accent hover:text-accent-light transition-colors">
          {t("orderBack")}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {order.title ?? orderTypeLabel(order.type)}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">{orderTypeLabel(order.type)}</p>
            {order.orderRef && (
              <p className="mt-1 font-mono text-sm text-slate-400">
                {t("orderRef")}{" "}
                <span className="text-slate-200 bg-white/5 border border-white/10 rounded px-2 py-0.5">
                  {order.orderRef}
                </span>
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-slate-500/20 text-slate-300"}`}
          >
            {orderStatusLabel(order.status)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {t("orderCreatedAt")}{" "}
          {new Date(order.createdAt).toLocaleDateString(locale, {
            day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-4">
        {/* Descrição */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{t("orderDescTitle")}</h2>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span>
              {t("orderUrgency")}{" "}
              <span className="text-slate-300">{urgencyLabel(order.urgency)}</span>
            </span>
          </div>
          {order.referenceLinks?.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">{t("orderRefLinksTitle")}</p>
              <ul className="space-y-1">
                {(order.referenceLinks as string[]).map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-light underline underline-offset-2 break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Proposta do admin (visible when PROPOSAL_SENT or later) */}
        {["PROPOSAL_SENT", "APPROVED", "REVISION", "IN_PRODUCTION", "IN_REVIEW", "REVIEW_APPROVED", "COMPLETED"].includes(order.status) &&
          order.productionInfo && (
            <section className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                {t("orderProposalTitle")}
              </h2>
              {!isOrgMember && estimatedFormatted && (
                <p className="mb-2 text-sm text-slate-300">
                  <span className="text-slate-500">{t("orderEstValue")} </span>
                  <span className="font-semibold text-white">{estimatedFormatted}</span>
                  {isConverted && (
                    <span className="ml-1 text-xs text-slate-500">{t("orderValueApprox")}</span>
                  )}
                </p>
              )}
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.productionInfo}</p>
              {order.adminNote && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400 mb-1 font-medium">{t("orderAdminNote")}</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{order.adminNote}</p>
                </div>
              )}
            </section>
          )}

        {/* Nota da revisão (if client already sent revision request) */}
        {order.status === "REVISION" && order.adminNote && (
          <section className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
              {t("orderRevisionNote")}
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.adminNote}</p>
          </section>
        )}

        {/* Motivo de rejeição */}
        {order.status === "REJECTED" && order.adminNote && (
          <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
              {t("orderRejectionTitle")}
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.adminNote}</p>
          </section>
        )}

        {/* CTA solicitar esclarecimento quando recusado */}
        {order.status === "REJECTED" && (
          <section className="rounded-2xl border border-slate-500/30 bg-slate-500/5 p-5">
            <p className="text-sm text-slate-300 mb-3">{t("orderRejectedQuestion")}</p>
            <a
              href="#messages"
              className="inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
            >
              {t("orderClarificationBtn")}
            </a>
          </section>
        )}

        {/* Entrega do dev — visível a partir de IN_REVIEW */}
        {["IN_REVIEW", "REVIEW_APPROVED", "COMPLETED"].includes(order.status) && order.deliveryNote && (
          <section className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">{t("orderDeliveryTitle")}</h2>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{order.deliveryNote}</p>
            {order.deliveryLinks?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {(order.deliveryLinks as string[]).map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Resultado final (COMPLETED) */}
        {order.status === "COMPLETED" && (order.finalDeliveryUrl || order.finalDeliveryNote) && (
          <section className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">{t("orderFinalResultTitle")}</h2>
            {order.finalDeliveryNote && (
              <p className="text-sm text-slate-200 whitespace-pre-wrap mb-3">{order.finalDeliveryNote}</p>
            )}
            {order.finalDeliveryUrl && (
              <a
                href={order.finalDeliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-sm font-medium text-teal-300 transition hover:bg-teal-500/20"
              >
                {t("orderFinalResultBtn")}
              </a>
            )}
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
          deliveryNote:   order.deliveryNote,
          deliveryLinks:  order.deliveryLinks,
        }}
      />

      {/* Cronograma de pagamentos — visível a partir de APPROVED para clientes com parcelas */}
      {renderPaymentSchedule()}

      {/* Pagamento: visível em qualquer status pós-aprovação quando há parcelas pendentes */}
      {renderPendingPayment()}

      {/* Fatura: visível quando pagamento confirmado — apenas para admin da org ou dono direto */}
      {!isOrgMember && (order.financial?.status === "PAID" || order.payment?.status === "PAID") && (
        <div className="mt-4">
          <Link
            href={`/portal/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
          >
            {t("orderInvoice")}
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
          <p className="text-xs font-semibold text-yellow-300 mb-1">{t("orderRatingTitle")}</p>
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

      <div id="messages" className="mt-6">
        <MessagesPanel orderId={order.id} currentUserId={me?.id ?? ""} />
      </div>
    </main>
  );
}
