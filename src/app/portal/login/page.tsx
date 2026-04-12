"use client";

import { useState } from "react";
import { sendMagicLink } from "./actions";
import { MailCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await sendMagicLink(email);
      // Se a server action não redirecionou (modo dev sem SMTP), mostra feedback
      setSent(true);
    } catch (err: unknown) {
      // NEXT_REDIRECT é lançado pelo redirect() do Next.js — não é um erro real
      if (err && typeof err === "object" && "digest" in err) {
        return;
      }
      const msg = err instanceof Error ? err.message : "";
      if (msg === "NOT_FOUND") {
        setErrorMsg(
          "Este email não está registado no portal. Preencha o formulário de contacto para solicitar acesso."
        );
      } else if (msg === "PENDING") {
        setErrorMsg(
          "A sua conta está a aguardar aprovação pelo administrador. Entraremos em contacto brevemente."
        );
      } else if (msg === "SUSPENDED") {
        setErrorMsg(
          "O acesso à sua conta foi suspenso. Entre em contacto com o suporte."
        );
      } else {
        setErrorMsg("Erro ao enviar o link. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur text-center">
        {sent ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
              <MailCheck size={28} className="text-accent-light" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifique o seu e-mail</h1>
            <p className="text-slate-300 text-sm">
              Enviámos um link de acesso para <span className="text-accent-light font-medium">{email}</span>.
              Clique no link para entrar no portal.
            </p>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm uppercase tracking-widest text-accent-light">Portal do Cliente</p>
            <h1 className="mb-1 text-2xl font-bold text-white">Aceder ao portal</h1>
            <p className="mb-6 text-sm text-slate-400">
              Introduza o seu e-mail e enviaremos um link de acesso instantâneo.
            </p>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O seu e-mail"
                className="rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-accent w-full"
              />
              {errorMsg && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {errorMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-accent py-3 font-semibold text-white transition hover:bg-accent-light disabled:opacity-60"
              >
                {loading ? "A enviar..." : "Enviar link de acesso →"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
