import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FINANCIAL_STATUS_LABEL, FINANCIAL_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/constants";
import { InstallmentActions } from "./InstallmentActions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

type RouteParams = { params: Promise<{ orderId: string }> };

export const metadata = { title: "Detalhe Financeiro | Admin" };

export default async function AdminFinanceiroDetailPage({ params }: Readonly<RouteParams>) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const { orderId } = await params;

  const financial = await db.orderFinancial.findUnique({
    where: { orderId },
    include: {
      installments: { orderBy: { sequence: "asc" } },
      order: {
        select: {
          id: true,
          orderRef: true,
          type: true,
          status: true,
          estimatedValue: true,
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!financial) notFound();

  const progress = financial.totalAmountCents > 0
    ? Math.round((financial.paidCents / financial.totalAmountCents) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin/financeiro" className="hover:text-white transition">Financeiro</Link>
        <span>/</span>
        <span className="text-slate-300">{financial.order.orderRef ?? orderId.slice(0, 8)}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            Pedido {financial.order.orderRef ?? orderId.slice(0, 8)}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {financial.order.client.name ?? "—"} · {financial.order.client.email}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${FINANCIAL_STATUS_COLOR[financial.status as string] ?? ""}`}>
          {FINANCIAL_STATUS_LABEL[financial.status as string] ?? financial.status}
        </span>
      </div>

      {/* Resumo financeiro */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Resumo</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Total</p>
            <p className="text-lg font-bold text-white">{fmtEur(financial.totalAmountCents)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Recebido</p>
            <p className="text-lg font-bold text-emerald-400">{fmtEur(financial.paidCents)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Por receber</p>
            <p className="text-lg font-bold text-yellow-400">
              {fmtEur(financial.totalAmountCents - financial.paidCents)}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Estado do pedido: <strong className="text-white">{ORDER_STATUS_LABEL[financial.order.status as string] ?? financial.order.status}</strong></span>
          <Link href={`/admin/orders/${orderId}`} className="text-accent-light hover:text-accent transition">
            Ver pedido →
          </Link>
        </div>
      </div>

      {/* Parcelas + acções */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Parcelas</h2>
        <InstallmentActions
          orderId={orderId}
          installments={financial.installments}
        />
      </div>
    </div>
  );
}
