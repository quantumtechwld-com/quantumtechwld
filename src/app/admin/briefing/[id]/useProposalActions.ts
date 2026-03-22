"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalRow, EditFormData } from "./proposal-types";

export function useProposalActions(briefingId: string, initialProposal: ProposalRow | null) {
  const [proposal, setProposal] = useState<ProposalRow | null>(initialProposal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    summary: "",
    content: "",
    hoursTotal: 0,
    costMin: 0,
    costMax: 0,
  });
  const [rewriting, setRewriting] = useState(false);
  const router = useRouter();

  async function generate(send: boolean) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefingId, send }),
      });
      const data = (await res.json()) as { proposal?: ProposalRow; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao gerar proposta."); return; }
      setProposal(data.proposal ?? null);
      router.refresh();
    } catch {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function startEditing() {
    if (!proposal) return;
    setEditForm({
      summary: proposal.summary,
      content: proposal.content,
      hoursTotal: proposal.hoursTotal,
      costMin: proposal.costMin,
      costMax: proposal.costMax,
    });
    setEditing(true);
    setPreview(false);
  }

  async function saveEdits() {
    if (!proposal) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...editForm }),
      });
      const data = (await res.json()) as { proposal?: ProposalRow; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao guardar alterações."); return; }
      setProposal(data.proposal ?? null);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  async function rewriteWithAI() {
    if (!proposal || !editForm.content.trim()) return;
    setRewriting(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposal.id}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excerpt: editForm.content }),
      });
      const data = (await res.json()) as { rewritten?: string; error?: string };
      if (res.ok && data.rewritten) {
        setEditForm(f => ({ ...f, content: data.rewritten ?? "" }));
      } else {
        setError(data.error ?? "Erro ao reescrever com IA.");
      }
    } catch {
      setError("Erro de rede.");
    } finally {
      setRewriting(false);
    }
  }

  async function sendProposal() {
    if (!proposal) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proposal/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = (await res.json()) as { proposal?: ProposalRow; error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao enviar proposta."); return; }
      setProposal(data.proposal ?? null);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return {
    proposal,
    loading,
    error,
    preview,
    setPreview,
    editing,
    setEditing,
    editForm,
    setEditForm,
    rewriting,
    generate,
    startEditing,
    saveEdits,
    rewriteWithAI,
    sendProposal,
  };
}
