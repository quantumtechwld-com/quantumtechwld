import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const [users, organizations] = await Promise.all([
    prisma.user.findMany({
      orderBy: [
        { role: "desc" },    // ADMIN primeiro
        { status: "asc" },   // PENDING primeiro dentro de CLIENT
      ],
      select: {
        id:            true,
        name:          true,
        email:         true,
        image:         true,
        role:          true,
        status:        true,
        company:       true,
        emailVerified: true,
        lastLoginAt:   true,
        _count:  { select: { briefings: true, orders: true, createdOrders: true } },
      },
    }),
    db.organization.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
        <UsersClient users={users} organizations={organizations} />
    </div>
  );
}
