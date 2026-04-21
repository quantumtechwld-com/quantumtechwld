import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FINANCIAL_STATUS_LABEL,
  FINANCIAL_STATUS_COLOR,
  PAYMENT_METHOD_LABEL,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
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
          client: { select: { name: true, email: true } },
        },
      },
    },
  });

  // Totais
  const totalReceived = financials.reduce(
    (sum: number, f: { paidCents: number }) => sum + f.paidCents,
    0,
  );
  const totalPending = financials.reduce(
    (sum: number, f: { totalAmountCents: number; paidCents: number }) =>
      sum + (f.totalAmountCents - f.paidCents),
    0,
  );

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
          <p className="text-2xl font-bold text-emerald-400">{fmtEur(totalReceived)}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Por receber</p>
          <p className="text-2xl font-bold text-yellow-400">{fmtEur(totalPending)}</p>
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
                  status: string;
                  installments: Array<{ id: string; sequence: number; amountCents: number; method: string; status: string }>;
                  order: { id: string; orderRef?: string; type: string; client: { name?: string; email: string } };
                }) => (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/2 transition">
                    <td className="px-5 py-3 text-white font-mono text-xs">
                      {f.order.orderRef ?? f.order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      <div className="text-xs font-medium">{f.order.client.name ?? "—"}</div>
                      <div className="text-slate-500 text-[11px]">{f.order.client.email}</div>
                    </td>
                    <td className="px-5 py-3 text-right text-white font-semibold">
                      {fmtEur(f.totalAmountCents)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-semibold">
                      {fmtEur(f.paidCents)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        {f.installments.map((inst) => (
                          <span key={inst.id} className="text-[11px] text-slate-400">
                            P{inst.sequence} · {fmtEur(inst.amountCents)} · {PAYMENT_METHOD_LABEL[inst.method] ?? inst.method} ·{" "}
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
