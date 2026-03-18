"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BriefingStatus } from "@prisma/client";

type Props = Readonly<{
  briefingId: string;
  currentStatus: BriefingStatus;
  statusLabels: Record<BriefingStatus, string>;
}>;

const ALL_STATUSES: BriefingStatus[] = [
  "RECEIVED",
  "IN_ANALYSIS",
  "PROPOSAL_SENT",
  "IN_NEGOTIATION",
  "APPROVED",
  "IN_PROGRESS",
  "DELIVERED",
];

export default function AdminStatusForm({ briefingId, currentStatus, statusLabels }: Props) {
  const [selected, setSelected] = useState<BriefingStatus>(currentStatus);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSave() {
    if (selected === currentStatus) return;
    setError("");
    setSuccess(false);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/briefing/${briefingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selected }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Erro ao actualizar.");
          return;
        }
        setSuccess(true);
        router.refresh();
      } catch {
        setError("Erro de rede. Tente novamente.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Gerir Estado</h2>

      <div className="space-y-2">
        <label className="text-xs text-white/40" htmlFor="status-select">
          Estado do Briefing
        </label>
        <select
          id="status-select"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value as BriefingStatus);
            setSuccess(false);
          }}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-gray-900">
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          Estado actualizado com sucesso.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={isPending || selected === currentStatus}
        className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        {isPending ? "A guardar…" : "Guardar Estado"}
      </button>
    </div>
  );
}
