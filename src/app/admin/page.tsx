import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BriefingStatus } from "@prisma/client";

const STATUS_LABEL: Record<BriefingStatus, string> = {
  RECEIVED: "Recebido",
  IN_ANALYSIS: "Em Análise",
  PROPOSAL_SENT: "Proposta Enviada",
  IN_NEGOTIATION: "Em Negociação",
  APPROVED: "Aprovado",
  IN_PROGRESS: "Em Desenvolvimento",
  DELIVERED: "Entregue",
};

const STATUS_COLOR: Record<BriefingStatus, string> = {
  RECEIVED: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  IN_ANALYSIS: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  PROPOSAL_SENT: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  IN_NEGOTIATION: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  APPROVED: "bg-green-500/20 text-green-300 border border-green-500/30",
  IN_PROGRESS: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  DELIVERED: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

const PROJECT_LABEL: Record<string, string> = {
  landing_page: "Landing Page",
  ecommerce: "E-commerce",
  saas: "SaaS",
  mobile_app: "App Mobile",
  corporate_site: "Site Corporativo",
  custom: "Personalizado",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/portal");
  }

  const briefings = await prisma.briefing.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scopes = await (prisma as any).scope.findMany({
    select: { briefingId: true },
  }) as { briefingId: string }[];

  const scopeSet = new Set(scopes.map((s: { briefingId: string }) => s.briefingId));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbAny = prisma as any;
  const [orderPending, orderInProd] = await Promise.all([
    dbAny.order.count({ where: { status: { in: ["PENDING", "EVALUATING", "REVISION"] } } }),
    dbAny.order.count({ where: { status: "IN_PRODUCTION" } }),
  ]);

  const counts = {
    total: briefings.length,
    received: briefings.filter((b) => b.status === "RECEIVED").length,
    inProgress: briefings.filter((b) => b.status === "IN_PROGRESS").length,
    delivered: briefings.filter((b) => b.status === "DELIVERED").length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-semibold text-white">Admin Panel</span>
            <span className="text-white/30 text-sm">Quantum Technology</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/orders"
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Pedidos
            </Link>
            <Link
              href="/portal"
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              ← Portal do Cliente
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Stats */}
        {/* Alerta pedidos pendentes */}
        {orderPending > 0 && (
          <Link
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
          </Link>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de Briefings", value: counts.total, color: "from-violet-500 to-purple-600" },
            { label: "Novos Recebidos", value: counts.received, color: "from-blue-500 to-cyan-600" },
            { label: "Em Desenvolvimento", value: counts.inProgress, color: "from-amber-500 to-orange-600" },
            { label: "Entregues", value: counts.delivered, color: "from-emerald-500 to-green-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/8 bg-white/3 p-5"
            >
              <p className="text-sm text-white/50 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Todos os Briefings</h2>
          </div>

          {briefings.length === 0 ? (
            <div className="px-6 py-16 text-center text-white/40">
              Ainda não há briefings submetidos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Cliente</th>
                    <th className="px-6 py-3 text-left">Projecto</th>
                    <th className="px-6 py-3 text-left">Estado</th>
                    <th className="px-6 py-3 text-left">Escopo</th>
                    <th className="px-6 py-3 text-left">Data</th>
                    <th className="px-6 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {briefings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{b.user.name ?? "—"}</p>
                          <p className="text-white/40 text-xs">{b.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {PROJECT_LABEL[b.projectType] ?? b.projectType}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {scopeSet.has(b.id) ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Gerado
                          </span>
                        ) : (
                          <span className="text-white/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/40 text-xs whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/briefing/${b.id}`}
                          className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
                        >
                          Ver detalhes →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
