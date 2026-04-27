import { formatCurrencyByCode } from "@/lib/currency";
import Link from "next/link";

export type RecentOrder = {
  id: string;
  type: string;
  status: string;
  updatedAt: Date;
  client: { name: string | null; email: string };
  organization: { name: string } | null;
  payment: { status: string; amountCents: number; currency?: string | null } | null;
};

type RecentOrdersTableProps = Readonly<{
  recentOrders: RecentOrder[];
  ORDER_TYPE_LABEL: Record<string, string>;
  ORDER_STATUS_LABEL: Record<string, string>;
  ORDER_STATUS_COLOR: Record<string, string>;
}>;

export default function RecentOrdersTable({ recentOrders, ORDER_TYPE_LABEL, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR }: RecentOrdersTableProps) {
  if (recentOrders.length === 0) return null;
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-semibold text-white">Últimos pedidos</h2>
        <Link
          href="/admin/orders"
          className="text-xs text-accent hover:text-accent-light transition-colors"
        >
          Ver todos →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Pagamento</th>
              <th className="px-6 py-3 text-left">Atualizado</th>
              <th className="px-6 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-white/2 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{o.organization?.name ?? o.client.name ?? "—"}</p>
                  <p className="text-white/40 text-xs">{o.client.email}</p>
                </td>
                <td className="px-6 py-4 text-white/70">
                  {ORDER_TYPE_LABEL[o.type] ?? o.type}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ORDER_STATUS_COLOR[o.status] ?? "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    if (o.payment?.status === "PAID") {
                      return (
                        <span className="text-emerald-300 text-xs font-medium">
                          {formatCurrencyByCode(o.payment.amountCents / 100, o.payment.currency ?? "EUR")} ✓
                        </span>
                      );
                    }
                    if (o.payment?.status === "PENDING") {
                      return <span className="text-yellow-300/70 text-xs">Pendente</span>;
                    }
                    return <span className="text-white/30 text-xs">—</span>;
                  })()}
                </td>
                <td className="px-6 py-4 text-white/40 text-xs whitespace-nowrap">
                  {new Date(o.updatedAt).toLocaleDateString("pt-PT", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-accent hover:text-accent-light text-xs font-medium transition-colors"
                  >
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
