import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrencyByCode } from "@/lib/currency";
import { getPersistedCurrency } from "@/services/finance/contractCurrency";
import {
  FINANCIAL_STATUS_LABEL,
  FINANCIAL_STATUS_COLOR,
  PAYMENT_METHOD_LABEL,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function formatMoneyGroups(groups: Record<string, number>) {
  const entries = Object.entries(groups).filter(([, cents]) => cents > 0);
  if (entries.length === 0) return formatCurrencyByCode(0, "EUR");
  const sortedEntries = [...entries].sort(([left], [right]) => left.localeCompare(right));
  return sortedEntries
    .map(([currency, cents]) => formatCurrencyByCode(cents / 100, currency))
    .join(" · ");
}

export const metadata = { title: "Financeiro | Admin" };

export default async function AdminFinanceiroPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const financials = await db.orderFinancial.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      installments: { orderBy: { sequence: "asc" } },
      order: {
        select: {
          id: true,
          orderRef: true,
          type: true,
          status: true,
          contractCurrency: true,
          client: { select: { name: true, email: true } },
          organization: { select: { name: true } },
        },
      },
    },
  });

  const totalReceivedByCurrency = financials.reduce((acc: Record<string, number>, f: { paidCents: number; currency?: string | null }) => {
    const currency = getPersistedCurrency(f.currency);
    acc[currency] = (acc[currency] ?? 0) + f.paidCents;
    return acc;
  }, {});
  const totalPendingByCurrency = financials.reduce((acc: Record<string, number>, f: { totalAmountCents: number; paidCents: number; currency?: string | null }) => {
    const currency = getPersistedCurrency(f.currency);
    acc[currency] = (acc[currency] ?? 0) + (f.totalAmountCents - f.paidCents);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <p className="text-sm text-slate-400 mt-1">Gestão de pagamentos e parcelas por pedido</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total recebido</p>
          <p className="text-2xl font-bold text-emerald-400">{formatMoneyGroups(totalReceivedByCurrency)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Por receber</p>
          <p className="text-2xl font-bold text-yellow-400">{formatMoneyGroups(totalPendingByCurrency)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Pedidos com financeiro</p>
          <p className="text-2xl font-bold text-white">{financials.length}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Todos os pedidos com financeiro</h2>
        </div>
        {financials.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-500 text-center">
            Nenhum financeiro registado ainda. Envie uma proposta com valor estimado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-white/5">
                  <th className="px-5 py-3 text-left font-medium">Pedido</th>
                  <th className="px-5 py-3 text-left font-medium">Cliente</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Pago</th>
                  <th className="px-5 py-3 text-left font-medium">Parcelas</th>
                  <th className="px-5 py-3 text-left font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {financials.map((f: {
                  id: string;
                  orderId: string;
                  totalAmountCents: number;
                  paidCents: number;
                  currency?: string | null;
                  status: string;
                  installments: Array<{ id: string; sequence: number; amountCents: number; currency?: string | null; method: string; status: string }>;
                  order: { id: string; orderRef?: string; type: string; contractCurrency?: string | null; client: { name?: string; email: string }; organization?: { name: string } | null };
                }) => (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/2 transition">
                    {(() => {
                      const displayCurrency = getPersistedCurrency(
                        f.installments[0]?.currency,
                        f.order.contractCurrency,
                        f.currency,
                      );

                      return (
                        <>
                    <td className="px-5 py-3 text-white font-mono text-xs">
                      {f.order.orderRef ?? f.order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      <div className="text-xs font-medium">{f.order.organization?.name ?? f.order.client.name ?? "—"}</div>
                      <div className="text-slate-500 text-[11px]">{f.order.client.email}</div>
                    </td>
                    <td className="px-5 py-3 text-right text-white font-semibold">
                      {formatCurrencyByCode(f.totalAmountCents / 100, displayCurrency)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-semibold">
                      {formatCurrencyByCode(f.paidCents / 100, displayCurrency)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        {f.installments.map((inst) => (
                          <span key={inst.id} className="text-[11px] text-slate-400">
                            P{inst.sequence} · {formatCurrencyByCode(inst.amountCents / 100, getPersistedCurrency(inst.currency, f.order.contractCurrency, f.currency))} · {PAYMENT_METHOD_LABEL[inst.method] ?? inst.method} ·{" "}
                            <span className={inst.status === "PAID" ? "text-emerald-400" : "text-yellow-400"}>
                              {inst.status === "PAID" ? "Pago" : "Pendente"}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${FINANCIAL_STATUS_COLOR[f.status] ?? ""}`}>
                        {FINANCIAL_STATUS_LABEL[f.status] ?? f.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/financeiro/${f.order.id}`}
                        className="text-xs text-accent-light hover:text-accent transition"
                      >
                        Detalhes →
                      </Link>
                    </td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
