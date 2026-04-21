import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminNewOrderForm } from "./AdminNewOrderForm";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminNewOrderPage({ searchParams }: Readonly<{ searchParams: SearchParams }>) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const sp = await searchParams;
  const initialClientId = sp.clientId ?? "";

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", status: "ACTIVE", email: { not: null } },
    orderBy: [
      { company: "asc" },
      { name: "asc" },
      { email: "asc" },
    ],
    select: { id: true, name: true, email: true, company: true },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-10">
        <Link href="/admin/orders" className="text-sm text-accent hover:text-accent-light transition-colors">
          ← Pedidos
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-white">Novo pedido para cliente</h1>
        <p className="mt-1 text-sm text-slate-400">Crie um pedido em nome de um cliente ativo mantendo o mesmo lifecycle do portal.</p>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
        <AdminNewOrderForm clients={clients} initialClientId={initialClientId} />
      </div>
    </main>
  );
}