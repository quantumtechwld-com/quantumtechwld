import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import OrganizationDetailClient from "./OrganizationDetailClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type PageProps = { readonly params: Promise<{ id: string }> };

export default async function AdminOrganizationDetailPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const { id } = await params;

  const org = await db.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, status: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!org) notFound();

  // Carregar utilizadores disponíveis para adicionar
  const allUsers = await prisma.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <OrganizationDetailClient organization={org} allUsers={allUsers} />
    </div>
  );
}
