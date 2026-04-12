"use client";

import { useState, useEffect, useCallback } from "react";

type CommentAuthor = {
  name: string | null;
  email: string;
  role: string;
};

type Comment = {
  id: string;
  excerpt: string;
  body: string;
  resolved: boolean;
  createdAt: string;
  author: CommentAuthor;
};

type Props = Readonly<{
  proposalId: string;
  isAdmin?: boolean;
}>;

export default function ProposalComments({ proposalId, isAdmin }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/proposal/${proposalId}/comments`);
      const data = (await res.json()) as { comments?: Comment[] };
      setComments(data.comments ?? []);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => { void load(); }, [load]);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposalId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excerpt: excerpt.trim(), body: body.trim() }),
      });
      let data: { comment?: Comment; error?: string; detail?: string };
      try {
        data = (await res.json()) as { comment?: Comment; error?: string };
      } catch {
        setError(`Erro do servidor (${res.status}). Tente novamente.`);
        return;
      }
      if (!res.ok) { setError((data.detail ?? data.error) ?? "Erro ao enviar comentário."); return; }
      if (!data.comment) { setError("Resposta inesperada do servidor."); return; }
      const newComment = data.comment;
      setComments(prev => [...prev, newComment]);
      setBody("");
      setExcerpt("");
    } catch (err) {
      console.error("[ProposalComments submit]", err);
      setError("Erro de rede. Verifique a ligação e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resolve(commentId: string) {
    const res = await fetch(`/api/proposal/${proposalId}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (res.ok) {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
    }
  }

  const visible = comments.filter(c => showResolved || !c.resolved);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Comentários
          {comments.length > 0 && (
            <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-xs font-normal">
              {comments.filter(c => !c.resolved).length} abertos
            </span>
          )}
        </h3>
        {comments.some(c => c.resolved) && (
          <button
            type="button"
            onClick={() => setShowResolved(!showResolved)}
            className="text-xs text-white/30 hover:text-white/60 transition"
          >
            {showResolved ? "Ocultar resolvidos" : "Ver resolvidos"}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-white/30">A carregar…</p>
      ) : (
        <div className="space-y-2">
          {visible.length === 0 && (
            <p className="text-xs text-white/25 text-center py-4">
              Nenhum comentário ainda.
            </p>
          )}
          {visible.map(c => (
            <div
              key={c.id}
              className={`rounded-xl border p-4 space-y-2 ${
                c.resolved
                  ? "border-white/5 bg-white/2 opacity-50"
                  : "border-white/10 bg-white/4"
              }`}
            >
              {c.excerpt && (
                <blockquote className="border-l-2 border-accent/40 pl-3 text-xs text-accent-light/50 italic line-clamp-2">
                  {c.excerpt}
                </blockquote>
              )}
              <p className="text-sm text-white/75">{c.body}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${c.author.role === "ADMIN" ? "text-accent" : "text-slate-400"}`}>
                    {c.author.name ?? c.author.email}
                  </span>
                  <span className="text-xs text-white/20">
                    {new Date(c.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                </div>
                {isAdmin && !c.resolved && (
                  <button
                    type="button"
                    onClick={() => void resolve(c.id)}
                    className="text-xs text-white/30 hover:text-emerald-400 transition"
                  >
                    ✓ Resolver
                  </button>
                )}
                {c.resolved && (
                  <span className="text-xs text-emerald-500/50">Resolvido</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de novo comentário */}
      <form onSubmit={(e) => void submit(e)} className="space-y-2 pt-2 border-t border-white/5">
        <div>
          <input
            type="text"
            placeholder="Citar um trecho (opcional)"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/8 px-3 py-1.5 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-accent/40"
          />
        </div>
        <div className="flex gap-2">
          <textarea
            rows={2}
            placeholder="Adicionar comentário…"
            value={body}
            onChange={e => setBody(e.target.value)}
            className="flex-1 rounded-lg bg-white/5 border border-white/8 px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="self-end rounded-lg bg-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/15 hover:text-white transition disabled:opacity-40"
          >
            {submitting ? "…" : "Enviar"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </div>
  );
}
