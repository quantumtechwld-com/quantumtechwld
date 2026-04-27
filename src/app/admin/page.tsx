import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import StatsGrid from "./components/StatsGrid";
import BriefingStats from "./components/BriefingStats";
import RecentOrdersTable from "./components/RecentOrdersTable";
import AllBriefingsTable from "./components/AllBriefingsTable";
import Link from "next/link";
import { Users, Package, FileText, BookOpen } from "lucide-react";
import { formatCurrencyByCode } from "@/lib/currency";
import {
  BRIEFING_STATUS_LABEL as STATUS_LABEL,
  BRIEFING_STATUS_COLOR as STATUS_COLOR,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_TYPE_LABEL,
  PROJECT_TYPE_LABEL as PROJECT_LABEL,
} from "@/lib/constants";

function formatMoneyGroups(groups: Record<string, number>) {
  const entries = Object.entries(groups).filter(([, cents]) => cents > 0);
  if (entries.length === 0) return formatCurrencyByCode(0, "EUR");
  return [...entries]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, cents]) => formatCurrencyByCode(cents / 100, currency))
    .join(" · ");
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "ADMIN" && role !== "DEVELOPER") {
    redirect("/portal");
  }

  const isAdmin = role === "ADMIN";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbAny = prisma as any;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthLabel = startOfMonth.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  type RecentOrder = {
    id: string;
    type: string;
    status: string;
    updatedAt: Date;
    client: { name: string | null; email: string };
    organization: { name: string } | null;
    payment: { status: string; amountCents: number; currency?: string | null } | null;
  };

  // Todas as queries em paralelo — reduz latência no dashboard admin
  const [
    briefings,
    scopesRaw,
    orderPending,
    orderProposalSent,
    orderApproved,
    orderInProd,
    orderCompleted,
    orderRejected,
    paidPayments,
    recentOrdersRaw,
  ] = await Promise.all([
    prisma.briefing.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
    dbAny.scope.findMany({ select: { briefingId: true } }),
    dbAny.order.count({ where: { status: { in: ["PENDING", "EVALUATING", "REVISION"] } } }),
    dbAny.order.count({ where: { status: "PROPOSAL_SENT" } }),
    dbAny.order.count({ where: { status: "APPROVED" } }),
    dbAny.order.count({ where: { status: "IN_PRODUCTION" } }),
    dbAny.order.count({ where: { status: "COMPLETED" } }),
    dbAny.order.count({ where: { status: "REJECTED" } }),
    dbAny.payment.findMany({
      where: { status: "PAID" },
      select: { amountCents: true, currency: true, paidAt: true },
    }),
    dbAny.order.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      where: { status: { notIn: ["DRAFT"] } },
      include: {
        client: { select: { name: true, email: true } },
        organization: { select: { name: true } },
        payment: { select: { status: true, amountCents: true, currency: true } },
      },
    }),
  ]);

  const scopeSet = new Set((scopesRaw as { briefingId: string }[]).map((s) => s.briefingId));

  const recentOrders = recentOrdersRaw as RecentOrder[];
  const revenueByCurrency = (paidPayments as Array<{ amountCents: number; currency?: string | null; paidAt?: Date | null }>).reduce((acc: Record<string, number>, payment) => {
    const currency = payment.currency ?? "EUR";
    acc[currency] = (acc[currency] ?? 0) + payment.amountCents;
    return acc;
  }, {});
  const monthRevenueByCurrency = (paidPayments as Array<{ amountCents: number; currency?: string | null; paidAt?: Date | null }>).reduce((acc: Record<string, number>, payment) => {
    if (!payment.paidAt || payment.paidAt < startOfMonth) return acc;
    const currency = payment.currency ?? "EUR";
    acc[currency] = (acc[currency] ?? 0) + payment.amountCents;
    return acc;
  }, {});

  const counts = {
    total: briefings.length,
    received: briefings.filter((b) => b.status === "RECEIVED").length,
    inProgress: briefings.filter((b) => b.status === "IN_PROGRESS").length,
    delivered: briefings.filter((b) => b.status === "DELIVERED").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* Navegação rápida */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {isAdmin && (
            <Link href="/admin/users" className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 hover:bg-accent/10 transition group">
              <Users size={18} className="text-accent-light group-hover:text-accent shrink-0" />
              <span className="text-sm font-medium text-accent-light group-hover:text-accent">Utilizadores</span>
            </Link>
          )}
          <Link href="/admin/orders" className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 hover:bg-accent/10 transition group">
            <Package size={18} className="text-accent-light group-hover:text-accent shrink-0" />
            <span className="text-sm font-medium text-accent-light group-hover:text-accent">Pedidos</span>
          </Link>
          <Link href="/admin/briefing" className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 hover:bg-accent/10 transition group">
            <FileText size={18} className="text-accent-light group-hover:text-accent shrink-0" />
            <span className="text-sm font-medium text-accent-light group-hover:text-accent">Briefings</span>
          </Link>
          <Link href="/admin/biblioteca" className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 hover:bg-accent/10 transition group">
            <BookOpen size={18} className="text-accent-light group-hover:text-accent shrink-0" />
            <span className="text-sm font-medium text-accent-light group-hover:text-accent">Biblioteca</span>
          </Link>
        </div>

        <StatsGrid
          orderPending={orderPending}
          orderProposalSent={orderProposalSent}
          orderApproved={orderApproved}
          orderInProd={orderInProd}
          orderCompleted={orderCompleted}
          orderRejected={orderRejected}
          totalRevenueLabel={formatMoneyGroups(revenueByCurrency)}
          monthRevenueLabel={formatMoneyGroups(monthRevenueByCurrency)}
          monthLabel={monthLabel}
          hideRevenue={!isAdmin}
        />
        <BriefingStats counts={counts} />
        <RecentOrdersTable
          recentOrders={recentOrders}
          ORDER_TYPE_LABEL={ORDER_TYPE_LABEL}
          ORDER_STATUS_LABEL={ORDER_STATUS_LABEL}
          ORDER_STATUS_COLOR={ORDER_STATUS_COLOR}
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
    </div>
  );
}
