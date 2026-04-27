import { Clock } from "lucide-react";
import Link from "next/link";

type StatsGridProps = Readonly<{
  orderPending: number;
  orderProposalSent: number;
  orderApproved: number;
  orderInProd: number;
  orderCompleted: number;
  orderRejected: number;
  totalRevenueLabel: string;
  monthRevenueLabel: string;
  monthLabel: string;
  hideRevenue?: boolean;
}>;

const STATUS_ITEMS = (props: StatsGridProps) => [
  { label: "Aguardam resposta", value: props.orderPending, color: "text-orange-300", dot: "bg-orange-400" },
  { label: "Proposta enviada", value: props.orderProposalSent, color: "text-yellow-300", dot: "bg-yellow-400" },
  { label: "Aprovados", value: props.orderApproved, color: "text-sky-300", dot: "bg-sky-400" },
  { label: "Em produção", value: props.orderInProd, color: "text-accent-light", dot: "bg-accent" },
  { label: "Concluídos", value: props.orderCompleted, color: "text-emerald-300", dot: "bg-emerald-500" },
  { label: "Recusados", value: props.orderRejected, color: "text-red-400", dot: "bg-red-500" },
];

export default function StatsGrid(props: StatsGridProps) {
  const { orderPending, totalRevenueLabel, monthRevenueLabel, monthLabel, hideRevenue } = props;
  const statusItems = STATUS_ITEMS(props);

  return (
    <div className="space-y-3">
      {/* Alerta pedidos pendentes */}
      {orderPending > 0 && (
        <Link
          href="/admin/orders?status=PENDING"
          className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 hover:bg-orange-500/15 transition"
        >
          <Clock size={16} className="shrink-0" />
          <span>
            <strong>{orderPending}</strong> pedido{orderPending === 1 ? "" : "s"} a aguardar resposta
          </span>
          <span className="ml-auto text-xs opacity-70">Ver pedidos →</span>
        </Link>
      )}

      {/* Receita — apenas ADMIN */}
      {!hideRevenue && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Receita total</p>
            <p className="text-2xl font-bold text-emerald-300">{totalRevenueLabel}</p>
            <p className="text-xs text-slate-500 mt-0.5">pagamentos confirmados</p>
          </div>
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-xs text-accent/70 uppercase tracking-wider mb-1">
              {monthLabel}
            </p>
            <p className="text-2xl font-bold text-accent-light">{monthRevenueLabel}</p>
            <p className="text-xs text-slate-500 mt-0.5">receita este mês</p>
          </div>
        </div>
      )}

      {/* Estado dos pedidos */}
      <div className="grid grid-cols-6 gap-2">
        {statusItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/8 bg-white/3 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
              <p className="text-xs text-white/50 leading-tight">{item.label}</p>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

