"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
type UserRole   = "CLIENT"  | "ADMIN";

interface UserRow {
  id:            string;
  name:          string | null;
  email:         string | null;
  role:          UserRole;
  status:        UserStatus;
  company:       string | null;
  emailVerified: Date | string | null;
  lastLoginAt:   Date | string | null;
  _count: { briefings: number; orders: number };
}

const STATUS_LABEL: Record<UserStatus, string> = {
  PENDING:   "Aguarda Aprovação",
  ACTIVE:    "Ativo",
  SUSPENDED: "Suspenso",
};

const STATUS_COLOR: Record<UserStatus, string> = {
  PENDING:   "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ACTIVE:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  SUSPENDED: "bg-red-500/15 text-red-300 border-red-500/30",
};

const ROLE_COLOR: Record<UserRole, string> = {
  ADMIN:  "bg-violet-500/15 text-violet-300 border-violet-500/30",
  CLIENT: "bg-accent/15 text-accent-light border-accent/30",
};

export default function UsersClient({ users: initial }: Readonly<{ users: UserRow[] }>) {
  const [users, setUsers]               = useState<UserRow[]>(initial);
  const [loadingId, setLoadingId]       = useState<string | null>(null);
  const [resendingId, setResendingId]   = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteName, setInviteName]     = useState("");
  const [inviteLocale, setInviteLocale] = useState<"pt" | "en" | "es">("pt");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function patchUser(userId: string, data: { status?: string; role?: string }) {
    setLoadingId(userId);
    try {
      const res  = await fetch(`/api/admin/users/${userId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha na operação.");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...json.user } : u))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleResend(userId: string, email: string) {
    setResendingId(userId);
    try {
      const res  = await fetch("/api/admin/users/invite", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no envio.");
      alert(`Acesso reenviado para ${email}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setResendingId(null);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Excluir permanentemente o utilizador ${email}? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao excluir.");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteMsg(null);
    try {
      const res  = await fetch("/api/admin/users/invite", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: inviteEmail.trim(), name: inviteName.trim() || undefined, locale: inviteLocale }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no envio.");
      setInviteMsg({ type: "ok", text: `Convite enviado para ${inviteEmail.trim()} (${inviteLocale.toUpperCase()})` });
      setInviteEmail("");
      setInviteName("");
    } catch (err) {
      setInviteMsg({ type: "err", text: err instanceof Error ? err.message : "Erro inesperado." });
    } finally {
      setInviteLoading(false);
    }
  }

  const pending = users.filter((u) => u.status === "PENDING");
  const rest    = users.filter((u) => u.status !== "PENDING");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Gestão de Utilizadores</h1>
        <p className="text-sm text-white/40 mt-1">Aprove clientes, altere roles e envie convites.</p>
      </div>

      {/* Contas pendentes de aprovação */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-3">
            <span className="inline-flex items-center gap-1.5"><Clock size={13} />Aguardam Aprovação ({pending.length})</span>
          </h2>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
            <UserTable
              users={pending}
              loadingId={loadingId}
              resendingId={resendingId}
              deletingId={deletingId}
              onStatus={(id, s) => patchUser(id, { status: s })}
              onRole={(id, r)   => patchUser(id, { role:   r })}
              onResend={handleResend}
              onDelete={handleDelete}
            />
          </div>
        </section>
      )}

      {/* Todos os outros utilizadores */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-3">
          Todos os Utilizadores ({rest.length})
        </h2>
        <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
          <UserTable
            users={rest}
            loadingId={loadingId}
            resendingId={resendingId}
            deletingId={deletingId}
            onStatus={(id, s) => patchUser(id, { status: s })}
            onRole={(id, r)   => patchUser(id, { role:   r })}
            onResend={handleResend}
            onDelete={handleDelete}
          />
        </div>
      </section>

      {/* Formulário de convite */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-3">
          Enviar Convite
        </h2>
        <div className="rounded-xl border border-white/8 bg-white/3 p-6">
          <p className="text-sm text-white/50 mb-4">
            Cria a conta com status <strong>Ativo</strong> e envia um link de acesso direto por email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome (opcional)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
            />
            <input
              type="email"
              placeholder="email@cliente.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
            />
            <select
              value={inviteLocale}
              onChange={(e) => setInviteLocale(e.target.value as "pt" | "en" | "es")}
              aria-label="Idioma do convite"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="pt">🇧🇷 Português</option>
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviteLoading || !inviteEmail.trim()}
              className="rounded-lg bg-accent-dim hover:bg-accent disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap"
            >
              {inviteLoading ? "A enviar…" : "Enviar Convite →"}
            </button>
          </div>
          {inviteMsg && (
            <p className={`mt-3 text-sm rounded-lg px-4 py-2 border ${
              inviteMsg.type === "ok"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-red-500/10 text-red-300 border-red-500/30"
            }`}>
              {inviteMsg.text}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Sub-componente tabela ────────────────────────────────────────────────────

function UserTable({
  users,
  loadingId,
  resendingId,
  deletingId,
  onStatus,
  onRole,
  onResend,
  onDelete,
}: Readonly<{
  users:       UserRow[];
  loadingId:   string | null;
  resendingId: string | null;
  deletingId:  string | null;
  onStatus:    (id: string, status: UserStatus) => void;
  onRole:      (id: string, role:   UserRole)   => void;
  onResend:    (id: string, email:  string)     => void;
  onDelete:    (id: string, email:  string)     => void;
}>) {
  if (users.length === 0) {
    return (
      <p className="px-6 py-8 text-center text-sm text-white/30">
        Sem utilizadores nesta categoria.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wide">
            <th className="px-5 py-3 text-left">Utilizador</th>
            <th className="px-5 py-3 text-left">Status</th>
            <th className="px-5 py-3 text-left">Role</th>
            <th className="px-5 py-3 text-center">Briefings / Pedidos</th>
            <th className="px-5 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const busy      = loadingId === u.id;
            const resending = resendingId === u.id;
            const deleting  = deletingId === u.id;
            return (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{u.name ?? <span className="text-white/30 italic">sem nome</span>}</p>
                  <p className="text-white/40 text-xs mt-0.5">{u.email}</p>
                  {u.company && <p className="text-white/30 text-xs">{u.company}</p>}
                  {(() => {
                    const accessDate = u.lastLoginAt ?? u.emailVerified;
                    if (accessDate) {
                      const d = new Date(accessDate);
                      const label = u.lastLoginAt ? "Último acesso" : "Acessou em";
                      return <p className="text-emerald-400 text-xs mt-1">✓ {label} {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })} {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>;
                    }
                    return <p className="text-amber-400/70 text-xs mt-1">⏳ Nunca acessou</p>;
                  })()}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[u.status]}`}>
                    {STATUS_LABEL[u.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-center text-white/50">
                  {u._count.briefings} / {u._count.orders}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {/* Ações de status */}
                    {u.status !== "ACTIVE" && (
                      <ActionBtn
                        label="Aprovar"
                        color="emerald"
                        busy={busy}
                        onClick={() => onStatus(u.id, "ACTIVE")}
                      />
                    )}
                    {u.status !== "PENDING" && (
                      <ActionBtn
                        label="Pendente"
                        color="amber"
                        busy={busy}
                        onClick={() => onStatus(u.id, "PENDING")}
                      />
                    )}
                    {u.status !== "SUSPENDED" && (
                      <ActionBtn
                        label="Suspender"
                        color="red"
                        busy={busy}
                        onClick={() => onStatus(u.id, "SUSPENDED")}
                      />
                    )}
                    {/* Ação de role */}
                    {u.role === "CLIENT" && (
                      <ActionBtn
                        label="→ ADMIN"
                        color="violet"
                        busy={busy}
                        onClick={() => onRole(u.id, "ADMIN")}
                      />
                    )}
                    {u.role === "ADMIN" && (
                      <ActionBtn
                        label="→ CLIENT"
                        color="sky"
                        busy={busy}
                        onClick={() => onRole(u.id, "CLIENT")}
                      />
                    )}
                    {u.email && (
                      <ActionBtn
                        label={resending ? "A enviar…" : "✉ Reenviar Acesso"}
                        color="sky"
                        busy={resending}
                        onClick={() => onResend(u.id, u.email!)}
                      />
                    )}
                    <ActionBtn
                      label={deleting ? "A excluir…" : "✕ Excluir"}
                      color="red"
                      busy={deleting}
                      onClick={() => onDelete(u.id, u.email ?? u.id)}
                    />
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtn({
  label,
  color,
  busy,
  onClick,
}: Readonly<{
  label:   string;
  color:   "emerald" | "amber" | "red" | "violet" | "sky";
  busy:    boolean;
  onClick: () => void;
}>) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15",
    amber:   "border-amber-500/30   text-amber-300   hover:bg-amber-500/15",
    red:     "border-red-500/30     text-red-300     hover:bg-red-500/15",
    violet:  "border-violet-500/30  text-violet-300  hover:bg-violet-500/15",
    sky:     "border-accent/30     text-accent-light     hover:bg-accent/15",
  };
  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${colors[color]}`}
    >
      {busy ? "…" : label}
    </button>
  );
}
