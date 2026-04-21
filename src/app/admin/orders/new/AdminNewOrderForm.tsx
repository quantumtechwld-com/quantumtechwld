"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ORDER_TYPE_LABEL, URGENCY_LABEL } from "@/lib/constants";

type ClientOption = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
};

type Props = Readonly<{
  clients: ClientOption[];
  initialClientId?: string;
}>;

const ORDER_TYPES = ["new_feature", "bug_fix", "new_project", "support", "other"] as const;
const URGENCY_OPTIONS = ["low", "normal", "high", "critical"] as const;

export function AdminNewOrderForm({ clients, initialClientId = "" }: Props) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initialClientId);
  const [type, setType] = useState<(typeof ORDER_TYPES)[number]>("new_feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<(typeof URGENCY_OPTIONS)[number]>("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Selecione um cliente.");
      return;
    }
    if (!title.trim() || title.trim().length > 120) {
      setError("Título obrigatório (máx. 120 caracteres).");
      return;
    }
    if (!description.trim()) {
      setError("A descrição é obrigatória.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          type,
          title: title.trim(),
          description: description.trim(),
          urgency,
        }),
      });
      const data = (await res.json()) as { error?: string; order?: { id: string } };
      if (!res.ok || !data.order?.id) {
        throw new Error(data.error ?? "Erro ao criar pedido para o cliente.");
      }
      router.push(`/admin/orders/${data.order.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div>
        <label htmlFor="admin-order-client" className="mb-2 block text-sm font-medium text-slate-300">
          Cliente <span className="text-red-400">*</span>
        </label>
        <select
          id="admin-order-client"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white focus:border-accent focus:outline-none"
        >
          <option value="" className="bg-gray-900">Selecione um cliente ativo</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id} className="bg-gray-900">
              {(client.company?.trim() || client.name?.trim() || client.email)}{client.email ? ` · ${client.email}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="admin-order-type" className="mb-2 block text-sm font-medium text-slate-300">
          Tipo do pedido
        </label>
        <select
          id="admin-order-type"
          value={type}
          onChange={(e) => setType(e.target.value as (typeof ORDER_TYPES)[number])}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white focus:border-accent focus:outline-none"
        >
          {ORDER_TYPES.map((value) => (
            <option key={value} value={value} className="bg-gray-900">
              {ORDER_TYPE_LABEL[value] ?? value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="admin-order-title" className="mb-2 block text-sm font-medium text-slate-300">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          id="admin-order-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Ex.: Dashboard executivo para pipeline comercial"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none"
        />
        <p className="mt-1 text-right text-[10px] text-slate-600">{title.length}/120</p>
      </div>

      <div>
        <label htmlFor="admin-order-description" className="mb-2 block text-sm font-medium text-slate-300">
          Descrição <span className="text-red-400">*</span>
        </label>
        <textarea
          id="admin-order-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Descreva claramente o escopo inicial, contexto e expectativa do pedido."
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-accent focus:outline-none resize-none"
        />
      </div>

      <div>
        <p className="mb-2 block text-sm font-medium text-slate-300">Urgência</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {URGENCY_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setUrgency(value)}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                urgency === value
                  ? "border-accent bg-accent/20 text-accent-light"
                  : "border-white/15 bg-white/5 text-slate-400 hover:bg-white/8"
              }`}
            >
              {URGENCY_LABEL[value] ?? value}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/admin/orders"
          className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
        >
          {loading ? "A criar..." : "Criar pedido"}
        </button>
      </div>
    </form>
  );
}