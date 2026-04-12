import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ORDER_STATUS_LABEL as STATUS_LABEL,
  ORDER_STATUS_COLOR as STATUS_COLOR,
  ORDER_TYPE_LABEL,
} from "@/lib/constants";
import { ClipboardList } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const [me, orders] = await Promise.all([
    prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }),
    db.order.findMany({
      where: { client: { email: session.user.email } },
      include: {
        messages: { where: { author: { role: "ADMIN" } }, select: { id: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<unknown>,
  ]);

  const reads = me
    ? (await db.orderMessageRead.findMany({ where: { userId: me.id }, select: { orderId: true, lastReadAt: true } }) as { orderId: string; lastReadAt: Date }[])
    : [];
  const readMap = new Map<string, Date>(reads.map((r) => [r.orderId, r.lastReadAt]));

  function unreadCount(orderId: string, messages: { createdAt: Date }[]): number {
    const last = readMap.get(orderId);
    return last ? messages.filter((m) => new Date(m.createdAt) > last).length : messages.length;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <Link href="/portal" className="text-sm text-accent hover:text-accent-light transition-colors">
            ← Portal
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">Os seus pedidos</h1>
          <p className="mt-1 text-sm text-slate-400">
            Solicite novas funcionalidades, suporte ou projetos ao nosso time.
          </p>
        </div>
        <Link
          href="/portal/orders/new"
          className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          + Novo pedido
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ClipboardList size={22} className="text-white/30" />
          </div>
          <p className="text-slate-300 font-medium">Ainda não tem pedidos</p>
          <p className="mt-1 text-sm text-slate-500">
            Utilize o botão &ldquo;Novo pedido&rdquo; para solicitar algo ao nosso team.
          </p>
          <Link
            href="/portal/orders/new"
            className="mt-5 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            Criar primeiro pedido →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(orders as any[]).map((o: any) => {
            const unread = unreadCount(o.id, o.messages);
            return (
            <Link
              key={o.id}
              href={`/portal/orders/${o.id}`}
              className="group block rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:bg-white/8 hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white group-hover:text-accent-light transition-colors">
                      {ORDER_TYPE_LABEL[o.type] ?? o.type}
                    </p>
                    {o.orderRef && (
                      <span className="font-mono text-xs text-slate-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                        {o.orderRef}
                      </span>
                    )}
                    {unread > 0 && (
                      <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                        {unread} nova{unread > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{o.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status] ?? "bg-slate-500/20 text-slate-300"}`}
                >
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {new Date(o.createdAt).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}


