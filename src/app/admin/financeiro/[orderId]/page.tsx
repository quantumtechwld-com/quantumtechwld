import { auth } from "@/auth";
import { redirect } from "next/navigation";
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
          organization: { select: { name: true } },
        },
      },
    },
  });

  // Sem OrderFinancial — mostrar UI clara em vez de 404
  if (!financial) {
    // Tentar buscar o pedido para dar contexto
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderRef: true,
        status: true,
        estimatedValue: true,
        client: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });

    return (
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/admin/financeiro" className="hover:text-white transition">Financeiro</Link>
          <span>/</span>
          <span className="text-slate-300">{order?.orderRef ?? orderId.slice(0, 8)}</span>
        </nav>
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-8 text-center space-y-3">
          <p className="text-4xl">💳</p>
          <h2 className="text-lg font-semibold text-yellow-300">Sem registo financeiro</h2>
          {order ? (
            <p className="text-sm text-slate-400">
              O pedido <span className="text-white font-mono">{order.orderRef ?? orderId.slice(0, 8)}</span> de{" "}
              <span className="text-white">{order.organization?.name ?? order.client.name ?? order.client.email}</span>{" "}
              não tem financeiro associado.{" "}
              {order.status === "PROPOSAL_SENT" || order.status === "APPROVED"
                ? "O financeiro é criado automaticamente quando a proposta é enviada com valor definido. Re-envie a proposta para gerar o registo."
                : "Apenas propostas com valor estimado criam registo financeiro."}
            </p>
          ) : (
            <p className="text-sm text-slate-400">Pedido não encontrado. O ID pode estar incorreto.</p>
          )}
          <div className="flex justify-center gap-3 pt-2">
            {order && (
              <Link
                href={`/admin/orders/${order.id}`}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8"
              >
                ← Ver pedido
              </Link>
            )}
            <Link
              href="/admin/financeiro"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8"
            >
              Lista financeiro
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            {financial.order.organization?.name ?? financial.order.client.name ?? "—"} · {financial.order.client.email}
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
          installments={financial.installments.map((inst: {
            id: string;
            sequence: number;
            amountCents: number;
            method: string;
            status: string;
            paidAt: Date | null;
            dueDate: Date | null;
            notes: string | null;
          }) => ({
            ...inst,
            // Serializar Date → ISO string antes de cruzar a fronteira Server→Client.
            // Next.js App Router não serializa objetos Date automaticamente;
            // passar Date cru causa "Application error" no lado cliente.
            paidAt:  inst.paidAt  ? inst.paidAt.toISOString()  : null,
            dueDate: inst.dueDate ? inst.dueDate.toISOString() : null,
          }))}
        />
      </div>
    </div>
  );
}
