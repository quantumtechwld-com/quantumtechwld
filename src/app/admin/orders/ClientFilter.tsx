"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Client {
  id: string;
  name: string | null;
  email: string;
  organization: { name: string } | null;
}

interface Props {
  clients: Client[];
  currentClientId: string;
}

function clientLabel(c: Client): string {
  if (c.organization) return `🏢 ${c.organization.name} — ${c.name ?? c.email}`;
  return c.name ? `${c.name} (${c.email})` : c.email;
}

function ClientFilterInner({ clients, currentClientId }: Readonly<Props>) {
  const router = useRouter();
  const sp = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString());
    if (e.target.value) {
      params.set("client", e.target.value);
    } else {
      params.delete("client");
    }
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <select
      value={currentClientId}
      onChange={handleChange}
      className="rounded-xl border border-white/15 bg-[#0f0f1a] px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
    >
      <option value="">Todos os clientes</option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>
          {clientLabel(c)}
        </option>
      ))}
    </select>
  );
}

export function ClientFilter(props: Readonly<Props>) {
  return (
    <Suspense>
      <ClientFilterInner {...props} />
    </Suspense>
  );
}
