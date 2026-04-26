import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessOrder } from "@/lib/auth/canAccessOrder";
import Link from "next/link";
import { PrintButton } from "./PrintButton";
import { getTranslations, getLocale } from "next-intl/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type RouteParams = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Readonly<RouteParams>) {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");
  const locale = await getLocale();

  const ORDER_TYPE_LABEL: Record<string, string> = {
    new_feature: t("invoiceTypeNewFeature"),
    bug_fix:     t("invoiceTypeBugFix"),
    new_project: t("invoiceTypeNewProject"),
    support:     t("invoiceTypeSupport"),
    correction:  t("invoiceTypeCorrection"),
    alteration:  t("invoiceTypeAlteration"),
    other:       t("invoiceTypeOther"),
  };

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      client:  { select: { email: true, name: true, company: true, phone: true } },
      payment: { select: { status: true, amountCents: true, currency: true, paidAt: true, stripePaymentIntent: true } },
    },
  });

  if (!order) notFound();
  if (!canAccessOrder(order, session.user)) notFound();
  if (order.payment?.status !== "PAID") redirect(`/portal/orders/${id}`);

  // SENSIVEL: invoice deve sempre refletir a moeda gravada na transacao,
  // nunca a moeda derivada do locale da interface.
  const amount = (order.payment.amountCents / 100).toLocaleString(locale, {
    style: "currency", currency: order.payment.currency?.toUpperCase() ?? "EUR",
  });

  const invoiceNumber = `QT-${id.slice(-8).toUpperCase()}`;
  const paidAt = order.payment.paidAt
    ? new Date(order.payment.paidAt).toLocaleDateString(locale, {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="mx-auto w-full max-w-2xl px-6 py-12">
        {/* Voltar + Imprimir — ocultos na impressão */}
        <div className="no-print mb-8 flex items-center justify-between">
          <Link href={`/portal/orders/${id}`} className="text-sm text-accent hover:text-accent-light transition-colors">
            {t("invoiceBack")}
          </Link>
          <PrintButton />
        </div>

        {/* Documento de fatura */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-8 print:border-none print:bg-white print:text-black print:p-0">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white print:text-black">Quantum Technology</h1>
              <p className="text-sm text-slate-400 print:text-gray-600">quantum.technology.agency</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-slate-500 print:text-gray-500">{t("invoiceLabel")}</p>
              <p className="text-xl font-bold text-white print:text-black">{invoiceNumber}</p>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">{paidAt}</p>
            </div>
          </div>

          <hr className="border-white/10 mb-6 print:border-gray-200" />

          {/* Dados do cliente */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-slate-500 print:text-gray-500 mb-2">{t("invoiceBilledTo")}</p>
            <p className="text-sm font-semibold text-white print:text-black">{order.client.name ?? "—"}</p>
            {order.client.company && (
              <p className="text-sm text-slate-300 print:text-gray-700">{order.client.company}</p>
            )}
            <p className="text-sm text-slate-400 print:text-gray-600">{order.client.email}</p>
            {order.client.phone && (
              <p className="text-sm text-slate-400 print:text-gray-600">{order.client.phone}</p>
            )}
          </div>

          <hr className="border-white/10 mb-6 print:border-gray-200" />

          {/* Descrição do serviço */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 print:text-gray-500">
                <th className="text-left pb-3 font-medium">{t("invoiceDescCol")}</th>
                <th className="text-right pb-3 font-medium">{t("invoiceAmountCol")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-slate-200 print:text-gray-800 py-2 pr-4">
                  <p className="font-medium text-white print:text-black">
                    {ORDER_TYPE_LABEL[order.type] ?? order.type}
                  </p>
                  <p className="text-xs text-slate-400 print:text-gray-500 mt-0.5 line-clamp-2">
                    {order.description}
                  </p>
                </td>
                <td className="text-right text-white print:text-black font-semibold py-2 whitespace-nowrap">
                  {amount}
                </td>
              </tr>
            </tbody>
          </table>

          <hr className="border-white/10 mb-4 print:border-gray-200" />

          {/* Total */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-slate-400 print:text-gray-600">{t("invoiceTotal")}</p>
            <p className="text-2xl font-bold text-white print:text-black">{amount}</p>
          </div>

          {/* Estado pagamento */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 print:border-green-300 print:bg-green-50 print:text-green-800 flex items-center gap-2">
            <span>✓</span>
            <span>
            {t("invoicePaidAt", { date: paidAt })}
              {order.payment.stripePaymentIntent && (
                <span className="ml-2 text-xs opacity-60">· {order.payment.stripePaymentIntent}</span>
              )}
            </span>
          </div>

          {/* Rodapé */}
          <p className="mt-8 text-xs text-slate-600 print:text-gray-400 text-center">
          {t("invoiceFooter")}
          </p>
        </div>
      </main>
    </>
  );
}
