import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations, getLocale } from "next-intl/server";
import { PortalDashboard } from "./PortalDashboard";

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const t = await getTranslations("portal");
  const locale = await getLocale();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  // Opção C: pedidos próprios OU da empresa (se tiver org)
  const orgId = session.user.organizationId ?? null;
  const orderWhere = orgId
    ? { OR: [{ client: { email: session.user.email } }, { organizationId: orgId }], status: { notIn: ["DRAFT"] } }
    : { client: { email: session.user.email }, status: { notIn: ["DRAFT"] } };
  const countBase = orgId
    ? { OR: [{ client: { email: session.user.email } }, { organizationId: orgId }] }
    : { client: { email: session.user.email } };

  const [rawOrders, proposalSentCount, inProductionCount, inReviewCount, completedCount, rejectedCount] = await Promise.all([
    db.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, title: true, type: true, status: true, createdAt: true, orderRef: true, estimatedValue: true },
    }),
    db.order.count({ where: { ...countBase, status: "PROPOSAL_SENT" } }),
    db.order.count({ where: { ...countBase, status: "IN_PRODUCTION" } }),
    db.order.count({ where: { ...countBase, status: "IN_REVIEW" } }),
    db.order.count({ where: { ...countBase, status: "COMPLETED" } }),
    db.order.count({ where: { ...countBase, status: "REJECTED" } }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders = rawOrders.map((o: any) => ({
    ...o,
    createdAt:      (o.createdAt as Date).toISOString(),
    estimatedValue: o.estimatedValue == null ? null : Number(o.estimatedValue),
  }));

  return (
    <PortalDashboard
      tagline={t("tagline")}
      heading={t("heading")}
      userName={session.user.name}
      userEmail={session.user.email}
      locale={locale}
      allOrders={allOrders}
      counts={{ proposalSent: proposalSentCount, inProduction: inProductionCount, inReview: inReviewCount, completed: completedCount, rejected: rejectedCount }}
    />
  );
}
