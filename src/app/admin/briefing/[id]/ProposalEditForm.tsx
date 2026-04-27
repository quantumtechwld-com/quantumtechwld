import type { EditFormData } from "./proposal-types";

type Props = Readonly<{
  editForm: EditFormData;
  onChange: React.Dispatch<React.SetStateAction<EditFormData>>;
  onRewrite: () => void;
  rewriting: boolean;
}>;

export default function ProposalEditForm({ editForm, onChange, onRewrite, rewriting }: Props) {
  return (
    <div className="pt-2 border-t border-white/5 space-y-4">
      <div>
        <label htmlFor="edit-summary" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Sumário executivo</label>
        <textarea
          id="edit-summary"
          rows={3}
          value={editForm.summary}
          onChange={e => onChange(f => ({ ...f, summary: e.target.value }))}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 resize-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="edit-hours" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Horas</label>
          <input
            id="edit-hours"
            type="number"
            value={editForm.hoursTotal}
            onChange={e => onChange(f => ({ ...f, hoursTotal: Number(e.target.value) }))}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label htmlFor="edit-cost-min" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Custo mín</label>
          <input
            id="edit-cost-min"
            type="number"
            value={editForm.costMin}
            onChange={e => onChange(f => ({ ...f, costMin: Number(e.target.value) }))}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label htmlFor="edit-cost-max" className="text-xs text-white/30 uppercase tracking-wider block mb-1">Custo máx</label>
          <input
            id="edit-cost-max"
            type="number"
            value={editForm.costMax}
            onChange={e => onChange(f => ({ ...f, costMax: Number(e.target.value) }))}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="edit-content" className="text-xs text-white/30 uppercase tracking-wider">Conteúdo completo da proposta</label>
          <button
            type="button"
            onClick={onRewrite}
            disabled={rewriting}
            className="rounded-lg border border-purple-500/30 px-3 py-1 text-xs text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/10 transition disabled:opacity-40"
          >
            {rewriting ? "A reescrever…" : "✨ Reescrever com IA"}
          </button>
        </div>
        <textarea
          id="edit-content"
          rows={16}
          value={editForm.content}
          onChange={e => onChange(f => ({ ...f, content: e.target.value }))}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80 font-mono placeholder:text-white/20 focus:outline-none focus:border-accent/50 resize-y"
        />
      </div>
    </div>
  );
}
