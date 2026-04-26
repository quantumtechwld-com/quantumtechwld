"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Users, Trash2, UserPlus, Package } from "lucide-react";

type Member = {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; status: string };
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  status: string;
  createdAt: string;
  members: Member[];
  _count: { orders: number };
};

type UserOption = { id: string; name: string | null; email: string | null };
type OrgRole = "ADMIN" | "MEMBER";

type Props = {
  readonly organization: Organization;
  readonly allUsers: UserOption[];
};

const PLAN_LABEL: Record<string, string> = { FREE: "Free", PRO: "Pro", ENTERPRISE: "Enterprise" };
const PLAN_COLOR: Record<string, string> = {
  FREE: "bg-slate-700 text-slate-300",
  PRO: "bg-blue-900/50 text-blue-300",
  ENTERPRISE: "bg-purple-900/50 text-purple-300",
};

export default function OrganizationDetailClient({ organization, allUsers }: Props) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<OrgRole>("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);

  const existingMemberIds = new Set(organization.members.map((m) => m.user.id));
  const availableUsers = allUsers.filter((u) => !existingMemberIds.has(u.id));

  async function handleAddMember(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUserId) { setError("Selecione um utilizador."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${organization.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao adicionar."); return; }
      setShowAddForm(false);
      setSelectedUserId("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Remover este membro da organização?")) return;
    try {
      const res = await fetch(`/api/admin/organizations/${organization.id}/members?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Erro ao remover.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro de rede.");
    }
  }

  async function handleChangeRole(userId: string, newRole: OrgRole) {
    setRoleLoading(userId);
    try {
      const res = await fetch(`/api/admin/organizations/${organization.id}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Erro ao alterar papel.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro de rede.");
    } finally {
      setRoleLoading(null);
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link href="/admin/organizations" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Organizações
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            {organization.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={organization.logo} alt={organization.name} className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              organization.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLOR[organization.plan] ?? "bg-slate-700 text-slate-300"}`}>
                {PLAN_LABEL[organization.plan] ?? organization.plan}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{organization.slug}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Users className="w-4 h-4" /> Membros</div>
          <p className="text-2xl font-bold text-white">{organization.members.length}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Package className="w-4 h-4" /> Pedidos</div>
          <p className="text-2xl font-bold text-white">{organization._count.orders}</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Building2 className="w-4 h-4" /> Status</div>
          <p className="text-sm font-semibold text-green-400">{organization.status}</p>
        </div>
      </div>

      {/* Membros */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Membros</h2>
          {availableUsers.length > 0 && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar membro
            </button>
          )}
        </div>

        {showAddForm && (
          <form onSubmit={handleAddMember} className="mb-6 p-4 bg-slate-900/60 rounded-lg space-y-3">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-50">
                <label htmlFor="member-user" className="block text-xs text-slate-400 mb-1">Utilizador</label>
                <select
                  id="member-user"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">Selecionar…</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email} {u.name ? `(${u.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="member-role" className="block text-xs text-slate-400 mb-1">Papel</label>
                <select
                  id="member-role"
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as OrgRole)}
                >
                  <option value="MEMBER">Membro</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "A adicionar..." : "Adicionar"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {organization.members.length === 0 ? (
          <p className="text-slate-500 text-sm py-4">Nenhum membro ainda.</p>
        ) : (
          <div className="space-y-2">
            {organization.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {(m.user.name ?? m.user.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{m.user.name ?? m.user.email}</p>
                    {m.user.name && <p className="text-xs text-slate-400">{m.user.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={m.role}
                    disabled={roleLoading === m.user.id}
                    onChange={(e) => handleChangeRole(m.user.id, e.target.value as OrgRole)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white disabled:opacity-50 cursor-pointer"
                    aria-label={`Papel de ${m.user.name ?? m.user.email}`}
                  >
                    <option value="MEMBER">Membro</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(m.user.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    aria-label="Remover membro"
                    title="Remover membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
