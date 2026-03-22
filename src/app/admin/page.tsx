import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import AdminHeader from "./components/AdminHeader";
import StatsGrid from "./components/StatsGrid";
import BriefingStats from "./components/BriefingStats";
import RecentOrdersTable from "./components/RecentOrdersTable";
import AllBriefingsTable from "./components/AllBriefingsTable";
import {
  BRIEFING_STATUS_LABEL as STATUS_LABEL,
  BRIEFING_STATUS_COLOR as STATUS_COLOR,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_TYPE_LABEL,
  PROJECT_TYPE_LABEL as PROJECT_LABEL,
} from "@/lib/constants";

function fmtEur(cents: number) {
  return (cents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
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

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  type RecentOrder = {
    id: string;
    type: string;
    status: string;
    updatedAt: Date;
    client: { name: string | null; email: string };
    payment: { status: string; amountCents: number } | null;
  };

  const [
    orderPending,
    orderInProd,
    orderCompleted,
    totalRevenue,
    monthRevenue,
    recentOrdersRaw,
  ] = await Promise.all([
    dbAny.order.count({ where: { status: { in: ["PENDING", "EVALUATING", "REVISION"] } } }),
    dbAny.order.count({ where: { status: "IN_PRODUCTION" } }),
    dbAny.order.count({ where: { status: "COMPLETED" } }),
    dbAny.payment.aggregate({ _sum: { amountCents: true }, where: { status: "PAID" } }),
    dbAny.payment.aggregate({
      _sum: { amountCents: true },
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
    }),
    dbAny.order.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      where: { status: { notIn: ["DRAFT"] } },
      include: {
        client: { select: { name: true, email: true } },
        payment: { select: { status: true, amountCents: true } },
      },
    }),
  ]);

  const recentOrders = recentOrdersRaw as RecentOrder[];
  const totalRevenueCents: number =
    (totalRevenue as { _sum: { amountCents: number | null } })._sum.amountCents ?? 0;
  const monthRevenueCents: number =
    (monthRevenue as { _sum: { amountCents: number | null } })._sum.amountCents ?? 0;

  const counts = {
    total: briefings.length,
    received: briefings.filter((b) => b.status === "RECEIVED").length,
    inProgress: briefings.filter((b) => b.status === "IN_PROGRESS").length,
    delivered: briefings.filter((b) => b.status === "DELIVERED").length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <StatsGrid
          orderPending={orderPending}
          orderInProd={orderInProd}
          orderCompleted={orderCompleted}
          totalRevenueCents={totalRevenueCents}
          monthRevenueCents={monthRevenueCents}
          fmtEur={fmtEur}
        />
        <BriefingStats counts={counts} />
        <RecentOrdersTable
          recentOrders={recentOrders}
          ORDER_TYPE_LABEL={ORDER_TYPE_LABEL}
          ORDER_STATUS_LABEL={ORDER_STATUS_LABEL}
          ORDER_STATUS_COLOR={ORDER_STATUS_COLOR}
          fmtEur={fmtEur}
        />
        <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Todos os Briefings</h2>
          </div>
          <AllBriefingsTable
            briefings={briefings}
            PROJECT_LABEL={PROJECT_LABEL}
            STATUS_LABEL={STATUS_LABEL}
            STATUS_COLOR={STATUS_COLOR}
            scopeSet={scopeSet}
          />
        </div>
      </main>
    </div>
  );
}
