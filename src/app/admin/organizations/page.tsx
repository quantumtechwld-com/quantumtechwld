import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrganizationsClient from "./OrganizationsClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export default async function AdminOrganizationsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const organizations = await db.organization.findMany({
    include: {
      _count: { select: { members: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <OrganizationsClient organizations={organizations} />
    </div>
  );
}
