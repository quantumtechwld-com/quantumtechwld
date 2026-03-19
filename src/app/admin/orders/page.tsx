import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const STATUS_LABEL: Record<string, string> = {
  DRAFT:          "Rascunho",
  PENDING:        "Pendente",
  EVALUATING:     "Em análise",
  PROPOSAL_SENT:  "Proposta enviada",
  APPROVED:       "Aprovado",
  REVISION:       "Revisão",
  REJECTED:       "Recusado",
  IN_PRODUCTION:  "Em produção",
  COMPLETED:      "Concluído",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT:          "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  PENDING:        "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  EVALUATING:     "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  PROPOSAL_SENT:  "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  APPROVED:       "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  REVISION:       "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  REJECTED:       "bg-red-500/20 text-red-300 border border-red-500/30",
  IN_PRODUCTION:  "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  COMPLETED:      "bg-green-500/20 text-green-300 border border-green-500/30",
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  new_feature:  "Nova funcionalidade",
  bug_fix:      "Correção de bug",
  new_project:  "Novo projeto",
  support:      "Suporte",
  other:        "Outro",
};

const ALL_STATUSES = [
  "PENDING", "EVALUATING", "PROPOSAL_SENT", "APPROVED",
  "REVISION", "REJECTED", "IN_PRODUCTION", "COMPLETED",
];

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/portal");

  const sp = await searchParams;
  const statusFilter = sp.status ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (statusFilter && ALL_STATUSES.includes(statusFilter)) {
    where.status = statusFilter;
  }

  const orders = await db.order.findMany({
    where,
    include: { client: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts = await db.order.groupBy({
    by: ["status"],
    _count: { id: true },
  }) as { status: string; _count: { id: number } }[];

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
  const total = orders.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-gray-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold">
              A
            </div>
            <span className="font-semibold">Admin Panel</span>
            <span className="text-white/30 text-sm">·</span>
            <span className="text-white/50 text-sm">Pedidos</span>
          </div>
          <div className="flex h-8 gap-2">
            <Link href="/admin" className="text-sm text-white/50 hover:text-white/80 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Stats strip */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Todos",        value: Object.values(countMap).reduce((a, b) => a + b, 0), filter: "" },
            { label: "Pendentes",    value: (countMap["PENDING"] ?? 0) + (countMap["EVALUATING"] ?? 0), filter: "PENDING" },
            { label: "Em produção",  value: countMap["IN_PRODUCTION"] ?? 0, filter: "IN_PRODUCTION" },
            { label: "Concluídos",   value: countMap["COMPLETED"] ?? 0, filter: "COMPLETED" },
          ].map((s) => (
            <Link
              key={s.filter}
              href={s.filter ? `/admin/orders?status=${s.filter}` : "/admin/orders"}
              className={`rounded-2xl border p-4 text-center transition ${
                statusFilter === s.filter
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              }`}
            >
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              !statusFilter
                ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
                : "border-white/15 text-slate-400 hover:bg-white/5"
            }`}
          >
            Todos ({Object.values(countMap).reduce((a, b) => a + b, 0)})
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                statusFilter === s
                  ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
                  : "border-white/15 text-slate-400 hover:bg-white/5"
              }`}
            >
              {STATUS_LABEL[s]} {countMap[s] ? `(${countMap[s]})` : ""}
            </Link>
          ))}
        </div>

        {/* Orders table */}
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            Nenhum pedido encontrado{statusFilter ? ` com estado "${STATUS_LABEL[statusFilter]}"` : ""}.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">{total} pedido{total !== 1 ? "s" : ""}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {orders.map((o: any) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/8 hover:border-violet-500/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white group-hover:text-violet-300 transition-colors">
                      {ORDER_TYPE_LABEL[o.type] ?? o.type}
                    </span>
                    <span className="text-slate-500 text-sm">·</span>
                    <span className="text-sm text-slate-400">{o.client.name ?? o.client.email}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 truncate">{o.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status] ?? "bg-slate-500/20 text-slate-300"}`}
                  >
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                  <span className="text-xs text-slate-600">
                    {new Date(o.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
