"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, Users, Package } from "lucide-react";
import { useRouter } from "next/navigation";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  status: string;
  createdAt: string;
  _count: { members: number; orders: number };
};

type Props = {
  readonly organizations: Organization[];
};

function toSlug(val: string) {
  return val.toLowerCase().replaceAll(" ", "-").replaceAll(/[^a-z0-9-]/g, "");
}

const PLAN_LABEL: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const PLAN_COLOR: Record<string, string> = {
  FREE: "bg-slate-700 text-slate-300",
  PRO: "bg-blue-900/50 text-blue-300",
  ENTERPRISE: "bg-purple-900/50 text-purple-300",
};

export default function OrganizationsClient({ organizations }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName]   = useState("");
  const [slug, setSlug]   = useState("");
  const [plan, setPlan]   = useState("FREE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) { setError("Nome e slug são obrigatórios."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), plan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar."); return; }
      setShowForm(false);
      setName(""); setSlug(""); setPlan("FREE");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Organizações</h1>
            <p className="text-sm text-slate-400 mt-0.5">Gestão de empresas e membros</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova organização
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-white font-semibold mb-2">Criar nova organização</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="org-name" className="block text-xs text-slate-400 mb-1">Nome</label>
              <input
                id="org-name"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                value={name}
                onChange={(e) => { setName(e.target.value); setSlug(toSlug(e.target.value)); }}
                placeholder="Acme Corp"
                required
              />
            </div>
            <div>
              <label htmlFor="org-slug" className="block text-xs text-slate-400 mb-1">Slug (único)</label>
              <input
                id="org-slug"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-mono"
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="acme-corp"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="org-plan" className="block text-xs text-slate-400 mb-1">Plano</label>
            <select
              id="org-plan"
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="FREE">Free</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "A criar..." : "Criar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {organizations.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma organização criada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/admin/organizations/${org.id}`}
              className="block bg-slate-800/60 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-indigo-400 font-bold text-lg">
                  {org.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    org.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLOR[org.plan] ?? "bg-slate-700 text-slate-300"}`}>
                  {PLAN_LABEL[org.plan] ?? org.plan}
                </span>
              </div>
              <h3 className="text-white font-semibold group-hover:text-indigo-300 transition-colors">{org.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{org.slug}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {org._count.members} {org._count.members === 1 ? "membro" : "membros"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {org._count.orders} pedidos
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
