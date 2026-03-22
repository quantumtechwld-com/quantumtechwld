type StatsGridProps = Readonly<{
  orderPending: number;
  orderInProd: number;
  orderCompleted: number;
  totalRevenueCents: number;
  monthRevenueCents: number;
  fmtEur: (cents: number) => string;
}>;

export default function StatsGrid({ orderPending, orderInProd, orderCompleted, totalRevenueCents, monthRevenueCents, fmtEur }: StatsGridProps) {
  return (
    <div className="space-y-4">
      {/* Alerta pedidos pendentes */}
      {orderPending > 0 && (
        <a
          href="/admin/orders?status=PENDING"
          className="flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 hover:bg-orange-500/15 transition"
        >
          <span className="text-lg">⏳</span>
          <span>
            <strong>{orderPending}</strong> pedido{orderPending === 1 ? "" : "s"} a aguardar resposta
            {orderInProd > 0 && (
              <span className="ml-3 text-purple-300">
                · <strong>{orderInProd}</strong> em produção
              </span>
            )}
          </span>
          <span className="ml-auto text-xs opacity-70">Ver pedidos →</span>
        </a>
      )}
      {/* Receita */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Receita total</p>
          <p className="text-3xl font-bold text-emerald-300">{fmtEur(totalRevenueCents)}</p>
          <p className="text-xs text-slate-500 mt-1">pagamentos confirmados</p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-xs text-cyan-400/70 uppercase tracking-wider mb-1">
            {new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          </p>
          <p className="text-3xl font-bold text-cyan-300">{fmtEur(monthRevenueCents)}</p>
          <p className="text-xs text-slate-500 mt-1">receita este mês</p>
        </div>
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
          <p className="text-xs text-purple-400/70 uppercase tracking-wider mb-1">Em produção</p>
          <p className="text-3xl font-bold text-purple-300">{orderInProd}</p>
          <p className="text-xs text-slate-500 mt-1">
            {orderCompleted === 1 ? "1 concluído" : `${orderCompleted} concluídos`}
          </p>
        </div>
      </div>
    </div>
  );
}
