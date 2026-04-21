"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_TYPE_LABEL, URGENCY_LABEL } from "@/lib/constants";

type Order = {
  id: string;
  type: string;
  title: string | null;
  description: string | null;
  urgency: string;
};

// "contact" excluído — tipo reservado para o formulário público de contacto.
const ORDER_TYPES = ["new_feature", "bug_fix", "new_project", "support", "other"] as const;
const URGENCY_OPTIONS = ["low", "normal", "high", "critical"] as const;

export function OrderEditForm({ order }: Readonly<{ order: Order }>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>(order.type);
  const [title, setTitle] = useState(order.title ?? "");
  const [description, setDescription] = useState(order.description ?? "");
  const [urgency, setUrgency] = useState(order.urgency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleToggle() {
    setOpen((v) => !v);
    setError("");
    setSaved(false);
  }

  async function handleSave() {
    setError("");
    setSaved(false);

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
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          urgency,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erro ao atualizar pedido.");
      }
      setSaved(true);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Editar detalhes do pedido
        </h3>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-slate-400 hover:text-white transition"
        >
          {open ? "Fechar" : "Editar"}
        </button>
      </div>

      {saved && !open && (
        <p className="mt-2 text-xs text-emerald-400">Pedido atualizado com sucesso.</p>
      )}

      {open && (
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="edit-order-type" className="block text-xs font-medium text-slate-400 mb-1">
              Tipo do pedido
            </label>
            <select
              id="edit-order-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            >
              {ORDER_TYPES.map((v) => (
                <option key={v} value={v} className="bg-gray-900">
                  {ORDER_TYPE_LABEL[v] ?? v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-order-title" className="block text-xs font-medium text-slate-400 mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-order-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            />
            <p className="mt-1 text-right text-[10px] text-slate-600">{title.length}/120</p>
          </div>

          <div>
            <label htmlFor="edit-order-description" className="block text-xs font-medium text-slate-400 mb-1">
              Descrição <span className="text-red-400">*</span>
            </label>
            <textarea
              id="edit-order-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Urgência</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {URGENCY_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setUrgency(v)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    urgency === v
                      ? "border-accent bg-accent/20 text-accent-light"
                      : "border-white/15 bg-white/5 text-slate-400 hover:bg-white/8"
                  }`}
                >
                  {URGENCY_LABEL[v] ?? v}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(""); }}
              className="rounded-xl border border-white/20 px-4 py-2 text-xs text-slate-300 hover:bg-white/10 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
            >
              {loading ? "A guardar…" : "Guardar alterações"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
