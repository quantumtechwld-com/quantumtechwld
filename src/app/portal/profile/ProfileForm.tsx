"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name:    string | null;
  email:   string | null;
  phone:   string | null;
  company: string | null;
};

export function ProfileForm({ user }: Readonly<{ user: User }>) {
  const router  = useRouter();
  const [name,    setName]    = useState(user.name    ?? "");
  const [phone,   setPhone]   = useState(user.phone   ?? "");
  const [company, setCompany] = useState(user.company ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, phone, company }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erro ao guardar perfil.");
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {/* Email — read only */}
      <div>
        <p className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</p>
        <div className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-slate-400 text-sm">
          {user.email}
        </div>
        <p className="mt-1 text-xs text-slate-600">O e-mail não pode ser alterado.</p>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-1.5">Nome completo</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="O seu nome"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Company */}
      <div>
        <label htmlFor="profile-company" className="block text-sm font-medium text-slate-300 mb-1.5">Empresa</label>
        <input
          id="profile-company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Nome da empresa (opcional)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-300 mb-1.5">Telefone</label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+351 912 345 678 (opcional)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Perfil actualizado com sucesso.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
        >
          {loading ? "A guardar…" : "Guardar alterações"}
        </button>
      </div>
    </form>
  );
}
