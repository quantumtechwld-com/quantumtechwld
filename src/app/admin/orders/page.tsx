import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminHeader from "../components/AdminHeader";
import {
  ORDER_STATUS_LABEL as STATUS_LABEL,
  ORDER_STATUS_COLOR as STATUS_COLOR,
  ORDER_TYPE_LABEL,
  ALL_ORDER_STATUSES as ALL_STATUSES,
} from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminOrdersPage({ searchParams }: Readonly<{ searchParams: SearchParams }>) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const sp = await searchParams;
  const statusFilter = sp.status ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (statusFilter && ALL_STATUSES.includes(statusFilter)) {
    where.status = statusFilter;
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  const [orders, countsRaw, reads] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        client: { select: { name: true, email: true } },
        messages: { where: { author: { role: "CLIENT" } }, select: { id: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<unknown>,
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }) as Promise<unknown>,
    adminUser
      ? (db.orderMessageRead.findMany({ where: { userId: adminUser.id }, select: { orderId: true, lastReadAt: true } }) as Promise<unknown>)
      : Promise.resolve([]),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countMap = Object.fromEntries((countsRaw as { status: string; _count: { id: number } }[]).map((c) => [c.status, c._count.id]));
  const total = (orders as unknown[]).length;
  const readMap = new Map<string, Date>((reads as { orderId: string; lastReadAt: Date }[]).map((r) => [r.orderId, r.lastReadAt]));

  function unreadCount(orderId: string, messages: { createdAt: Date }[]): number {
    const last = readMap.get(orderId);
    return last ? messages.filter((m) => new Date(m.createdAt) > last).length : messages.length;
  }

  return (
    <>
      <AdminHeader />
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
                  ? "border-accent/50 bg-accent/10"
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
              statusFilter === ""
                ? "border-accent/50 bg-accent/20 text-accent-light"
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
                  ? "border-accent/50 bg-accent/20 text-accent-light"
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
            <p className="text-sm text-slate-500">{total} pedido{total === 1 ? "" : "s"}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {orders.map((o: any) => {
              const unread = unreadCount(o.id, o.messages);
              return (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/8 hover:border-accent/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white group-hover:text-violet-300 transition-colors">
                        {ORDER_TYPE_LABEL[o.type] ?? o.type}
                      </span>
                      {o.orderRef && (
                        <span className="font-mono text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                          {o.orderRef}
                        </span>
                      )}
                      <span className="text-slate-500 text-sm">·</span>
                      <span className="text-sm text-slate-400">{o.client.name ?? o.client.email}</span>
                      {unread > 0 && (
                        <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          {unread} nova{unread > 1 ? "s" : ""}
                        </span>
                      )}
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
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
