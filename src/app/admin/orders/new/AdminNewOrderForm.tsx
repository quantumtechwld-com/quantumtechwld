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
  const [sendProposal, setSendProposal] = useState(false);
  const [productionInfo, setProductionInfo] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [adminNote, setAdminNote] = useState("");
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

    if (sendProposal) {
      if (!productionInfo.trim()) {
        setError("Informações de produção são obrigatórias para enviar proposta.");
        return;
      }
      const val = Number.parseFloat(estimatedValue);
      if (!estimatedValue || Number.isNaN(val) || val < 0) {
        setError("Valor estimado inválido.");
        return;
      }
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
          ...(sendProposal ? {
            productionInfo: productionInfo.trim(),
            estimatedValue: Number.parseFloat(estimatedValue),
            adminNote: adminNote.trim() || undefined,
          } : {}),
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

  function getSubmitLabel() {
    if (loading) return "A criar...";
    if (sendProposal) return "Criar e enviar proposta";
    return "Criar pedido";
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

      {/* Proposta opcional */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            id="send-proposal-toggle"
            type="checkbox"
            checked={sendProposal}
            onChange={(e) => setSendProposal(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-violet-500"
          />
          <span className="text-sm font-medium text-slate-200">Enviar proposta ao cliente agora</span>
        </label>
        <p className="mt-1 ml-7 text-xs text-slate-500">
          Se preenchida, o pedido é criado directamente em &quot;Proposta enviada&quot; e o cliente recebe email.
        </p>

        {sendProposal && (
          <div className="mt-4 grid gap-4">
            <div>
              <label htmlFor="admin-production-info" className="block text-xs font-medium text-slate-400 mb-1">
                Informações de produção <span className="text-red-400">*</span>
              </label>
              <textarea
                id="admin-production-info"
                value={productionInfo}
                onChange={(e) => setProductionInfo(e.target.value)}
                rows={4}
                placeholder="Detalhe o que será feito, prazo estimado, tecnologias envolvidas…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label htmlFor="admin-estimated-value" className="block text-xs font-medium text-slate-400 mb-1">
                Valor estimado (€) <span className="text-red-400">*</span>
              </label>
              <input
                id="admin-estimated-value"
                type="number"
                min="0"
                step="0.01"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="admin-note" className="block text-xs font-medium text-slate-400 mb-1">
                Nota adicional (opcional)
              </label>
              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Observações, condicionantes, perguntas ao cliente…"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
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
          {getSubmitLabel()}
        </button>
      </div>
    </form>
  );
}