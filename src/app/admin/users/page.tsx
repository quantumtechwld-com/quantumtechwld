import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const users = await prisma.user.findMany({
    orderBy: [
      { role: "desc" },    // ADMIN primeiro
      { status: "asc" },   // PENDING primeiro dentro de CLIENT
    ],
    select: {
      id:            true,
      name:          true,
      email:         true,
      role:          true,
      status:        true,
      company:       true,
      emailVerified: true,
      lastLoginAt:   true,
      _count:  { select: { briefings: true, orders: true } },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
        <UsersClient users={users} />
    </main>
  );
}
